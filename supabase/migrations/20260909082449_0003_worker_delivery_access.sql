GRANT SELECT ON app.contacts, app.conversations TO stingray_worker;
CREATE POLICY worker_contacts ON app.contacts FOR SELECT TO stingray_worker
  USING(workspace_id=app_private.current_workspace_id());
CREATE POLICY worker_conversations ON app.conversations FOR SELECT TO stingray_worker
  USING(workspace_id=app_private.current_workspace_id());;
