CREATE TABLE "alertes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"libelle" text NOT NULL,
	"filtres" jsonb NOT NULL,
	"frequence" text DEFAULT 'QUOTIDIENNE',
	"est_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"texte_id" uuid NOT NULL,
	"numero" text NOT NULL,
	"titre" text,
	"contenu" text NOT NULL,
	"position" integer NOT NULL,
	"titre_section" text,
	"refs_croisees" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"texte_id" uuid NOT NULL,
	"numero_article" text,
	"contenu" text NOT NULL,
	"embedding" vector(1024),
	"position" integer NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"titre" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "domaines" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"libelle_fr" text NOT NULL,
	"libelle_en" text NOT NULL,
	"parent_id" integer,
	CONSTRAINT "domaines_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "favoris" (
	"user_id" uuid NOT NULL,
	"texte_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "favoris_user_id_texte_id_pk" PRIMARY KEY("user_id","texte_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" text NOT NULL,
	"contenu" text NOT NULL,
	"citations" jsonb DEFAULT '[]'::jsonb,
	"tokens_input" integer,
	"tokens_output" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profils" (
	"id" uuid PRIMARY KEY NOT NULL,
	"prenom" text,
	"nom" text,
	"profession" text,
	"organisation" text,
	"plan" text DEFAULT 'FREE',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quotas_usage" (
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"questions" integer DEFAULT 0,
	CONSTRAINT "quotas_usage_user_id_date_pk" PRIMARY KEY("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"nom" text NOT NULL,
	"url_base" text NOT NULL,
	"est_actif" boolean DEFAULT true,
	CONSTRAINT "sources_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "textes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"source_id" integer NOT NULL,
	"type" text NOT NULL,
	"reference" text NOT NULL,
	"titre" text NOT NULL,
	"date_publication" date NOT NULL,
	"date_entree_vig" date,
	"url_source" text NOT NULL,
	"pdf_storage_key" text,
	"domaines" integer[] DEFAULT '{}',
	"est_en_vigueur" boolean DEFAULT true,
	"abroge_par" uuid,
	"resume" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "textes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_texte_id_textes_id_fk" FOREIGN KEY ("texte_id") REFERENCES "public"."textes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_texte_id_textes_id_fk" FOREIGN KEY ("texte_id") REFERENCES "public"."textes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favoris" ADD CONSTRAINT "favoris_texte_id_textes_id_fk" FOREIGN KEY ("texte_id") REFERENCES "public"."textes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "textes" ADD CONSTRAINT "textes_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "articles_texte_numero_unique" ON "articles" USING btree ("texte_id","numero");--> statement-breakpoint
CREATE INDEX "articles_texte_position_idx" ON "articles" USING btree ("texte_id","position");