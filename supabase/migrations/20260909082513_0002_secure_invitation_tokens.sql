CREATE EXTENSION IF NOT EXISTS pgcrypto;
ALTER TABLE app.invitations ADD COLUMN token_hash varchar(64);
ALTER TABLE app.invitations ADD COLUMN expires_at timestamptz;
ALTER TABLE app.invitations ADD COLUMN accepted_at timestamptz;

UPDATE app.invitations
SET token_hash = encode(digest(id::text, 'sha256'), 'hex'),
    expires_at = COALESCE(invited_at, now()) + interval '7 days',
    accepted_at = CASE WHEN status = 'accepted' THEN invited_at ELSE NULL END;

ALTER TABLE app.invitations ALTER COLUMN token_hash SET NOT NULL;
ALTER TABLE app.invitations ALTER COLUMN expires_at SET NOT NULL;
ALTER TABLE app.invitations ADD CONSTRAINT invitations_token_hash_unique UNIQUE(token_hash);

CREATE FUNCTION app_private.lookup_invitation(target_token_hash text)
RETURNS TABLE(id uuid, email varchar, role varchar, workspace_id uuid, workspace_name varchar)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$
  SELECT i.id, i.email, i.role, i.workspace_id, w.name
  FROM app.invitations i
  JOIN app.workspaces w ON w.id=i.workspace_id
  WHERE i.token_hash=target_token_hash
    AND i.status='pending'
    AND i.expires_at>now()
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION app_private.lookup_invitation(text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.lookup_invitation(text) TO stingray_app;;
