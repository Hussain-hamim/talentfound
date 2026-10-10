-- Atomic ordering; callers cannot reorder somebody else's portfolio.
create function public.reorder_projects(project_ids uuid[]) returns void language sql security invoker set search_path='' as $$
 update public.portfolio_projects p set position=x.ordinality::integer-1 from unnest(project_ids) with ordinality as x(id,ordinality) where p.id=x.id and p.owner_id=auth.uid();
$$;
revoke all on function public.reorder_projects(uuid[]) from public,anon;
grant execute on function public.reorder_projects(uuid[]) to authenticated;

create table talentfound_private.analytics_limits (key text not null,window_start timestamptz not null,count integer not null default 1,primary key(key,window_start));
create function talentfound_private.record_event(developer uuid,visitor uuid,visitor_key text,rate_key text,event_kind text,project uuid default null) returns boolean language plpgsql security definer set search_path='' as $$
declare seen integer; identified uuid; begin
 if event_kind not in ('profile_view','project_click') or length(visitor_key)<>64 or length(rate_key)<>64 then return false; end if;
 if visitor=developer or not exists(select 1 from public.developer_profiles where id=developer and published) then return false; end if;
 if event_kind='project_click' and not exists(select 1 from public.portfolio_projects where id=project and owner_id=developer and published) then return false; end if;
 insert into talentfound_private.analytics_limits(key,window_start) values(rate_key,date_trunc('minute',now())) on conflict(key,window_start) do update set count=talentfound_private.analytics_limits.count+1 returning count into seen;
 if seen>60 then return false; end if;
 if exists(select 1 from public.accounts where id=visitor and identify_visits) then identified:=visitor; end if;
 insert into public.analytics_events(developer_id,visitor_id,visitor_hash,kind,project_id,bucket)
 values(developer,identified,visitor_key,event_kind,case when event_kind='project_click' then project else null end,date_bin(interval '30 minutes',now(),'2000-01-01'::timestamptz)) on conflict do nothing;
 return found;
end $$;
create function public.record_profile_event(developer uuid,visitor uuid,visitor_key text,rate_key text,event_kind text,project uuid default null) returns boolean language sql security invoker set search_path='' as $$ select talentfound_private.record_event(developer,visitor,visitor_key,rate_key,event_kind,project) $$;
revoke all on function talentfound_private.record_event(uuid,uuid,text,text,text,uuid),public.record_profile_event(uuid,uuid,text,text,text,uuid) from public,anon,authenticated;
grant execute on function talentfound_private.record_event(uuid,uuid,text,text,text,uuid),public.record_profile_event(uuid,uuid,text,text,text,uuid) to service_role;

-- Enforce media ownership even when bypassing the application and using the Data API.
create function talentfound_private.check_media_path() returns trigger language plpgsql set search_path='' as $$ begin
 if tg_table_name='portfolio_projects' then
  if new.image_path is not null and split_part(new.image_path,'/',1)<>new.owner_id::text then raise exception 'Image must belong to the project owner'; end if;
 else
  if new.avatar_path is not null and split_part(new.avatar_path,'/',1)<>new.id::text then raise exception 'Avatar must belong to this member'; end if;
 end if;
 return new;
end $$;
create trigger talentfound_project_media before insert or update on public.portfolio_projects for each row execute function talentfound_private.check_media_path();
create trigger talentfound_member_media before insert or update on public.members for each row execute function talentfound_private.check_media_path();
revoke all on function talentfound_private.check_media_path() from public,anon,authenticated;

-- Freeze each email batch before contacting the provider. Retries use its stable UUID.
create function talentfound_private.claim_notifications() returns jsonb language plpgsql security definer set search_path='' as $$
declare group_row record; batch uuid; result jsonb; begin
 perform pg_advisory_xact_lock(hashtextextended('talentfound:notifications',0));
 delete from public.analytics_events where created_at<now()-interval '90 days';
 delete from talentfound_private.analytics_limits where window_start<now()-interval '1 day';
 update talentfound_private.notification_jobs j set delivered_at=now(),last_error='Skipped: read, muted, blocked, or unavailable'
 from public.conversations c,public.accounts a,auth.users u
 where j.conversation_id=c.id and a.id=j.recipient_id and u.id=a.id and j.delivered_at is null and j.batch_id is null
 and (not a.email_notifications or u.email_confirmed_at is null or u.banned_until>now() or talentfound_private.blocked(c.member_a,c.member_b) or exists(select 1 from public.conversation_reads r join public.messages m on m.id=j.message_id where r.conversation_id=j.conversation_id and r.member_id=j.recipient_id and r.read_at>=m.created_at));
 for group_row in
 select j.conversation_id,j.recipient_id from talentfound_private.notification_jobs j
 where j.delivered_at is null and j.batch_id is null and j.due_at<=now()
 and not exists(select 1 from talentfound_private.notification_batches b where b.recipient_id=j.recipient_id and b.conversation_id=j.conversation_id and (b.created_at>now()-interval '15 minutes' or b.delivered_at>now()-interval '15 minutes' or b.status='pending'))
 group by j.conversation_id,j.recipient_id limit 20
 loop
  batch:=gen_random_uuid();
  insert into talentfound_private.notification_batches(id,conversation_id,recipient_id,payload)
  select batch,group_row.conversation_id,group_row.recipient_id,jsonb_build_object('to',u.email,'conversation',group_row.conversation_id,'messages',jsonb_agg(jsonb_build_object('id',m.id,'sender',sender.name,'body',m.body,'brief',i.brief) order by m.created_at,m.id))
  from (select * from talentfound_private.notification_jobs where conversation_id=group_row.conversation_id and recipient_id=group_row.recipient_id and delivered_at is null and batch_id is null order by due_at limit 20) j
  join public.messages m on m.id=j.message_id join public.members sender on sender.id=m.sender_id join auth.users u on u.id=j.recipient_id left join public.invitations i on i.id=m.invitation_id group by u.email;
  update talentfound_private.notification_jobs j set batch_id=batch where j.message_id in (select (x->>'id')::uuid from talentfound_private.notification_batches b,jsonb_array_elements(b.payload->'messages') x where b.id=batch);
 end loop;
 -- Do not blindly retry beyond the provider's 24-hour deduplication window.
 update talentfound_private.notification_batches set status='failed',last_error='Delivery needs operator review; retry window exceeded' where status='pending' and (created_at<now()-interval '23 hours' or attempts>=5);
 with claimed as (
  update talentfound_private.notification_batches b set locked_until=now()+interval '2 minutes',attempts=attempts+1
  where b.id in (select id from talentfound_private.notification_batches where status='pending' and next_attempt_at<=now() and (locked_until is null or locked_until<now()) order by created_at limit 20 for update skip locked)
  returning b.id,b.payload
 ) select coalesce(jsonb_agg(claimed),'[]'::jsonb) into result from claimed;
 return result;
