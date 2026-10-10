ALTER TABLE "app"."conversations" ADD COLUMN "capture_surface" varchar(30) DEFAULT 'chat' NOT NULL;
ALTER TABLE "app"."conversations" ADD CONSTRAINT "conversations_capture_surface_check" CHECK ("capture_surface" IN ('chat', 'contact_form', 'exit_intent'));
CREATE TABLE "app"."capture_forms" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "workspace_id" uuid NOT NULL,
  "surface" varchar(30) NOT NULL,
  "enabled" boolean DEFAULT false NOT NULL,
  "headline" varchar(160) NOT NULL,
  "description" text NOT NULL,
  "submit_label" varchar(80) DEFAULT 'Send request' NOT NULL,
  "success_message" text NOT NULL,
  "collect_email" boolean DEFAULT true NOT NULL,
  "collect_phone" boolean DEFAULT false NOT NULL,
  "message_enabled" boolean DEFAULT true NOT NULL,
  "message_required" boolean DEFAULT false NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "capture_forms_surface_check" CHECK ("surface" IN ('contact_form', 'exit_intent')),
  CONSTRAINT "capture_forms_contact_method_check" CHECK ("collect_email" OR "collect_phone")
);
CREATE TABLE "app"."form_submissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "workspace_id" uuid NOT NULL,
  "conversation_id" uuid NOT NULL,
  "form_id" uuid NOT NULL,
  "form_version" integer NOT NULL,
  "client_submission_id" uuid NOT NULL,
  "answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "app"."capture_forms" ADD CONSTRAINT "capture_forms_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade;
ALTER TABLE "app"."form_submissions" ADD CONSTRAINT "form_submissions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade;
ALTER TABLE "app"."form_submissions" ADD CONSTRAINT "form_submissions_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "app"."conversations"("id") ON DELETE cascade;
ALTER TABLE "app"."form_submissions" ADD CONSTRAINT "form_submissions_form_id_capture_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "app"."capture_forms"("id") ON DELETE restrict;
CREATE UNIQUE INDEX "capture_forms_workspace_surface_idx" ON "app"."capture_forms" ("workspace_id", "surface");
CREATE UNIQUE INDEX "form_submissions_conversation_idx" ON "app"."form_submissions" ("conversation_id");
CREATE UNIQUE INDEX "form_submissions_workspace_client_idx" ON "app"."form_submissions" ("workspace_id", "client_submission_id");
INSERT INTO "app"."capture_forms" ("workspace_id", "surface", "headline", "description", "submit_label", "success_message")
SELECT "id", 'contact_form', 'Tell us about your project', 'Answer a few quick questions and our team will follow up.', 'Send project request', 'Thanks — a member of the team will contact you shortly.' FROM "app"."workspaces"
UNION ALL
SELECT "id", 'exit_intent', 'Before you go', 'Tell us about your project and we will help you plan the next step.', 'Get in touch', 'Thanks — a member of the team will contact you shortly.' FROM "app"."workspaces";
GRANT SELECT, INSERT, UPDATE, DELETE ON "app"."capture_forms", "app"."form_submissions" TO stingray_app;
GRANT SELECT ON "app"."capture_forms" TO stingray_widget;
GRANT SELECT, INSERT ON "app"."form_submissions" TO stingray_widget;
GRANT SELECT ON "app"."form_submissions" TO stingray_worker;
ALTER TABLE "app"."capture_forms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app"."capture_forms" FORCE ROW LEVEL SECURITY;
ALTER TABLE "app"."form_submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app"."form_submissions" FORCE ROW LEVEL SECURITY;
CREATE POLICY capture_forms_app_access ON "app"."capture_forms" TO stingray_app
  USING (app_private.is_workspace_member(workspace_id))
  WITH CHECK (app_private.can_manage_workspace(workspace_id));
CREATE POLICY form_submissions_app_access ON "app"."form_submissions" TO stingray_app
  USING (app_private.is_workspace_member(workspace_id));
