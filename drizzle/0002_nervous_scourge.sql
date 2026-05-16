CREATE TABLE "veille_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"source" text NOT NULL,
	"type" text,
	"titre" text NOT NULL,
	"resume" text,
	"url" text NOT NULL,
	"portal" text NOT NULL,
	"domaine" text,
	"date_publication" date,
	"date_ingest" timestamp with time zone DEFAULT now(),
	"est_nouveau" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "veille_items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "veille_source_date_idx" ON "veille_items" USING btree ("source","date_publication");--> statement-breakpoint
CREATE INDEX "veille_date_publication_idx" ON "veille_items" USING btree ("date_publication");