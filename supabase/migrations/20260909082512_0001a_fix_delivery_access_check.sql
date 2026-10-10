DROP POLICY IF EXISTS delivery_access ON app.webhook_deliveries;
CREATE POLICY delivery_access ON app.webhook_deliveries TO stingray_app USING(EXISTS(SELECT 1 FROM app.webhook_endpoints e WHERE e.id=endpoint_id AND app_private.is_workspace_member(e.workspace_id))) WITH CHECK(EXISTS(SELECT 1 FROM app.webhook_endpoints e WHERE e.id=endpoint_id AND app_private.is_workspace_member(e.workspace_id)));;
