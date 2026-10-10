CREATE TABLE "app"."google_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"listing_id" uuid NOT NULL,
	"provider_review_id" text NOT NULL,
	"author" text NOT NULL,
	"rating" integer NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"review_url" text,
	"published_at" timestamp with time zone,
	"owner_response" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "app"."review_delivery_events" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" uuid NOT NULL,
	"request_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "app"."review_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" text NOT NULL,
	"place_id" text,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"review_url" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"rating" varchar(10),
	"review_count" integer DEFAULT 0 NOT NULL,
	"last_synced_at" timestamp with time zone,
	"last_full_sync_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "app"."review_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"unsubscribed" boolean DEFAULT false NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	"suppression_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "app"."review_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"listing_id" uuid NOT NULL,
	"recipient_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company_name" text NOT NULL,
	"reply_to" text NOT NULL,
	"review_url" text NOT NULL,
	"template_version" integer DEFAULT 1 NOT NULL,
	"permission_confirmed" boolean NOT NULL,
	"permission_confirmed_at" timestamp with time zone NOT NULL,
	"sent_by" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"provider_email_id" text,
	"token_hash" text NOT NULL,
	"delivery_token" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"attempt_started_at" timestamp with time zone,
	"lease_until" timestamp with time zone,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"clicked_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"complained_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "review_requests_provider_email_id_unique" UNIQUE("provider_email_id"),
	CONSTRAINT "review_requests_token_hash_unique" UNIQUE("token_hash")
);
CREATE TABLE "app"."review_sync_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"listing_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"full_sync" boolean DEFAULT true NOT NULL,
	"cursor" text,
	"imported" integer DEFAULT 0 NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"lease_until" timestamp with time zone,
	"next_run_at" timestamp with time zone DEFAULT now() NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_error" text,
	CONSTRAINT "review_sync_jobs_listing_id_unique" UNIQUE("listing_id")
);
ALTER TABLE "app"."google_reviews" ADD CONSTRAINT "google_reviews_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."google_reviews" ADD CONSTRAINT "google_reviews_listing_id_review_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "app"."review_listings"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."review_delivery_events" ADD CONSTRAINT "review_delivery_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."review_delivery_events" ADD CONSTRAINT "review_delivery_events_request_id_review_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "app"."review_requests"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."review_listings" ADD CONSTRAINT "review_listings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."review_recipients" ADD CONSTRAINT "review_recipients_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."review_requests" ADD CONSTRAINT "review_requests_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."review_requests" ADD CONSTRAINT "review_requests_listing_id_review_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "app"."review_listings"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "app"."review_requests" ADD CONSTRAINT "review_requests_recipient_id_review_recipients_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "app"."review_recipients"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "app"."review_requests" ADD CONSTRAINT "review_requests_sent_by_profiles_id_fk" FOREIGN KEY ("sent_by") REFERENCES "app"."profiles"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "app"."review_sync_jobs" ADD CONSTRAINT "review_sync_jobs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."review_sync_jobs" ADD CONSTRAINT "review_sync_jobs_listing_id_review_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "app"."review_listings"("id") ON DELETE cascade ON UPDATE no action;
CREATE UNIQUE INDEX "google_reviews_listing_provider" ON "app"."google_reviews" USING btree ("listing_id","provider_review_id");
CREATE UNIQUE INDEX "review_listings_active_workspace" ON "app"."review_listings" USING btree ("workspace_id") WHERE "app"."review_listings"."active";
CREATE UNIQUE INDEX "review_recipients_workspace_email" ON "app"."review_recipients" USING btree ("workspace_id","email");
CREATE UNIQUE INDEX "review_requests_one_per_recipient" ON "app"."review_requests" USING btree ("workspace_id","recipient_id");
ALTER TABLE app.review_listings ADD CONSTRAINT review_listings_tenant_identity UNIQUE(workspace_id,id);
ALTER TABLE app.review_recipients ADD CONSTRAINT review_recipients_tenant_identity UNIQUE(workspace_id,id);
ALTER TABLE app.review_requests ADD CONSTRAINT review_requests_tenant_identity UNIQUE(workspace_id,id);
ALTER TABLE app.google_reviews ADD CONSTRAINT google_reviews_tenant_listing FOREIGN KEY(workspace_id,listing_id) REFERENCES app.review_listings(workspace_id,id) ON DELETE CASCADE;
ALTER TABLE app.review_requests ADD CONSTRAINT review_requests_tenant_listing FOREIGN KEY(workspace_id,listing_id) REFERENCES app.review_listings(workspace_id,id);
ALTER TABLE app.review_requests ADD CONSTRAINT review_requests_tenant_recipient FOREIGN KEY(workspace_id,recipient_id) REFERENCES app.review_recipients(workspace_id,id);
ALTER TABLE app.review_delivery_events ADD CONSTRAINT review_events_tenant_request FOREIGN KEY(workspace_id,request_id) REFERENCES app.review_requests(workspace_id,id) ON DELETE CASCADE;
ALTER TABLE app.review_sync_jobs ADD CONSTRAINT review_jobs_tenant_listing FOREIGN KEY(workspace_id,listing_id) REFERENCES app.review_listings(workspace_id,id) ON DELETE CASCADE;
ALTER TABLE app.review_requests ADD CONSTRAINT review_requests_permission CHECK(permission_confirmed);
ALTER TABLE app.review_requests ADD CONSTRAINT review_requests_status CHECK(status IN ('pending','sending','sent','delivered','failed','bounced','complained','suppressed','needs_check'));
ALTER TABLE app.review_sync_jobs ADD CONSTRAINT review_sync_status CHECK(status IN ('pending','running','complete','error'));
ALTER TABLE app.google_reviews ADD CONSTRAINT google_reviews_rating CHECK(rating BETWEEN 1 AND 5);
CREATE INDEX review_requests_due ON app.review_requests(next_attempt_at) WHERE status IN ('pending','sending');
CREATE INDEX review_jobs_due ON app.review_sync_jobs(next_run_at);
CREATE INDEX google_reviews_listing_date ON app.google_reviews(listing_id,published_at DESC);
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['review_listings','google_reviews','review_recipients','review_requests','review_delivery_events','review_sync_jobs'] LOOP
  EXECUTE format('ALTER TABLE app.%I ENABLE ROW LEVEL SECURITY', t);
  EXECUTE format('ALTER TABLE app.%I FORCE ROW LEVEL SECURITY', t);
  EXECUTE format('REVOKE ALL ON app.%I FROM PUBLIC, anon, authenticated, service_role, stingray_widget', t);
  EXECUTE format('GRANT SELECT ON app.%I TO stingray_app', t);
  EXECUTE format('GRANT SELECT, INSERT, UPDATE ON app.%I TO stingray_worker', t);
  EXECUTE format('CREATE POLICY review_member_read ON app.%I FOR SELECT TO stingray_app USING(workspace_id=app_private.current_workspace_id() AND app_private.is_workspace_member(workspace_id))', t);
  EXECUTE format('CREATE POLICY review_worker ON app.%I TO stingray_worker USING(workspace_id=app_private.current_workspace_id()) WITH CHECK(workspace_id=app_private.current_workspace_id())', t);
 END LOOP;
