CREATE OR REPLACE FUNCTION app_private.claim_review_work(p_kind text)
RETURNS TABLE(workspace_id uuid,id uuid) LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF p_kind='sync' THEN
  RETURN QUERY WITH candidate AS (
   SELECT j.id FROM app.review_sync_jobs j JOIN app.review_listings l ON l.id=j.listing_id
   WHERE l.active AND j.next_run_at<=now()
   AND (j.lease_until IS NULL OR j.lease_until<now())
   ORDER BY j.next_run_at LIMIT 1 FOR UPDATE OF j SKIP LOCKED
  ) UPDATE app.review_sync_jobs j SET lease_until=now()+interval '5 minutes'
    FROM candidate c WHERE j.id=c.id RETURNING j.workspace_id,j.id;
 ELSIF p_kind='email' THEN
  RETURN QUERY WITH candidate AS (
   SELECT r.id FROM app.review_requests r
   WHERE r.status IN ('pending','sending')
   AND r.next_attempt_at<=now() AND (r.lease_until IS NULL OR r.lease_until<now())
   ORDER BY r.next_attempt_at LIMIT 1 FOR UPDATE OF r SKIP LOCKED
  ) UPDATE app.review_requests r SET lease_until=now()+interval '5 minutes'
    FROM candidate c WHERE r.id=c.id RETURNING r.workspace_id,r.id;
 END IF;
END $$;
REVOKE ALL ON FUNCTION app_private.claim_review_work(text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.claim_review_work(text) TO stingray_worker;;
