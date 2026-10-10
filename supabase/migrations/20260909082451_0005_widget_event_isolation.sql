DROP POLICY widget_events ON app.funnel_events;
CREATE POLICY widget_events ON app.funnel_events TO stingray_widget
  USING(
    workspace_id=app_private.current_workspace_id()
    AND visitor_key=app_private.current_visitor_key()
  )
  WITH CHECK(
    workspace_id=app_private.current_workspace_id()
    AND visitor_key=app_private.current_visitor_key()
  );;
