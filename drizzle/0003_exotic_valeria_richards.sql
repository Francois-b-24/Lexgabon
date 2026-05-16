CREATE TABLE "text_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"texte_id" uuid NOT NULL,
	"label" text NOT NULL,
	"date_validite" date NOT NULL,
	"contenu_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "text_versions" ADD CONSTRAINT "text_versions_texte_id_textes_id_fk" FOREIGN KEY ("texte_id") REFERENCES "public"."textes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "text_versions_texte_date_idx" ON "text_versions" USING btree ("texte_id","date_validite");