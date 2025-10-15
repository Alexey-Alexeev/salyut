ALTER TABLE "products" ADD COLUMN "video_url" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "description_structured" jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "features" jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "highlights" text[];