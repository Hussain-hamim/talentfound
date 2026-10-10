ALTER TABLE "app"."capture_forms" ADD COLUMN "brand_color" varchar(20);
ALTER TABLE "app"."capture_forms" ADD COLUMN "show_logo" boolean;
UPDATE "app"."capture_forms" AS form
SET
  "brand_color" = COALESCE(workspace."brand_color", '#1D4ED8'),
  "show_logo" = COALESCE(workspace."show_widget_logo", true)
FROM "app"."workspaces" AS workspace
WHERE workspace."id" = form."workspace_id";
ALTER TABLE "app"."capture_forms" ALTER COLUMN "brand_color" SET DEFAULT '#1D4ED8';
ALTER TABLE "app"."capture_forms" ALTER COLUMN "brand_color" SET NOT NULL;
ALTER TABLE "app"."capture_forms" ALTER COLUMN "show_logo" SET DEFAULT true;
ALTER TABLE "app"."capture_forms" ALTER COLUMN "show_logo" SET NOT NULL;
ALTER TABLE "app"."capture_forms" ADD CONSTRAINT "capture_forms_brand_color_check" CHECK ("brand_color" IN ('#1D4ED8', '#0E7490', '#0F766E', '#15803D', '#C2410C', '#6D28D9'));;