CREATE POLICY capture_forms_widget_read ON "app"."capture_forms" FOR SELECT TO stingray_widget
  USING (workspace_id = app_private.current_workspace_id() AND enabled = true);
CREATE POLICY form_submissions_widget_insert ON "app"."form_submissions" FOR INSERT TO stingray_widget
  WITH CHECK (
    workspace_id = app_private.current_workspace_id()
    AND app_private.widget_owns_conversation(conversation_id)
    AND EXISTS (
      SELECT 1 FROM app.capture_forms f
      WHERE f.id = form_id AND f.workspace_id = app_private.current_workspace_id() AND f.enabled = true
    )
  );
CREATE POLICY form_submissions_widget_read ON "app"."form_submissions" FOR SELECT TO stingray_widget
  USING (workspace_id = app_private.current_workspace_id() AND app_private.widget_owns_conversation(conversation_id));
CREATE POLICY form_submissions_worker_read ON "app"."form_submissions" FOR SELECT TO stingray_worker USING (true);
CREATE FUNCTION app_private.upsert_widget_contact(
  target_workspace uuid,
  contact_name text,
  contact_email text,
  normalized_email text,
  contact_phone text,
  normalized_phone text,
  preferred_method text,
  consent_at timestamp with time zone
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE contact_uuid uuid;
BEGIN
  IF target_workspace IS DISTINCT FROM app_private.current_workspace_id() THEN
    RAISE EXCEPTION 'Invalid workspace context';
  END IF;

  SELECT c.id INTO contact_uuid
  FROM app.contacts c
  WHERE c.workspace_id = target_workspace
    AND ((normalized_email IS NOT NULL AND c.normalized_email = normalized_email)
      OR (normalized_phone IS NOT NULL AND c.normalized_phone = normalized_phone))
  ORDER BY CASE WHEN normalized_email IS NOT NULL AND c.normalized_email = normalized_email THEN 0 ELSE 1 END
  LIMIT 1;

  IF contact_uuid IS NULL THEN
    INSERT INTO app.contacts (workspace_id, name, email, normalized_email, phone, normalized_phone, preferred_contact_method, contact_consent_at)
    VALUES (target_workspace, contact_name, contact_email, normalized_email, contact_phone, normalized_phone, preferred_method, consent_at)
    RETURNING id INTO contact_uuid;
  ELSE
    UPDATE app.contacts c SET
      name = contact_name,
      email = CASE WHEN normalized_email IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM app.contacts other WHERE other.workspace_id = target_workspace AND other.normalized_email = normalized_email AND other.id <> contact_uuid
      ) THEN contact_email ELSE c.email END,
      normalized_email = CASE WHEN normalized_email IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM app.contacts other WHERE other.workspace_id = target_workspace AND other.normalized_email = normalized_email AND other.id <> contact_uuid
      ) THEN normalized_email ELSE c.normalized_email END,
      phone = CASE WHEN normalized_phone IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM app.contacts other WHERE other.workspace_id = target_workspace AND other.normalized_phone = normalized_phone AND other.id <> contact_uuid
      ) THEN contact_phone ELSE c.phone END,
      normalized_phone = CASE WHEN normalized_phone IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM app.contacts other WHERE other.workspace_id = target_workspace AND other.normalized_phone = normalized_phone AND other.id <> contact_uuid
      ) THEN normalized_phone ELSE c.normalized_phone END,
      preferred_contact_method = preferred_method,
      contact_consent_at = consent_at,
      updated_at = now()
    WHERE c.id = contact_uuid;
  END IF;
  RETURN contact_uuid;
END $$;
REVOKE ALL ON FUNCTION app_private.upsert_widget_contact(uuid,text,text,text,text,text,text,timestamp with time zone) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.upsert_widget_contact(uuid,text,text,text,text,text,text,timestamp with time zone) TO stingray_widget;;
