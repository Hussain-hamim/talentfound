-- Small invalidation records avoid broadcasting private source rows or DELETE payloads.
create table public.realtime_signals (
 scope text primary key,
 owner_id uuid references public.members on delete cascade,
 revision bigint not null default 1,
 updated_at timestamptz not null default now(),
 check ((scope='discovery' and owner_id is null) or scope='member:'||owner_id::text)
);
alter table public.realtime_signals enable row level security;
revoke all on public.realtime_signals from anon, authenticated;
grant select on public.realtime_signals to anon, authenticated;
create policy signal_read on public.realtime_signals for select using (
 (scope='discovery' and owner_id is null) or owner_id=(select auth.uid())
);

create table public.notifications (
 id uuid primary key default gen_random_uuid(),
 recipient_id uuid not null references public.members on delete cascade,
 actor_id uuid not null references public.members on delete cascade,
 kind text not null check(kind in ('message','invitation','invitation_response','review','review_reply')),
 source_key text not null,
 conversation_id uuid references public.conversations on delete cascade,
 developer_id uuid references public.developer_profiles on delete cascade,
 title text not null,
 body text not null default '',
 created_at timestamptz not null default now(),
 read_at timestamptz,
 unique(recipient_id,source_key),
 check(recipient_id<>actor_id)
);
create index notifications_inbox on public.notifications(recipient_id,created_at desc,id desc);
create index notifications_unread on public.notifications(recipient_id) where read_at is null;
alter table public.notifications enable row level security;
revoke all on public.notifications from anon,authenticated;
grant select on public.notifications to authenticated;
grant update(read_at) on public.notifications to authenticated;
create function talentfound_private.can_read_notification(recipient uuid,actor uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select recipient=auth.uid() and not talentfound_private.blocked(recipient,actor)
$$;
revoke all on function talentfound_private.can_read_notification(uuid,uuid) from public,anon;
grant execute on function talentfound_private.can_read_notification(uuid,uuid) to authenticated;
create policy notification_read on public.notifications for select to authenticated using (
 talentfound_private.can_read_notification(recipient_id,actor_id)
);
create policy notification_update on public.notifications for update to authenticated using (
 talentfound_private.can_read_notification(recipient_id,actor_id)
) with check (recipient_id=(select auth.uid()));

create function talentfound_private.signal_change(target uuid default null) returns void
language plpgsql security definer set search_path='' as $$
begin
 if target is not null and not exists(select 1 from public.members where id=target) then return; end if;
 insert into public.realtime_signals(scope,owner_id) values(case when target is null then 'discovery' else 'member:'||target::text end,target)
 on conflict(scope) do update set revision=public.realtime_signals.revision+1,updated_at=clock_timestamp();
end $$;

create function talentfound_private.emit_live_change() returns trigger
language plpgsql security definer set search_path='' as $$
declare r jsonb; prev jsonb; owner uuid; peer uuid; dev uuid; is_public boolean:=false;
begin
 r:=case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;
 prev:=case when tg_op='INSERT' then '{}'::jsonb else to_jsonb(old) end;
 if tg_op='UPDATE' and r=prev then return new; end if;
 case tg_table_name
 when 'members','accounts','developer_profiles','recruiter_profiles' then
  owner:=(r->>'id')::uuid;
  if tg_table_name='developer_profiles' then
   is_public:=coalesce((r->>'published')::boolean,false) or coalesce((prev->>'published')::boolean,false);
  elsif tg_table_name='members' then
   is_public:=exists(select 1 from public.developer_profiles where id=owner and published);
  end if;
 when 'portfolio_projects' then
  owner:=(r->>'owner_id')::uuid;
  is_public:=(coalesce((r->>'published')::boolean,false) or coalesce((prev->>'published')::boolean,false)) and exists(select 1 from public.developer_profiles where id=owner and published);
 when 'opportunities','shortlists','candidates','saved_searches' then owner:=(r->>'owner_id')::uuid;
 when 'blocks' then owner:=(r->>'owner_id')::uuid; peer:=(r->>'blocked_id')::uuid;
 when 'conversations' then owner:=(r->>'member_a')::uuid; peer:=(r->>'member_b')::uuid;
 when 'messages','invitations' then
  select member_a,member_b into owner,peer from public.conversations where id=(r->>'conversation_id')::uuid;
 when 'conversation_reads' then owner:=(r->>'member_id')::uuid;
 when 'notifications' then owner:=(r->>'recipient_id')::uuid;
 when 'analytics_events' then owner:=(r->>'developer_id')::uuid;
 when 'reviews' then owner:=(r->>'developer_id')::uuid; peer:=(r->>'reviewer_id')::uuid; is_public:=true;
 when 'review_replies' then owner:=(r->>'developer_id')::uuid; is_public:=true;
 else null;
 end case;
 if is_public then perform talentfound_private.signal_change(null); end if;
 -- Stable lock ordering for paired member invalidations.
 if owner is not null and peer is not null then
  perform talentfound_private.signal_change(least(owner,peer));
  perform talentfound_private.signal_change(greatest(owner,peer));
 elsif owner is not null then perform talentfound_private.signal_change(owner);
 end if;
 return coalesce(new,old);
end $$;

do $$ declare t text; begin
 foreach t in array array['members','accounts','developer_profiles','recruiter_profiles','portfolio_projects','opportunities','shortlists','candidates','saved_searches','blocks','conversations','messages','invitations','conversation_reads','notifications','reviews','review_replies'] loop
 execute format('create trigger talentfound_live_change after insert or update or delete on public.%I for each row execute function talentfound_private.emit_live_change()',t);
 end loop;
end $$;
create trigger talentfound_live_change after insert on public.analytics_events for each row execute function talentfound_private.emit_live_change();

create function talentfound_private.create_in_app_notification() returns trigger
language plpgsql security definer set search_path='' as $$
declare recipient uuid; actor uuid; cid uuid; dev uuid; event_kind text; source text; heading text; preview text; actor_name text;
begin
 if tg_table_name='messages' then
  actor:=new.sender_id; cid:=new.conversation_id;
  select case when member_a=actor then member_b else member_a end into recipient from public.conversations where id=cid;
  event_kind:=case when new.invitation_id is null then 'message' else 'invitation' end;
  source:='message:'||new.id::text;
  heading:=case when new.invitation_id is null then 'sent you a message' else 'invited you to a project' end;
  preview:=left(new.body,240);
 elsif tg_table_name='invitations' then
  if new.status=old.status then return new; end if;
  actor:=case when new.status='withdrawn' then new.sender_id else new.recipient_id end;
  recipient:=case when new.status='withdrawn' then new.recipient_id else new.sender_id end;
  cid:=new.conversation_id; event_kind:='invitation_response';
  source:='invitation:'||new.id::text||':'||new.status;
  heading:=new.status||' your project invitation'; preview:=left(new.brief->>'title',240);
 elsif tg_table_name='reviews' then
  actor:=new.reviewer_id; recipient:=new.developer_id; dev:=new.developer_id;
  event_kind:='review'; source:='review:'||new.id::text; heading:='left a community review'; preview:=left(new.body,240);
 elsif tg_table_name='review_replies' then
  actor:=new.developer_id; dev:=new.developer_id;
  select reviewer_id into recipient from public.reviews where id=new.review_id;
  event_kind:='review_reply'; source:='reply:'||new.review_id::text; heading:='replied to your community review'; preview:=left(new.body,240);
 end if;
 if recipient is null or actor=recipient or talentfound_private.blocked(actor,recipient) then return new; end if;
 if not exists(select 1 from auth.users where id=recipient and (banned_until is null or banned_until<=now())) then return new; end if;
 select name into actor_name from public.members where id=actor;
 insert into public.notifications(recipient_id,actor_id,kind,source_key,conversation_id,developer_id,title,body)
 values(recipient,actor,event_kind,source,cid,dev,coalesce(actor_name,'A member')||' '||heading,coalesce(preview,''))
 on conflict(recipient_id,source_key) do nothing;
 return new;
end $$;
create trigger talentfound_notify_message after insert on public.messages for each row execute function talentfound_private.create_in_app_notification();
create trigger talentfound_notify_invitation after update of status on public.invitations for each row execute function talentfound_private.create_in_app_notification();
create trigger talentfound_notify_review after insert on public.reviews for each row execute function talentfound_private.create_in_app_notification();
create trigger talentfound_notify_reply after insert on public.review_replies for each row execute function talentfound_private.create_in_app_notification();

create function talentfound_private.read_conversation_notifications() returns trigger
language plpgsql security definer set search_path='' as $$ begin
 update public.notifications set read_at=new.read_at where recipient_id=new.member_id and conversation_id=new.conversation_id and read_at is null and created_at<=new.read_at and kind in ('message','invitation');
 return new;
end $$;
create trigger talentfound_read_notifications after insert or update on public.conversation_reads for each row execute function talentfound_private.read_conversation_notifications();
revoke all on function talentfound_private.signal_change(uuid),talentfound_private.emit_live_change(),talentfound_private.create_in_app_notification(),talentfound_private.read_conversation_notifications() from public,anon,authenticated;
insert into public.realtime_signals(scope) values('discovery');
insert into public.realtime_signals(scope,owner_id) select 'member:'||id::text,id from public.members;
alter publication supabase_realtime add table public.realtime_signals,public.notifications;
