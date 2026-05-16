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
  // T2.1 : slug texte court (civil, penal, travail, ...) aligné sur SUPPORTED_DOMAINES.
  // Permet le filtre Meilisearch sans nécessiter la table `domaines` peuplée.
  domaineSlug: text("domaine_slug"),
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

/**
 * T2.5 — Versions historiques d'un texte. Une ligne = un snapshot complet
 * (label + date de validité + contenu JSON). Permet la comparaison côte à côte
 * sur /textes/[source]/[slug]/comparer.
 *
 * contenuJson : { articles: [{ numero, contenu, titre?, titreSection? }] }
 */
export const textVersions = pgTable(
  "text_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    texteId: uuid("texte_id")
      .notNull()
      .references(() => textes.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    dateValidite: date("date_validite").notNull(),
    contenuJson: jsonb("contenu_json").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("text_versions_texte_date_idx").on(t.texteId, t.dateValidite),
  ],
);

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

/**
 * T2.4 — Veille dynamique. Une ligne = un texte/acte/publication suivi sur les
 * portails officiels (JO Gabon, OHADA, CEMAC, COBAC, CIMA).
 * Source de vérité de la page /veille et du flux RSS public.
 */
export const veilleItems = pgTable(
  "veille_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    source: text("source").notNull(), // slug URL : jo-ga, ohada, cemac, cobac, cima
    type: text("type"), // loi, ordonnance, décret, acte uniforme, règlement, circulaire
    titre: text("titre").notNull(),
    resume: text("resume"),
    url: text("url").notNull(), // lien vers la source officielle
    portal: text("portal").notNull(), // libellé court (« journal-officiel.ga »)
    domaine: text("domaine"), // slug texte aligné sur SUPPORTED_DOMAINES
    datePublication: date("date_publication"),
    dateIngest: timestamp("date_ingest", { withTimezone: true }).defaultNow(),
    estNouveau: boolean("est_nouveau").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("veille_source_date_idx").on(t.source, t.datePublication),
    index("veille_date_publication_idx").on(t.datePublication),
  ],
);

export const quotasUsage = pgTable(
  "quotas_usage",
  {
    userId: uuid("user_id").notNull(),
    date: date("date").notNull(),
    questions: integer("questions").default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.date] })],
);
