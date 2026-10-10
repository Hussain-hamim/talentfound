CREATE SCHEMA IF NOT EXISTS app_private;
ALTER TABLE app.profiles ADD CONSTRAINT profiles_auth_user_fk
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

REVOKE ALL ON SCHEMA app FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated, service_role;
DO $$ BEGIN CREATE ROLE stingray_app NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE ROLE stingray_widget NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE ROLE stingray_worker NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
GRANT stingray_app, stingray_widget, stingray_worker TO postgres;
GRANT USAGE ON SCHEMA app TO stingray_app, stingray_widget, stingray_worker;
GRANT USAGE ON SCHEMA app_private TO stingray_app, stingray_widget, stingray_worker;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO stingray_app;
GRANT SELECT, INSERT, UPDATE ON app.workspaces, app.contacts, app.conversations, app.conversation_messages, app.leads, app.funnel_events, app.widget_rate_limits TO stingray_widget;
GRANT SELECT, INSERT, UPDATE ON app.workspaces, app.profiles, app.workspace_memberships, app.webhook_endpoints, app.webhook_deliveries, app.audit_events TO stingray_worker;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA app REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA app REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION app_private.current_user_id() RETURNS uuid LANGUAGE sql STABLE SET search_path='' AS $$ SELECT NULLIF(current_setting('app.user_id',true),'')::uuid $$;
CREATE FUNCTION app_private.current_workspace_id() RETURNS uuid LANGUAGE sql STABLE SET search_path='' AS $$ SELECT NULLIF(current_setting('app.workspace_id',true),'')::uuid $$;
CREATE FUNCTION app_private.current_visitor_key() RETURNS text LANGUAGE sql STABLE SET search_path='' AS $$ SELECT NULLIF(current_setting('app.visitor_key',true),'') $$;
CREATE FUNCTION app_private.is_workspace_member(target uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM app.workspace_memberships m WHERE m.workspace_id=target AND m.user_id=app_private.current_user_id()) $$;
CREATE FUNCTION app_private.can_manage_workspace(target uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM app.workspace_memberships m WHERE m.workspace_id=target AND m.user_id=app_private.current_user_id() AND m.role IN ('owner','admin')) $$;
CREATE FUNCTION app_private.shares_workspace(target_user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(
  SELECT 1 FROM app.workspace_memberships mine
  JOIN app.workspace_memberships theirs ON theirs.workspace_id=mine.workspace_id
  WHERE mine.user_id=app_private.current_user_id() AND theirs.user_id=target_user
 ) $$;
CREATE FUNCTION app_private.can_access_conversation(target uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM app.conversations c WHERE c.id=target AND app_private.is_workspace_member(c.workspace_id)) $$;
CREATE FUNCTION app_private.widget_owns_conversation(target uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM app.conversations c WHERE c.id=target AND c.workspace_id=app_private.current_workspace_id() AND c.visitor_key=app_private.current_visitor_key()) $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA app_private FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app_private TO stingray_app, stingray_widget, stingray_worker;

DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['profiles','workspaces','workspace_memberships','audit_events','invitations','contacts','conversations','conversation_messages','leads','qualification_rule_sets','knowledge_entries','funnel_events','webhook_endpoints','webhook_deliveries','widget_rate_limits'] LOOP
 EXECUTE format('ALTER TABLE app.%I ENABLE ROW LEVEL SECURITY',t); EXECUTE format('ALTER TABLE app.%I FORCE ROW LEVEL SECURITY',t); END LOOP; END $$;

CREATE POLICY profile_self ON app.profiles TO stingray_app USING(id=app_private.current_user_id()) WITH CHECK(id=app_private.current_user_id());
CREATE POLICY profile_workspace_read ON app.profiles FOR SELECT TO stingray_app USING(app_private.shares_workspace(id));
CREATE POLICY workspace_read ON app.workspaces FOR SELECT TO stingray_app USING(app_private.is_workspace_member(id));
CREATE POLICY workspace_create ON app.workspaces FOR INSERT TO stingray_app WITH CHECK(
 app_private.current_user_id() IS NOT NULL AND
 EXISTS(SELECT 1 FROM app.profiles p WHERE p.id=app_private.current_user_id())
);
CREATE POLICY workspace_update ON app.workspaces FOR UPDATE TO stingray_app USING(app_private.can_manage_workspace(id)) WITH CHECK(app_private.can_manage_workspace(id));
CREATE POLICY membership_read ON app.workspace_memberships FOR SELECT TO stingray_app USING(user_id=app_private.current_user_id() OR app_private.is_workspace_member(workspace_id));
CREATE POLICY membership_insert ON app.workspace_memberships FOR INSERT TO stingray_app WITH CHECK(user_id=app_private.current_user_id() OR app_private.can_manage_workspace(workspace_id));
CREATE POLICY membership_update ON app.workspace_memberships FOR UPDATE TO stingray_app USING(app_private.can_manage_workspace(workspace_id)) WITH CHECK(app_private.can_manage_workspace(workspace_id));
CREATE POLICY membership_delete ON app.workspace_memberships FOR DELETE TO stingray_app USING(app_private.can_manage_workspace(workspace_id));
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['contacts','conversations','leads','funnel_events','knowledge_entries','qualification_rule_sets','webhook_endpoints','audit_events','invitations'] LOOP
 EXECUTE format('CREATE POLICY workspace_access ON app.%I TO stingray_app USING(app_private.is_workspace_member(workspace_id)) WITH CHECK(app_private.is_workspace_member(workspace_id))',t); END LOOP; END $$;
CREATE POLICY message_access ON app.conversation_messages TO stingray_app USING(app_private.can_access_conversation(conversation_id)) WITH CHECK(app_private.can_access_conversation(conversation_id));
CREATE POLICY delivery_access ON app.webhook_deliveries TO stingray_app USING(EXISTS(SELECT 1 FROM app.webhook_endpoints e WHERE e.id=endpoint_id AND app_private.is_workspace_member(e.workspace_id))) WITH CHECK(EXISTS(SELECT 1 FROM app.webhook_endpoints e WHERE e.id=endpoint_id AND app_private.can_manage_workspace(e.workspace_id)));
CREATE POLICY widget_workspace ON app.workspaces FOR SELECT TO stingray_widget USING(id=app_private.current_workspace_id());
CREATE POLICY widget_contacts_insert ON app.contacts FOR INSERT TO stingray_widget WITH CHECK(workspace_id=app_private.current_workspace_id());
CREATE POLICY widget_conversations ON app.conversations TO stingray_widget USING(workspace_id=app_private.current_workspace_id() AND visitor_key=app_private.current_visitor_key()) WITH CHECK(workspace_id=app_private.current_workspace_id() AND visitor_key=app_private.current_visitor_key());
CREATE POLICY widget_messages ON app.conversation_messages TO stingray_widget USING(app_private.widget_owns_conversation(conversation_id)) WITH CHECK(app_private.widget_owns_conversation(conversation_id));
CREATE POLICY widget_leads ON app.leads TO stingray_widget USING(workspace_id=app_private.current_workspace_id() AND app_private.widget_owns_conversation(conversation_id)) WITH CHECK(workspace_id=app_private.current_workspace_id() AND app_private.widget_owns_conversation(conversation_id));
CREATE POLICY widget_events ON app.funnel_events TO stingray_widget USING(workspace_id=app_private.current_workspace_id() AND visitor_key=app_private.current_visitor_key()) WITH CHECK(workspace_id=app_private.current_workspace_id() AND visitor_key=app_private.current_visitor_key());
CREATE POLICY widget_limits ON app.widget_rate_limits TO stingray_widget USING(true) WITH CHECK(true);
GRANT SELECT ON app.knowledge_entries TO stingray_widget;
CREATE POLICY widget_knowledge ON app.knowledge_entries FOR SELECT TO stingray_widget USING(workspace_id=app_private.current_workspace_id() AND status='published');
CREATE POLICY worker_workspaces ON app.workspaces FOR SELECT TO stingray_worker USING(true);
CREATE POLICY worker_profiles ON app.profiles FOR SELECT TO stingray_worker USING(true);
CREATE POLICY worker_memberships ON app.workspace_memberships FOR SELECT TO stingray_worker USING(true);
CREATE POLICY worker_endpoints ON app.webhook_endpoints TO stingray_worker USING(true) WITH CHECK(true);
CREATE POLICY worker_deliveries ON app.webhook_deliveries TO stingray_worker USING(true) WITH CHECK(true);
CREATE POLICY worker_audit ON app.audit_events TO stingray_worker USING(true) WITH CHECK(true);

CREATE FUNCTION app_private.create_profile_for_auth_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 INSERT INTO app.profiles(id,email,name) VALUES(NEW.id,lower(NEW.email),NULLIF(NEW.raw_user_meta_data->>'name','')) ON CONFLICT(id) DO NOTHING; RETURN NEW; END $$;
CREATE TRIGGER auth_user_profile_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION app_private.create_profile_for_auth_user();;
