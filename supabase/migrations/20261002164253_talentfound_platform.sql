-- TalentFound: public identities, private workspaces, and authorized transactions.
create schema if not exists talentfound_private;
revoke all on schema talentfound_private from public;
grant usage on schema talentfound_private to authenticated, service_role;

create table public.members (
 id uuid primary key references auth.users on delete cascade,
 name text not null check (length(name) between 1 and 100),
 avatar_path text, created_at timestamptz not null default now()
);
create table public.accounts (
 id uuid primary key references public.members on delete cascade,
 active_workspace text not null default 'developer' check (active_workspace in ('developer','recruiter')),
 email_notifications boolean not null default true,
 identify_visits boolean not null default false
);
create table public.developer_profiles (
 id uuid primary key references public.members on delete cascade,
 handle text unique not null check(handle ~ '^[a-z0-9][a-z0-9-]{2,49}$'),
 headline text not null check(length(headline) between 1 and 120),
 bio text not null default '' check(length(bio)<=3000),
 location text not null, timezone text not null,
 category text not null default 'Full-stack', skills text[] not null default '{}',
 experience_years integer check(experience_years between 0 and 70),
 availability text not null default 'Open to conversations',
 engagements text[] not null default '{Freelance}', work_style text not null default 'Remote',
 hours_per_week integer check(hours_per_week between 0 and 168),
 start_weeks integer check(start_weeks between 0 and 104),
 utc_start integer check(utc_start between 0 and 23), utc_end integer check(utc_end between 1 and 24),
 hourly_usd numeric check(hourly_usd >= 0), salary_usd numeric check(salary_usd >= 0),
 website text not null default '', github text not null default '', linkedin text not null default '',
 published boolean not null default true, created_at timestamptz not null default now(),
 check(cardinality(skills)<=30), check(utc_end is null or utc_start is null or utc_end>utc_start)
);
create table public.recruiter_profiles (
 id uuid primary key references public.members on delete cascade,
 company text not null check(length(company) between 1 and 120),
 intent text not null default 'Hiring', bio text not null default '' check(length(bio)<=3000)
);
create table public.portfolio_projects (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.developer_profiles on delete cascade,
 title text not null check(length(title) between 1 and 120), description text not null default '' check(length(description)<=4000),
 contribution text not null default '' check(length(contribution)<=2000), stack text[] not null default '{}',
 live_url text not null default '', repository_url text not null default '', image_path text,
 published boolean not null default false, position integer not null default 0, created_at timestamptz not null default now()
);
create table public.opportunities (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.members on delete cascade,
 title text not null check(length(title) between 1 and 120), engagement text not null check(engagement in ('Freelance','Full-time','Co-founder')),
 company text not null, description text not null check(length(description) between 20 and 4000),
 requirements text not null default '', budget text not null default '', timeline text not null default '',
 status text not null default 'active' check(status in ('draft','active','closed')), created_at timestamptz not null default now()
);
create table public.shortlists (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.members on delete cascade,
 name text not null check(length(name) between 1 and 100), created_at timestamptz not null default now()
);
create table public.candidates (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.members on delete cascade,
 developer_id uuid not null references public.developer_profiles on delete cascade,
 shortlist_id uuid references public.shortlists on delete set null, opportunity_id uuid references public.opportunities on delete set null,
 stage text not null default 'shortlisted' check(stage in ('shortlisted','contacted','interested','hired','closed')),
 notes text not null default '' check(length(notes)<=5000), created_at timestamptz not null default now(), unique(owner_id,developer_id)
);
create table public.saved_searches (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.members on delete cascade,
 name text not null check(length(name) between 1 and 100), filters jsonb not null default '{}', created_at timestamptz not null default now()
);
create table public.blocks (
 owner_id uuid not null references public.members on delete cascade, blocked_id uuid not null references public.members on delete cascade,
 created_at timestamptz not null default now(), primary key(owner_id,blocked_id), check(owner_id<>blocked_id)
);
create table public.conversations (
 id uuid primary key default gen_random_uuid(), member_a uuid not null references public.members on delete cascade,
 member_b uuid not null references public.members on delete cascade, created_at timestamptz not null default now(),
 unique(member_a,member_b), check(member_a<member_b)
);
create table public.conversation_reads (
 conversation_id uuid not null references public.conversations on delete cascade, member_id uuid not null references public.members on delete cascade,
 read_at timestamptz not null default now(), primary key(conversation_id,member_id)
);
create table public.invitations (
 id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations on delete cascade,
 sender_id uuid not null references public.members on delete cascade, recipient_id uuid not null references public.members on delete cascade,
 opportunity_id uuid references public.opportunities on delete set null, brief jsonb not null,
 status text not null default 'pending' check(status in ('pending','accepted','declined','withdrawn')), created_at timestamptz not null default now()
);
create table public.messages (
 id uuid primary key, conversation_id uuid not null references public.conversations on delete cascade,
 sender_id uuid not null references public.members on delete cascade,
 body text not null check(length(body) between 1 and 4000), invitation_id uuid references public.invitations on delete set null,
 created_at timestamptz not null default now()
);
create table public.reviews (
 id uuid primary key default gen_random_uuid(), reviewer_id uuid not null references public.members on delete cascade,
 developer_id uuid not null references public.developer_profiles on delete cascade,
 rating integer not null check(rating between 1 and 5), body text not null check(length(body) between 10 and 2000),
 created_at timestamptz not null default now(), unique(reviewer_id,developer_id), check(reviewer_id<>developer_id)
);
create table public.review_replies (
 review_id uuid primary key references public.reviews on delete cascade, developer_id uuid not null references public.developer_profiles on delete cascade,
 body text not null check(length(body) between 1 and 2000), created_at timestamptz not null default now()
);
create table public.reports (
 id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.members on delete cascade,
 target_type text not null check(target_type in ('member','review','message')), target_id uuid not null,
 reason text not null check(length(reason) between 10 and 2000), created_at timestamptz not null default now()
);
create table public.analytics_events (
 id bigint generated always as identity primary key, developer_id uuid not null references public.developer_profiles on delete cascade,
 visitor_id uuid references public.members on delete set null, visitor_hash text not null,
 kind text not null check(kind in ('profile_view','project_click')), project_id uuid references public.portfolio_projects on delete cascade,
 bucket timestamptz not null, created_at timestamptz not null default now()
);
create unique index analytics_dedupe on public.analytics_events(developer_id,visitor_hash,kind,coalesce(project_id,'00000000-0000-0000-0000-000000000000'),bucket);
create table talentfound_private.notification_jobs (
 id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations on delete cascade,
 recipient_id uuid not null references public.members on delete cascade, message_id uuid not null unique references public.messages on delete cascade,
 due_at timestamptz not null default now()+interval '5 minutes', delivered_at timestamptz,
 batch_id uuid, attempts integer not null default 0, last_error text
);
create table talentfound_private.notification_batches (
 id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations on delete cascade,
 recipient_id uuid not null references public.members on delete cascade, payload jsonb not null,
 created_at timestamptz not null default now(), delivered_at timestamptz, status text not null default 'pending', attempts integer not null default 0,
 locked_until timestamptz, next_attempt_at timestamptz not null default now(), last_error text
);

