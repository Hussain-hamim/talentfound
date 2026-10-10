ALTER TABLE "app"."contacts" ADD COLUMN "contact_consent" boolean;
ALTER TABLE "app"."conversations" ADD COLUMN "contact_consent" boolean;
CREATE FUNCTION app_private.upsert_widget_contact(
  target_workspace uuid,
  contact_name text,
  contact_email text,
  p_normalized_email text,
  contact_phone text,
  p_normalized_phone text,
  preferred_method text,
  consent_at timestamp with time zone,
  consent_granted boolean
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
    AND ((p_normalized_email IS NOT NULL AND c.normalized_email = p_normalized_email)
      OR (p_normalized_phone IS NOT NULL AND c.normalized_phone = p_normalized_phone))
  ORDER BY CASE WHEN p_normalized_email IS NOT NULL AND c.normalized_email = p_normalized_email THEN 0 ELSE 1 END
  LIMIT 1;

  IF contact_uuid IS NULL THEN
    INSERT INTO app.contacts (workspace_id, name, email, normalized_email, phone, normalized_phone, preferred_contact_method, contact_consent_at, contact_consent)
    VALUES (target_workspace, contact_name, contact_email, p_normalized_email, contact_phone, p_normalized_phone, preferred_method, consent_at, consent_granted)
    RETURNING id INTO contact_uuid;
  ELSE
    UPDATE app.contacts c SET
      name = contact_name,
      email = CASE WHEN p_normalized_email IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM app.contacts other WHERE other.workspace_id = target_workspace AND other.normalized_email = p_normalized_email AND other.id <> contact_uuid
      ) THEN contact_email ELSE c.email END,
      normalized_email = CASE WHEN p_normalized_email IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM app.contacts other WHERE other.workspace_id = target_workspace AND other.normalized_email = p_normalized_email AND other.id <> contact_uuid
      ) THEN p_normalized_email ELSE c.normalized_email END,
      phone = CASE WHEN p_normalized_phone IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM app.contacts other WHERE other.workspace_id = target_workspace AND other.normalized_phone = p_normalized_phone AND other.id <> contact_uuid
      ) THEN contact_phone ELSE c.phone END,
      normalized_phone = CASE WHEN p_normalized_phone IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM app.contacts other WHERE other.workspace_id = target_workspace AND other.normalized_phone = p_normalized_phone AND other.id <> contact_uuid
      ) THEN p_normalized_phone ELSE c.normalized_phone END,
      preferred_contact_method = preferred_method,
      contact_consent_at = consent_at,
      contact_consent = consent_granted,
      updated_at = now()
    WHERE c.id = contact_uuid;
  END IF;
  RETURN contact_uuid;
END $$;
REVOKE ALL ON FUNCTION app_private.upsert_widget_contact(uuid,text,text,text,text,text,text,timestamp with time zone,boolean) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.upsert_widget_contact(uuid,text,text,text,text,text,text,timestamp with time zone,boolean) TO stingray_widget;
CREATE OR REPLACE FUNCTION app_private.upsert_widget_contact(
  target_workspace uuid,
  contact_name text,
  contact_email text,
  normalized_email text,
  contact_phone text,
  normalized_phone text,
  preferred_method text,
  consent_at timestamp with time zone
) RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT app_private.upsert_widget_contact(
    target_workspace, contact_name, contact_email, normalized_email,
    contact_phone, normalized_phone, preferred_method, consent_at, NULL::boolean
  );
$$;
REVOKE ALL ON FUNCTION app_private.upsert_widget_contact(uuid,text,text,text,text,text,text,timestamp with time zone) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.upsert_widget_contact(uuid,text,text,text,text,text,text,timestamp with time zone) TO stingray_widget;;
