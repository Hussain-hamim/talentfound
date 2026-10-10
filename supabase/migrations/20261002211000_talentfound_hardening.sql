-- Preserve legacy signup trigger while removing unnecessary RPC execution grants.
revoke execute on function public.handle_new_user() from public,anon,authenticated;

create or replace function talentfound_private.send_message(recipient uuid,body text,client_id uuid,opportunity uuid default null) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); cid uuid; existing public.messages; inv uuid; brief jsonb; contacts integer;
begin
 if not talentfound_private.onboarded() then raise exception 'Complete your profile before sending messages'; end if;
 if recipient=uid or not exists(select 1 from public.members where id=recipient) then raise exception 'Recipient unavailable'; end if;
 if talentfound_private.blocked(uid,recipient) then raise exception 'This conversation is blocked'; end if;
 if length(trim(body)) not between 1 and 4000 then raise exception 'Messages must be 1–4000 characters'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select * into existing from public.messages where id=client_id;
 if found then
  if existing.sender_id<>uid or not exists(select 1 from public.conversations where id=existing.conversation_id and recipient in (member_a,member_b)) then raise exception 'Invalid message identifier'; end if;
  if existing.body<>trim(body) or opportunity is distinct from (select opportunity_id from public.invitations where id=existing.invitation_id) then raise exception 'Retry must use the original message'; end if;
  return existing.conversation_id;
 end if;
 if (select count(*) from public.messages where sender_id=uid and created_at>now()-interval '1 minute')>=coalesce(nullif(current_setting('app.messages_per_minute',true),'')::integer,30) then raise exception 'Please wait a minute before sending more messages'; end if;
 select id into cid from public.conversations where member_a=least(uid,recipient) and member_b=greatest(uid,recipient);
 if cid is null then
  select count(*) into contacts from public.conversations c where uid in(c.member_a,c.member_b) and c.created_at>date_trunc('day',now()) and (select sender_id from public.messages where conversation_id=c.id order by created_at,id limit 1)=uid;
  if contacts>=coalesce(nullif(current_setting('app.contacts_per_day',true),'')::integer,10) then raise exception 'Daily new-contact limit reached. Continue your existing conversations or return tomorrow'; end if;
  insert into public.conversations(member_a,member_b) values(least(uid,recipient),greatest(uid,recipient)) on conflict(member_a,member_b) do nothing;
  select id into cid from public.conversations where member_a=least(uid,recipient) and member_b=greatest(uid,recipient);
 end if;
 if opportunity is not null then
  select to_jsonb(o)-'owner_id' into brief from public.opportunities o where id=opportunity and owner_id=uid and status='active';
  if brief is null then raise exception 'Choose an active opportunity you own'; end if;
  insert into public.invitations(conversation_id,sender_id,recipient_id,opportunity_id,brief) values(cid,uid,recipient,opportunity,brief) returning id into inv;
 end if;
 insert into public.messages(id,conversation_id,sender_id,body,invitation_id) values(client_id,cid,uid,trim(body),inv);
 insert into talentfound_private.notification_jobs(conversation_id,recipient_id,message_id) values(cid,recipient,client_id);
 return cid;
end $$;

