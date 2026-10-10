CREATE SCHEMA "app";
CREATE TABLE "app"."audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" varchar(45)
);
CREATE TABLE "app"."contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(255),
	"normalized_email" varchar(255),
	"phone" varchar(40),
	"normalized_phone" varchar(40),
	"preferred_contact_method" varchar(20),
	"contact_consent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "app"."conversation_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"client_request_id" varchar(80),
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_messages_client_request_id_unique" UNIQUE("client_request_id")
);
CREATE TABLE "app"."conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid,
	"contact_id" uuid,
	"visitor_key" varchar(100) NOT NULL,
	"visitor_name" varchar(120),
	"visitor_email" varchar(255),
	"visitor_phone" varchar(40),
	"preferred_contact_method" varchar(20),
	"kind" varchar(20) DEFAULT 'opportunity' NOT NULL,
	"intent" varchar(30),
	"flow_step" varchar(40) DEFAULT 'intent' NOT NULL,
	"project_type" varchar(40),
	"zip_code" varchar(12),
	"budget_band" varchar(50),
	"timeline" varchar(40),
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"review_state" varchar(20) DEFAULT 'new' NOT NULL,
	"fit" varchar(20),
	"original_fit" varchar(20),
	"score" integer,
	"score_reasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rule_version" integer,
	"summary" text,
	"qualification_completed_at" timestamp with time zone,
	"booking_opened_at" timestamp with time zone,
	"contact_consent_at" timestamp with time zone,
	"ai_paused" boolean DEFAULT false NOT NULL,
	"first_touch" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"latest_touch" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source" varchar(40) DEFAULT 'direct',
	"assigned_to_user_id" uuid,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"archived_at" timestamp with time zone,
	"preview" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "app"."funnel_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"opportunity_id" uuid,
	"visitor_key" varchar(100) NOT NULL,
	"event" varchar(50) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "app"."invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"invited_by_user_id" uuid,
	"invited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL
);
CREATE TABLE "app"."knowledge_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"source_url" text,
	"kind" varchar(30) DEFAULT 'note' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"published_version" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "app"."leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"contact_id" uuid,
	"project_type" varchar(40),
	"postal_code" varchar(12),
	"budget_band" varchar(50),
	"timeline" varchar(40),
	"qualification_outcome" varchar(20) DEFAULT 'needs_review' NOT NULL,
	"automated_outcome" varchar(20),
	"qualification_reasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"qualification_rule_version" integer,
	"override_reason" text,
	"overridden_by_user_id" uuid,
	"overridden_at" timestamp with time zone,
	"source" varchar(40) DEFAULT 'direct' NOT NULL,
	"first_touch" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"latest_touch" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"booking_opened_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "app"."qualification_rule_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"published_by_user_id" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "app"."workspace_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"role" varchar(50) NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "app"."workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"selected_plan" varchar(20),
	"website_domain" varchar(255),
	"widget_client_id" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_product_id" text,
	"plan_name" varchar(50),
	"subscription_status" varchar(20),
	"brand_name" varchar(120),
	"brand_color" varchar(20) DEFAULT '#1D4ED8',
	"assistant_name" varchar(80) DEFAULT 'Project Assistant',
	"widget_greeting" text,
	"widget_teaser" text,
	"booking_url" text,
	"booking_cta" varchar(120) DEFAULT 'Book a design consultation',
	"privacy_policy_url" text,
	"alert_recipients" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"alert_recipient_user_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"alert_external_recipients" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"qualifier_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "workspaces_widget_client_id_unique" UNIQUE("widget_client_id"),
	CONSTRAINT "workspaces_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "workspaces_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
CREATE TABLE "app"."profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"email" varchar(255) NOT NULL,
	"onboarding_step" integer DEFAULT 1 NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"referral_source" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
CREATE TABLE "app"."webhook_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"endpoint_id" uuid NOT NULL,
	"opportunity_id" uuid,
	"event" varchar(60) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "app"."webhook_endpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"url" text NOT NULL,
	"secret" varchar(100) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "app"."widget_rate_limits" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "app"."audit_events" ADD CONSTRAINT "audit_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."audit_events" ADD CONSTRAINT "audit_events_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."profiles"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "app"."contacts" ADD CONSTRAINT "contacts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."conversation_messages" ADD CONSTRAINT "conversation_messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "app"."conversations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."conversations" ADD CONSTRAINT "conversations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."conversations" ADD CONSTRAINT "conversations_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."profiles"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "app"."conversations" ADD CONSTRAINT "conversations_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "app"."contacts"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "app"."conversations" ADD CONSTRAINT "conversations_assigned_to_user_id_profiles_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "app"."profiles"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "app"."funnel_events" ADD CONSTRAINT "funnel_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."funnel_events" ADD CONSTRAINT "funnel_events_opportunity_id_conversations_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "app"."conversations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."invitations" ADD CONSTRAINT "invitations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."invitations" ADD CONSTRAINT "invitations_invited_by_user_id_profiles_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "app"."profiles"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "app"."knowledge_entries" ADD CONSTRAINT "knowledge_entries_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."leads" ADD CONSTRAINT "leads_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."leads" ADD CONSTRAINT "leads_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "app"."conversations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."leads" ADD CONSTRAINT "leads_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "app"."contacts"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "app"."leads" ADD CONSTRAINT "leads_overridden_by_user_id_profiles_id_fk" FOREIGN KEY ("overridden_by_user_id") REFERENCES "app"."profiles"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "app"."qualification_rule_sets" ADD CONSTRAINT "qualification_rule_sets_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."qualification_rule_sets" ADD CONSTRAINT "qualification_rule_sets_published_by_user_id_profiles_id_fk" FOREIGN KEY ("published_by_user_id") REFERENCES "app"."profiles"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "app"."workspace_memberships" ADD CONSTRAINT "workspace_memberships_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."workspace_memberships" ADD CONSTRAINT "workspace_memberships_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_endpoint_id_webhook_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "app"."webhook_endpoints"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "app"."webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_opportunity_id_conversations_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "app"."conversations"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "app"."webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "app"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
CREATE UNIQUE INDEX "contacts_workspace_email_idx" ON "app"."contacts" USING btree ("workspace_id","normalized_email") WHERE "app"."contacts"."normalized_email" IS NOT NULL;
CREATE UNIQUE INDEX "contacts_workspace_phone_idx" ON "app"."contacts" USING btree ("workspace_id","normalized_phone") WHERE "app"."contacts"."normalized_phone" IS NOT NULL;
CREATE UNIQUE INDEX "leads_conversation_idx" ON "app"."leads" USING btree ("conversation_id");
CREATE UNIQUE INDEX "leads_workspace_id_idx" ON "app"."leads" USING btree ("workspace_id","id");
CREATE UNIQUE INDEX "workspace_memberships_workspace_user_idx" ON "app"."workspace_memberships" USING btree ("workspace_id","user_id");;