create index projects_owner on public.portfolio_projects(owner_id,position);
create index messages_conversation on public.messages(conversation_id,created_at,id);
create index messages_sender_time on public.messages(sender_id,created_at);
create index developer_skills on public.developer_profiles using gin(skills);
create index reviews_developer on public.reviews(developer_id);
create index invitations_recipient on public.invitations(recipient_id,created_at);
create index analytics_owner_time on public.analytics_events(developer_id,created_at);
create index candidate_owner on public.candidates(owner_id);

create function talentfound_private.verified() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null)
$$;
create function talentfound_private.onboarded() returns boolean language sql stable security definer set search_path='' as $$
 select talentfound_private.verified() and (exists(select 1 from public.developer_profiles where id=auth.uid()) or exists(select 1 from public.recruiter_profiles where id=auth.uid()))
$$;
create function talentfound_private.blocked(a uuid,b uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.blocks where (owner_id=a and blocked_id=b) or (owner_id=b and blocked_id=a))
$$;
create function talentfound_private.participant(cid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.conversations where id=cid and auth.uid() in (member_a,member_b))
$$;

-- Every exposed table uses RLS. Private jobs are only accessible through service functions.
do $$ declare t text; begin
 foreach t in array array['members','accounts','developer_profiles','recruiter_profiles','portfolio_projects','opportunities','shortlists','candidates','saved_searches','blocks','conversations','conversation_reads','invitations','messages','reviews','review_replies','reports','analytics_events'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 end loop;
end $$;
create policy member_read on public.members for select using (true);
create policy member_update on public.members for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy account_read on public.accounts for select to authenticated using(id=auth.uid());
create policy account_update on public.accounts for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy dev_read on public.developer_profiles for select using(published or id=auth.uid());
create policy dev_update on public.developer_profiles for update to authenticated using(id=auth.uid() and talentfound_private.verified()) with check(id=auth.uid());
create policy recruiter_read on public.recruiter_profiles for select to authenticated using(true);
create policy recruiter_update on public.recruiter_profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy project_read on public.portfolio_projects for select using(owner_id=auth.uid() or (published and exists(select 1 from public.developer_profiles d where d.id=owner_id and d.published)));
create policy project_write on public.portfolio_projects for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid() and talentfound_private.onboarded());
do $$ declare t text; begin
 foreach t in array array['opportunities','shortlists','saved_searches','blocks'] loop
 execute format('create policy owner_access on public.%I for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid() and talentfound_private.onboarded())',t);
 end loop;