create or replace function public.search_developers(filters jsonb default '{}') returns jsonb language sql stable security invoker set search_path='' as $$
with source as (
 select d.*,to_jsonb(m) member,
 coalesce((select jsonb_agg(p order by p.position,p.created_at) from public.portfolio_projects p where p.owner_id=d.id and p.published),'[]'::jsonb) projects,
 (select count(*) from public.reviews r where r.developer_id=d.id) "reviewCount",
 coalesce((select avg(rating)::numeric(3,2) from public.reviews r where r.developer_id=d.id),0) rating,
 coalesce((select (sum(rating)+20.0)/(count(*)+5) from public.reviews r where r.developer_id=d.id having count(*)>0),0) score,
 to_tsvector('simple',concat_ws(' ',m.name,d.headline,d.bio,array_to_string(d.skills,' '),(select string_agg(concat_ws(' ',p.title,p.description,array_to_string(p.stack,' ')),' ') from public.portfolio_projects p where p.owner_id=d.id and p.published))) document
 from public.developer_profiles d join public.members m on m.id=d.id where d.published
), matched as (
 select s.*,ts_rank(s.document,websearch_to_tsquery('simple',coalesce(filters->>'q',''))) relevance from source s
 where (coalesce(filters->>'q','')='' or s.document@@websearch_to_tsquery('simple',filters->>'q'))
 and (coalesce(filters->>'category','')='' or s.category=filters->>'category')
 and (coalesce(filters->>'location','')='' or s.location ilike '%'||(filters->>'location')||'%')
 and (coalesce(filters->>'engagement','')='' or filters->>'engagement'=any(s.engagements))
 and (coalesce(filters->>'availability','')='' or s.availability=filters->>'availability')
 and (coalesce((filters->>'experience')::int,0)=0 or s.experience_years>=(filters->>'experience')::int)
 and (coalesce((filters->>'hours')::int,0)=0 or s.hours_per_week>=(filters->>'hours')::int)
 and (coalesce(filters->>'start','')='' or s.start_weeks<=(filters->>'start')::int)
 and (coalesce((filters->>'budget')::numeric,0)=0 or filters->>'engagement'='Co-founder' or case when filters->>'engagement'='Full-time' then s.salary_usd else s.hourly_usd end<=(filters->>'budget')::numeric)
 and (coalesce(filters->>'overlap','')='' or least(s.utc_end,case filters->>'overlap' when 'Europe' then 17 when 'Americas' then 21 else 13 end)-greatest(s.utc_start,case filters->>'overlap' when 'Europe' then 9 when 'Americas' then 13 else 5 end)>=4)
), page as (
 select * from matched order by
 case when filters->>'sort'='top-rated' then score end desc nulls last,
 case when coalesce(filters->>'sort','relevance')='relevance' then relevance end desc nulls last,
 created_at desc,id
 limit 12 offset (greatest(1,least(10000,coalesce((filters->>'page')::int,1)))-1)*12
)
select jsonb_build_object('total',(select count(*) from matched),'people',coalesce((select jsonb_agg(to_jsonb(page)-'document'-'relevance') from page),'[]'::jsonb))
$$;

create or replace function talentfound_private.record_event(developer uuid,visitor uuid,visitor_key text,rate_key text,event_kind text,project uuid default null) returns boolean language plpgsql security definer set search_path='' as $$
declare seen integer; identified uuid; begin
 if event_kind not in ('profile_view','project_click') or length(visitor_key)<>64 or length(rate_key)<>64 then return false; end if;
 if visitor=developer or not exists(select 1 from public.developer_profiles where id=developer and published) then return false; end if;
 if event_kind='project_click' and not exists(select 1 from public.portfolio_projects where id=project and owner_id=developer and published) then return false; end if;
 insert into talentfound_private.analytics_limits(key,window_start) values(rate_key,date_trunc('minute',now())) on conflict(key,window_start) do update set count=talentfound_private.analytics_limits.count+1 returning count into seen;
 if seen>60 then return false; end if;
 if exists(select 1 from public.accounts where id=visitor and identify_visits) then identified:=visitor; end if;
 perform pg_advisory_xact_lock(hashtextextended(developer::text||visitor_key||event_kind||coalesce(project::text,''),0));
 if exists(select 1 from public.analytics_events e where e.developer_id=developer and e.visitor_hash=visitor_key and e.kind=event_kind and e.project_id is not distinct from (case when event_kind='project_click' then project else null end) and e.created_at>now()-interval '30 minutes') then return false; end if;
 insert into public.analytics_events(developer_id,visitor_id,visitor_hash,kind,project_id,bucket)
 values(developer,identified,visitor_key,event_kind,case when event_kind='project_click' then project else null end,date_bin(interval '30 minutes',now(),'2000-01-01'::timestamptz)) on conflict do nothing;
 return found;
end $$;

create or replace function talentfound_private.notification_allowed(batch uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare allowed boolean; begin
 select u.email=b.payload->>'to' and a.email_notifications and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=now()) and not talentfound_private.blocked(c.member_a,c.member_b)
 and exists(select 1 from talentfound_private.notification_jobs j join public.messages m on m.id=j.message_id where j.batch_id=b.id and m.created_at>coalesce((select read_at from public.conversation_reads where conversation_id=c.id and member_id=a.id),'1970-01-01'::timestamptz))
 into allowed from talentfound_private.notification_batches b join public.accounts a on a.id=b.recipient_id join auth.users u on u.id=a.id join public.conversations c on c.id=b.conversation_id where b.id=batch and b.status='pending';
 if not coalesce(allowed,false) then
 update talentfound_private.notification_batches set status='skipped',locked_until=null where id=batch;
 update talentfound_private.notification_jobs set delivered_at=now(),last_error='Skipped before sending' where batch_id=batch;
 end if;
 return coalesce(allowed,false);
end $$;
