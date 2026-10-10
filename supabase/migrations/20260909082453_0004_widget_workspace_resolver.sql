CREATE FUNCTION app_private.resolve_widget_workspace(target_client_id text)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$
  SELECT id FROM app.workspaces
  WHERE widget_client_id=target_client_id
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION app_private.resolve_widget_workspace(text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.resolve_widget_workspace(text) TO stingray_app, stingray_widget;

DROP POLICY IF EXISTS widget_contacts ON app.contacts;
DROP POLICY IF EXISTS widget_contacts_insert ON app.contacts;
CREATE POLICY widget_contacts_insert ON app.contacts FOR INSERT TO stingray_widget
  WITH CHECK(workspace_id=app_private.current_workspace_id());

GRANT SELECT ON app.knowledge_entries TO stingray_widget;
DROP POLICY IF EXISTS widget_knowledge ON app.knowledge_entries;
CREATE POLICY widget_knowledge ON app.knowledge_entries FOR SELECT TO stingray_widget
  USING(workspace_id=app_private.current_workspace_id() AND status='published');;