end $$;
create policy candidate_access on public.candidates for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid() and talentfound_private.onboarded() and (shortlist_id is null or exists(select 1 from public.shortlists s where s.id=shortlist_id and s.owner_id=auth.uid())) and (opportunity_id is null or exists(select 1 from public.opportunities o where o.id=opportunity_id and o.owner_id=auth.uid())));
create policy conversation_read on public.conversations for select to authenticated using(auth.uid() in (member_a,member_b));
create policy read_access on public.conversation_reads for select to authenticated using(member_id=auth.uid());
create policy invitation_read on public.invitations for select to authenticated using(auth.uid() in (sender_id,recipient_id));
create policy message_read on public.messages for select to authenticated using(talentfound_private.participant(conversation_id));
create policy reviews_read on public.reviews for select using(exists(select 1 from public.developer_profiles where id=developer_id and published));
create policy reviews_write on public.reviews for all to authenticated using(reviewer_id=auth.uid()) with check(reviewer_id=auth.uid() and developer_id<>auth.uid() and talentfound_private.verified() and exists(select 1 from public.developer_profiles where id=developer_id and published));
create policy replies_read on public.review_replies for select using(exists(select 1 from public.reviews where id=review_id));
create policy replies_write on public.review_replies for all to authenticated using(developer_id=auth.uid()) with check(developer_id=auth.uid() and talentfound_private.verified() and exists(select 1 from public.reviews where id=review_id and developer_id=auth.uid()));
create policy reports_insert on public.reports for insert to authenticated with check(reporter_id=auth.uid() and talentfound_private.verified());
-- Raw analytics never expose visitor IDs/hashes to clients. Aggregation is an owner-checked RPC.
grant select on public.members,public.developer_profiles,public.portfolio_projects,public.reviews,public.review_replies to anon,authenticated;
grant select on public.accounts,public.recruiter_profiles,public.opportunities,public.shortlists,public.candidates,public.saved_searches,public.blocks,public.conversations,public.conversation_reads,public.invitations,public.messages to authenticated;
grant update(name,avatar_path) on public.members to authenticated;
grant update(active_workspace,email_notifications,identify_visits) on public.accounts to authenticated;
grant update on public.developer_profiles,public.recruiter_profiles to authenticated;
grant insert,update,delete on public.portfolio_projects,public.opportunities,public.shortlists,public.candidates,public.saved_searches,public.blocks,public.reviews,public.review_replies to authenticated;
grant insert on public.reports to authenticated;

