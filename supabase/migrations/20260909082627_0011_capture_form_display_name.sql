ALTER TABLE "app"."capture_forms" ADD COLUMN "display_name" varchar(120);
UPDATE "app"."capture_forms" AS form
SET "display_name" = COALESCE(NULLIF(BTRIM(workspace."brand_name"), ''), workspace."name")
FROM "app"."workspaces" AS workspace
WHERE workspace."id" = form."workspace_id";
ALTER TABLE "app"."capture_forms" ALTER COLUMN "display_name" SET DEFAULT 'Your business';
ALTER TABLE "app"."capture_forms" ALTER COLUMN "display_name" SET NOT NULL;
ALTER TABLE "app"."capture_forms" ADD CONSTRAINT "capture_forms_display_name_check" CHECK (LENGTH(BTRIM("display_name")) > 0);;
