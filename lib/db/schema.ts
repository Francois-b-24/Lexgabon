import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  nom: text("nom").notNull(),
  urlBase: text("url_base").notNull(),
  estActif: boolean("est_actif").default(true),
});

export const domaines = pgTable("domaines", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  libelleFr: text("libelle_fr").notNull(),
  libelleEn: text("libelle_en").notNull(),
  parentId: integer("parent_id"),
});

export const textes = pgTable("textes", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  sourceId: integer("source_id")
    .notNull()
    .references(() => sources.id),
  type: text("type").notNull(),
  reference: text("reference").notNull(),
  titre: text("titre").notNull(),
  datePublication: date("date_publication").notNull(),
  dateEntreeVig: date("date_entree_vig"),
  urlSource: text("url_source").notNull(),
  pdfStorageKey: text("pdf_storage_key"),
  domaines: integer("domaines").array().default([]),
  estEnVigueur: boolean("est_en_vigueur").default(true),
  abrogePar: uuid("abroge_par"),
  resume: text("resume"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    texteId: uuid("texte_id")
      .notNull()
      .references(() => textes.id, { onDelete: "cascade" }),
    numero: text("numero").notNull(),
    titre: text("titre"),
    contenu: text("contenu").notNull(),
    position: integer("position").notNull(),
    titreSection: text("titre_section"),
    refsCroisees: jsonb("refs_croisees").default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    uniqueIndex("articles_texte_numero_unique").on(t.texteId, t.numero),
    index("articles_texte_position_idx").on(t.texteId, t.position),
  ],
);

export const chunks = pgTable("chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  texteId: uuid("texte_id")
    .notNull()
    .references(() => textes.id, { onDelete: "cascade" }),
  numeroArticle: text("numero_article"),
  contenu: text("contenu").notNull(),
  embedding: vector("embedding", { dimensions: 1024 }),
  position: integer("position").notNull(),
  metadata: jsonb("metadata").default({}),
});

export const profils = pgTable("profils", {
  id: uuid("id").primaryKey(),
  prenom: text("prenom"),
  nom: text("nom"),
  profession: text("profession"),
  organisation: text("organisation"),
  plan: text("plan").default("FREE"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const favoris = pgTable(
  "favoris",
  {
    userId: uuid("user_id").notNull(),
    texteId: uuid("texte_id")
      .notNull()
      .references(() => textes.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.texteId] })],
);

export const alertes = pgTable("alertes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  libelle: text("libelle").notNull(),
  filtres: jsonb("filtres").notNull(),
  frequence: text("frequence").default("QUOTIDIENNE"),
  estActive: boolean("est_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  titre: text("titre"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  contenu: text("contenu").notNull(),
  citations: jsonb("citations").default([]),
  tokensInput: integer("tokens_input"),
  tokensOutput: integer("tokens_output"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const quotasUsage = pgTable(
  "quotas_usage",
  {
    userId: uuid("user_id").notNull(),
    date: date("date").notNull(),
    questions: integer("questions").default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.date] })],
);