end $$;
create function talentfound_private.notification_allowed(batch uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare allowed boolean; begin
 select a.email_notifications and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=now()) and not talentfound_private.blocked(c.member_a,c.member_b)
 and exists(select 1 from talentfound_private.notification_jobs j join public.messages m on m.id=j.message_id where j.batch_id=b.id and m.created_at>coalesce((select read_at from public.conversation_reads where conversation_id=c.id and member_id=a.id),'1970-01-01'::timestamptz))
 into allowed from talentfound_private.notification_batches b join public.accounts a on a.id=b.recipient_id join auth.users u on u.id=a.id join public.conversations c on c.id=b.conversation_id where b.id=batch and b.status='pending';
 if not coalesce(allowed,false) then
 update talentfound_private.notification_batches set status='skipped',locked_until=null where id=batch;
 update talentfound_private.notification_jobs set delivered_at=now(),last_error='Skipped before sending' where batch_id=batch;
 end if;
 return coalesce(allowed,false);
end $$;
create function talentfound_private.finish_notification(batch uuid,success boolean,failure text default null) returns void language plpgsql security definer set search_path='' as $$ begin
 update talentfound_private.notification_batches set status=case when success then 'delivered' else 'pending' end,delivered_at=case when success then now() else null end,last_error=left(failure,500),locked_until=null,next_attempt_at=now()+make_interval(mins=>least(60,power(3,attempts)::int)) where id=batch and status='pending';
 if success then update talentfound_private.notification_jobs set delivered_at=now() where batch_id=batch; end if;
end $$;
create function public.claim_notification_batches() returns jsonb language sql security invoker set search_path='' as $$select talentfound_private.claim_notifications()$$;
create function public.notification_batch_allowed(batch uuid) returns boolean language sql security invoker set search_path='' as $$select talentfound_private.notification_allowed(batch)$$;
create function public.finish_notification_batch(batch uuid,success boolean,failure text default null) returns void language sql security invoker set search_path='' as $$select talentfound_private.finish_notification(batch,success,failure)$$;
revoke all on function talentfound_private.claim_notifications(),talentfound_private.notification_allowed(uuid),talentfound_private.finish_notification(uuid,boolean,text),public.claim_notification_batches(),public.notification_batch_allowed(uuid),public.finish_notification_batch(uuid,boolean,text) from public,anon,authenticated;
grant execute on function talentfound_private.claim_notifications(),talentfound_private.notification_allowed(uuid),talentfound_private.finish_notification(uuid,boolean,text),public.claim_notification_batches(),public.notification_batch_allowed(uuid),public.finish_notification_batch(uuid,boolean,text) to service_role;

-- Scheduling remains inert until a verified sending domain and Resend are configured.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create function talentfound_private.dispatch_notifications() returns void language plpgsql security definer set search_path='' as $$
declare enabled text; token text; begin
 select decrypted_secret into enabled from vault.decrypted_secrets where name='talentfound_notifications_enabled' limit 1;
 if enabled is distinct from 'true' then return; end if;
 select decrypted_secret into token from vault.decrypted_secrets where name='talentfound_notifications_cron_secret' limit 1;
 if token is null then return; end if;
 perform net.http_post(url:='https://zgpqyctyxozsvbjayhaf.supabase.co/functions/v1/talentfound-notifications',headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',token),body:='{}'::jsonb,timeout_milliseconds:=30000);
end $$;
revoke all on function talentfound_private.dispatch_notifications() from public,anon,authenticated;
select cron.schedule('talentfound-notifications','* * * * *','select talentfound_private.dispatch_notifications();');
select cron.schedule('talentfound-analytics-retention','17 3 * * *',$$delete from public.analytics_events where created_at<now()-interval '90 days'; delete from talentfound_private.analytics_limits where window_start<now()-interval '1 day';$$);
