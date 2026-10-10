-- Recruiter organization and hiring-intent fields belong to the private workspace.
alter policy recruiter_read on public.recruiter_profiles using(id=auth.uid());
create or replace function talentfound_private.verified() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null and (banned_until is null or banned_until<=now()))
$$;
