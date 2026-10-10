-- One database round trip for a dashboard refresh, under the caller's RLS policies.
create function public.workspace_snapshot() returns jsonb language sql stable security invoker set search_path='' as $$
select jsonb_build_object(
 'projects', coalesce((select jsonb_agg(p order by p.position,p.created_at) from public.portfolio_projects p where p.owner_id=auth.uid()),'[]'::jsonb),
 'opportunities', coalesce((select jsonb_agg(o order by o.created_at desc) from public.opportunities o where o.owner_id=auth.uid()),'[]'::jsonb),
 'shortlists', coalesce((select jsonb_agg(s order by s.created_at) from public.shortlists s where s.owner_id=auth.uid()),'[]'::jsonb),
 'candidates', coalesce((select jsonb_agg(c order by c.created_at desc) from public.candidates c where c.owner_id=auth.uid()),'[]'::jsonb),
 'savedSearches', coalesce((select jsonb_agg(s order by s.created_at desc) from public.saved_searches s where s.owner_id=auth.uid()),'[]'::jsonb),
 'invitations', coalesce((select jsonb_agg(i order by i.created_at desc) from public.invitations i where auth.uid() in(i.sender_id,i.recipient_id)),'[]'::jsonb),
 'inbox', public.talentfound_inbox(),
 'blocks', coalesce((select jsonb_agg(b) from public.blocks b where b.owner_id=auth.uid()),'[]'::jsonb),
 'analytics', public.profile_analytics(30),
 'people', coalesce((select jsonb_agg(m) from public.members m where m.id in (
 select developer_id from public.candidates where owner_id=auth.uid()
 union select blocked_id from public.blocks where owner_id=auth.uid()
 union select sender_id from public.invitations where recipient_id=auth.uid()
 union select recipient_id from public.invitations where sender_id=auth.uid()
 )),'[]'::jsonb)
);
$$;
revoke all on function public.workspace_snapshot() from public,anon;
grant execute on function public.workspace_snapshot() to authenticated;