END $$;
GRANT INSERT, UPDATE ON app.review_listings TO stingray_app;
CREATE POLICY review_listing_manage ON app.review_listings TO stingray_app
 USING(workspace_id=app_private.current_workspace_id() AND app_private.can_manage_workspace(workspace_id))
 WITH CHECK(workspace_id=app_private.current_workspace_id() AND app_private.can_manage_workspace(workspace_id));
GRANT INSERT, UPDATE ON app.review_recipients, app.review_requests, app.review_sync_jobs TO stingray_app;
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['review_recipients','review_requests','review_sync_jobs'] LOOP
  EXECUTE format('CREATE POLICY review_member_write ON app.%I TO stingray_app USING(workspace_id=app_private.current_workspace_id() AND app_private.is_workspace_member(workspace_id)) WITH CHECK(workspace_id=app_private.current_workspace_id() AND app_private.is_workspace_member(workspace_id))', t);
 END LOOP;
END $$;
CREATE FUNCTION app_private.claim_review_work(p_kind text)
RETURNS TABLE(workspace_id uuid,id uuid) LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF p_kind='sync' THEN
  RETURN QUERY WITH candidate AS (
   SELECT j.id FROM app.review_sync_jobs j JOIN app.review_listings l ON l.id=j.listing_id
   JOIN app.workspaces w ON w.id=j.workspace_id
   WHERE l.active AND w.subscription_status IN ('active','trialing') AND j.next_run_at<=now()
   AND (j.lease_until IS NULL OR j.lease_until<now())
   ORDER BY j.next_run_at LIMIT 1 FOR UPDATE OF j SKIP LOCKED
  ) UPDATE app.review_sync_jobs j SET lease_until=now()+interval '5 minutes'
    FROM candidate c WHERE j.id=c.id RETURNING j.workspace_id,j.id;
 ELSIF p_kind='email' THEN
  RETURN QUERY WITH candidate AS (
   SELECT r.id FROM app.review_requests r JOIN app.workspaces w ON w.id=r.workspace_id
   WHERE w.subscription_status IN ('active','trialing') AND r.status IN ('pending','sending')
   AND r.next_attempt_at<=now() AND (r.lease_until IS NULL OR r.lease_until<now())
   ORDER BY r.next_attempt_at LIMIT 1 FOR UPDATE OF r SKIP LOCKED
  ) UPDATE app.review_requests r SET lease_until=now()+interval '5 minutes'
    FROM candidate c WHERE r.id=c.id RETURNING r.workspace_id,r.id;
 END IF;