create function talentfound_private.onboard(payload jsonb) returns text language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); role text:=payload->>'role'; slug text;
begin
 if not talentfound_private.verified() then raise exception 'Verify your email before continuing'; end if;
 if role not in ('developer','recruiter') then raise exception 'Choose a workspace'; end if;
 insert into public.members(id,name) values(uid,trim(payload->>'name')) on conflict(id) do update set name=excluded.name;
 insert into public.accounts(id,active_workspace) values(uid,role) on conflict(id) do update set active_workspace=excluded.active_workspace;
 if role='developer' then
  slug:=left(trim(both '-' from regexp_replace(lower(payload->>'name'),'[^a-z0-9]+','-','g')),30);
  if length(slug)<3 then slug:='builder'; end if;
  slug:=slug||'-'||left(replace(uid::text,'-',''),8);
  insert into public.developer_profiles(id,handle,headline,location,timezone,skills)
   values(uid,slug,trim(payload->>'headline'),trim(payload->>'location'),payload->>'timezone',array(select jsonb_array_elements_text(payload->'skills')))
   on conflict(id) do nothing;
 else
  insert into public.recruiter_profiles(id,company,intent) values(uid,trim(payload->>'company'),payload->>'intent') on conflict(id) do nothing;
 end if;
 return role;
end $$;
create function public.complete_onboarding(payload jsonb) returns text language sql security invoker set search_path='' as $$ select talentfound_private.onboard(payload) $$;

create function talentfound_private.send_message(recipient uuid,body text,client_id uuid,opportunity uuid default null) returns uuid language plpgsql security definer set search_path='' as $$
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
create function public.send_message(recipient uuid,body text,client_id uuid,opportunity uuid default null) returns uuid language sql security invoker set search_path='' as $$ select talentfound_private.send_message(recipient,body,client_id,opportunity) $$;
create function talentfound_private.respond_invitation(invitation uuid,response text) returns void language plpgsql security definer set search_path='' as $$
declare item public.invitations;
begin
 if not talentfound_private.onboarded() then raise exception 'Complete onboarding'; end if;
 select * into item from public.invitations where id=invitation for update;
 if item.id is null or item.status<>'pending' or talentfound_private.blocked(item.sender_id,item.recipient_id) then raise exception 'Invitation unavailable'; end if;
 if not ((auth.uid()=item.recipient_id and response in ('accepted','declined')) or (auth.uid()=item.sender_id and response='withdrawn')) then raise exception 'Not permitted'; end if;
 update public.invitations set status=response where id=invitation;
end $$;
create function public.respond_invitation(invitation uuid,response text) returns void language sql security invoker set search_path='' as $$ select talentfound_private.respond_invitation(invitation,response) $$;
create function talentfound_private.mark_read(conversation uuid) returns void language plpgsql security definer set search_path='' as $$ begin
 if not talentfound_private.participant(conversation) then raise exception 'Not permitted'; end if;
 insert into public.conversation_reads(conversation_id,member_id) values(conversation,auth.uid()) on conflict(conversation_id,member_id) do update set read_at=now();
end $$;
create function public.mark_read(conversation uuid) returns void language sql security invoker set search_path='' as $$select talentfound_private.mark_read(conversation)$$;

