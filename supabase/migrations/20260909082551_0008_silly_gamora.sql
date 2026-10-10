ALTER TABLE "app"."workspaces" ADD COLUMN "reply_to_email" varchar(255);
ALTER TABLE "app"."conversation_messages" ADD COLUMN "channel" varchar(20) DEFAULT 'widget' NOT NULL;
ALTER TABLE "app"."conversation_messages" ADD COLUMN "delivery_status" varchar(20);
ALTER TABLE "app"."conversation_messages" ADD COLUMN "provider_message_id" text;
ALTER TABLE "app"."conversation_messages" ADD COLUMN "delivery_error" text;
ALTER TABLE "app"."conversation_messages" ADD COLUMN "delivered_at" timestamp with time zone;
ALTER TABLE "app"."conversation_messages" ADD COLUMN "author_user_id" uuid;
ALTER TABLE "app"."conversation_messages" ADD CONSTRAINT "conversation_messages_author_user_id_profiles_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "app"."profiles"("id") ON DELETE set null ON UPDATE no action;
UPDATE "app"."conversation_messages" SET "channel" = 'internal' WHERE "role" = 'note';;
