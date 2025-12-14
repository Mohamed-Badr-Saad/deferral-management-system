ALTER TABLE "account" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "attachments" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "attachments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "attachments" ALTER COLUMN "deferral_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "attachments" ALTER COLUMN "uploaded_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "audit_log" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "audit_log" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "audit_log" ALTER COLUMN "deferral_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "audit_log" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "deferrals" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "deferrals" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "deferrals" ALTER COLUMN "initiator_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "deferrals" ALTER COLUMN "reviewed_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "deferral_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;