create function talentfound_private.analytics(days integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; since timestamptz:=now()-make_interval(days=>case when days=7 then 7 else 30 end);
begin
 if not talentfound_private.onboarded() then raise exception 'Not permitted'; end if;
 select jsonb_build_object('views',count(*) filter(where kind='profile_view'),'projectClicks',count(*) filter(where kind='project_click'),'daily',coalesce((select jsonb_agg(x order by x.day) from (select created_at::date as "day",count(*) filter(where kind='profile_view') views,count(distinct visitor_hash) filter(where kind='profile_view') visitors from public.analytics_events where developer_id=auth.uid() and created_at>=since group by 1)x),'[]'::jsonb),
 'visitors',coalesce((select jsonb_agg(x) from(select m.id,m.name,m.avatar_path,max(e.created_at) viewed_at from public.analytics_events e join public.accounts a on a.id=e.visitor_id and a.identify_visits join public.members m on m.id=e.visitor_id where e.developer_id=auth.uid() and e.created_at>=since and e.kind='profile_view' group by m.id order by max(e.created_at) desc limit 20)x),'[]'::jsonb),
 'conversations',(select count(*) from public.conversations where auth.uid() in(member_a,member_b) and created_at>=since),
 'invitations',(select count(*) from public.invitations where recipient_id=auth.uid() and created_at>=since)) into result
 from public.analytics_events where developer_id=auth.uid() and created_at>=since;
 return result;
end $$;
create function public.profile_analytics(days integer default 30) returns jsonb language sql security invoker set search_path='' as $$select talentfound_private.analytics(days)$$;

-- Restrict privileged functions; every member-callable function checks the caller.
revoke all on all functions in schema talentfound_private from public,anon,authenticated;
grant execute on function talentfound_private.verified(),talentfound_private.onboarded(),talentfound_private.participant(uuid),talentfound_private.onboard(jsonb),talentfound_private.send_message(uuid,text,uuid,uuid),talentfound_private.respond_invitation(uuid,text),talentfound_private.mark_read(uuid),talentfound_private.analytics(integer) to authenticated;
revoke all on function public.complete_onboarding(jsonb),public.send_message(uuid,text,uuid,uuid),public.respond_invitation(uuid,text),public.mark_read(uuid),public.profile_analytics(integer) from public,anon;
grant execute on function public.complete_onboarding(jsonb),public.send_message(uuid,text,uuid,uuid),public.respond_invitation(uuid,text),public.mark_read(uuid),public.profile_analytics(integer) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('avatars','avatars',true,5242880,array['image/jpeg','image/png','image/webp']),
 ('project-media','project-media',false,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy talentfound_media_owner on storage.objects for all to authenticated using(bucket_id in ('avatars','project-media') and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id in ('avatars','project-media') and (storage.foldername(name))[1]=auth.uid()::text and talentfound_private.onboarded());
create policy talentfound_published_media on storage.objects for select using(bucket_id='project-media' and exists(select 1 from public.portfolio_projects p join public.developer_profiles d on d.id=p.owner_id where p.image_path=name and p.published and d.published));
alter publication supabase_realtime add table public.messages,public.invitations;

create function talentfound_private.inbox() returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if not talentfound_private.onboarded() then raise exception 'Not permitted'; end if;
 return coalesce((select jsonb_agg(x order by x.last_at desc) from(
 select c.id,m.id other_id,m.name,m.avatar_path,(select body from public.messages where conversation_id=c.id order by created_at desc,id desc limit 1) last_message,
 coalesce((select max(created_at) from public.messages where conversation_id=c.id),c.created_at) last_at,
 (select count(*) from public.messages msg where msg.conversation_id=c.id and msg.sender_id<>auth.uid() and msg.created_at>coalesce(r.read_at,'1970-01-01'::timestamptz)) unread,
 talentfound_private.blocked(c.member_a,c.member_b) blocked
 from public.conversations c join public.members m on m.id=case when c.member_a=auth.uid() then c.member_b else c.member_a end
 left join public.conversation_reads r on r.conversation_id=c.id and r.member_id=auth.uid()
 where auth.uid() in(c.member_a,c.member_b)
 )x),'[]'::jsonb);
end $$;
create function public.talentfound_inbox() returns jsonb language sql security invoker set search_path='' as $$select talentfound_private.inbox()$$;
revoke all on function talentfound_private.inbox(),public.talentfound_inbox() from public,anon;
grant execute on function talentfound_private.inbox(),public.talentfound_inbox() to authenticated;

create function public.search_developers(filters jsonb default '{}') returns jsonb language sql stable security invoker set search_path='' as $$
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
 and (coalesce((filters->>'budget')::numeric,0)=0 or case when filters->>'engagement'='Full-time' then s.salary_usd else s.hourly_usd end<=(filters->>'budget')::numeric)
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
revoke all on function public.search_developers(jsonb) from public;
grant execute on function public.search_developers(jsonb) to anon,authenticated;