END $$;
REVOKE ALL ON FUNCTION app_private.claim_review_work(text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.claim_review_work(text) TO stingray_worker;
CREATE FUNCTION app_private.review_token_action(p_hash text,p_action text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r app.review_requests;
BEGIN
 SELECT * INTO r FROM app.review_requests WHERE token_hash=p_hash;
 IF NOT FOUND THEN RETURN NULL; END IF;
 IF p_action='click' THEN
  UPDATE app.review_requests SET clicked_at=COALESCE(clicked_at,now()) WHERE id=r.id;
  RETURN r.review_url;
 ELSIF p_action='unsubscribe' THEN
  UPDATE app.review_recipients SET unsubscribed=true,unsubscribed_at=COALESCE(unsubscribed_at,now())
    WHERE id=r.recipient_id AND workspace_id=r.workspace_id;
  RETURN 'ok';
 ELSIF p_action='check' THEN RETURN 'ok';
 END IF;
 RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION app_private.review_token_action(text,text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.review_token_action(text,text) TO stingray_worker;
ALTER TABLE app.review_requests ADD COLUMN delivery_generation integer NOT NULL DEFAULT 0;
CREATE FUNCTION app_private.record_review_delivery(p_event_id text,p_email_id text,p_type text,p_at timestamptz,p_request_id uuid,p_generation integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r app.review_requests; inserted integer;
BEGIN
 IF p_type NOT IN ('email.sent','email.delivered','email.bounced','email.complained','email.failed') THEN RETURN true; END IF;
 SELECT * INTO r FROM app.review_requests WHERE provider_email_id=p_email_id OR
   (id=p_request_id AND p_generation<=delivery_generation) FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 INSERT INTO app.review_delivery_events(id,workspace_id,request_id,event_type,occurred_at)
 VALUES(p_event_id,r.workspace_id,r.id,p_type,p_at) ON CONFLICT(id) DO NOTHING;
 GET DIAGNOSTICS inserted=ROW_COUNT;
 IF inserted=0 THEN RETURN true; END IF;
 IF r.id=p_request_id AND p_generation<r.delivery_generation THEN
  IF p_type IN ('email.bounced','email.complained') THEN
   UPDATE app.review_recipients SET suppression_reason=CASE WHEN suppression_reason='complaint' OR p_type='email.complained' THEN 'complaint' ELSE 'bounce' END WHERE id=r.recipient_id AND workspace_id=r.workspace_id;
  END IF;
  RETURN true;
 END IF;
 UPDATE app.review_requests SET provider_email_id=COALESCE(provider_email_id,p_email_id),
  sent_at=CASE WHEN p_type IN ('email.sent','email.delivered') THEN COALESCE(sent_at,p_at) ELSE sent_at END,
  delivered_at=CASE WHEN p_type='email.delivered' THEN COALESCE(delivered_at,p_at) ELSE delivered_at END,
  failed_at=CASE WHEN p_type IN ('email.bounced','email.failed') THEN COALESCE(failed_at,p_at) ELSE failed_at END,
  complained_at=CASE WHEN p_type='email.complained' THEN COALESCE(complained_at,p_at) ELSE complained_at END,
  status=CASE
   WHEN status='complained' OR p_type='email.complained' THEN 'complained'
   WHEN status='bounced' OR p_type='email.bounced' THEN 'bounced'
   WHEN delivered_at IS NOT NULL OR p_type='email.delivered' THEN 'delivered'
   WHEN status='failed' OR p_type='email.failed' THEN 'failed'
   ELSE 'sent' END,
  lease_until=NULL
 WHERE id=r.id;
 IF p_type IN ('email.bounced','email.complained') THEN
  UPDATE app.review_recipients SET suppression_reason=CASE WHEN suppression_reason='complaint' OR p_type='email.complained' THEN 'complaint' ELSE 'bounce' END
   WHERE id=r.recipient_id AND workspace_id=r.workspace_id;
 END IF;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION app_private.record_review_delivery(text,text,text,timestamptz,uuid,integer) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.record_review_delivery(text,text,text,timestamptz,uuid,integer) TO stingray_worker;;
