ALTER TABLE "app"."conversations" ADD COLUMN IF NOT EXISTS "vehicle_interest" varchar(160);
ALTER TABLE "app"."conversations" ADD COLUMN IF NOT EXISTS "trade_in" varchar(20);
ALTER TABLE "app"."conversations" ADD COLUMN IF NOT EXISTS "financing" varchar(20);
ALTER TABLE "app"."leads" ADD COLUMN IF NOT EXISTS "vehicle_interest" varchar(160);
ALTER TABLE "app"."leads" ADD COLUMN IF NOT EXISTS "trade_in" varchar(20);
ALTER TABLE "app"."leads" ADD COLUMN IF NOT EXISTS "financing" varchar(20);

ALTER TABLE "app"."workspaces" DROP CONSTRAINT IF EXISTS "workspaces_stripe_customer_id_unique";
ALTER TABLE "app"."workspaces" DROP CONSTRAINT IF EXISTS "workspaces_stripe_subscription_id_unique";
ALTER TABLE "app"."workspaces" DROP COLUMN IF EXISTS "stripe_customer_id";
ALTER TABLE "app"."workspaces" DROP COLUMN IF EXISTS "stripe_subscription_id";
ALTER TABLE "app"."workspaces" DROP COLUMN IF EXISTS "stripe_product_id";
ALTER TABLE "app"."workspaces" DROP COLUMN IF EXISTS "plan_name";
ALTER TABLE "app"."workspaces" DROP COLUMN IF EXISTS "subscription_status";
ALTER TABLE "app"."workspaces" DROP COLUMN IF EXISTS "selected_plan";

ALTER TABLE "app"."workspaces" ALTER COLUMN "assistant_name" SET DEFAULT 'Sales Assistant';
ALTER TABLE "app"."workspaces" ALTER COLUMN "booking_cta" SET DEFAULT 'Schedule a test drive';

ALTER TABLE "app"."capture_forms" ALTER COLUMN "headline" SET DEFAULT 'Tell us what you are looking for';
ALTER TABLE "app"."capture_forms" ALTER COLUMN "submit_label" SET DEFAULT 'Send inquiry';;
