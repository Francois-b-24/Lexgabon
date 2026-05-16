/**
 * Indexe les `textes` (Postgres) dans Meilisearch sur l'index `textes`.
 *
 * - Lit la base via Drizzle (jointure `textes` × `sources`).
 * - Construit un document par texte (pas par article) — la recherche full-text
 *   tape sur titre + reference + resume.
 * - Configure les attributs filtrables/triables alignés avec lib/search-service.ts.
 *
 * Usage : DATABASE_URL=... MEILISEARCH_HOST=... MEILISEARCH_API_KEY=... npx tsx scripts/index-meilisearch.ts
 */
import { Meilisearch } from "meilisearch";
import { eq } from "drizzle-orm";

import { getDb } from "../lib/db";
import { sources, textes } from "../lib/db/schema";
import { sourceUrlSlugFromDbCode } from "../lib/sources";

const INDEX = "textes";

type MeiliTexteDoc = {
  id: string;
  slug: string;
  source: string;
  sourceLabel: string;
  titre: string;
  reference: string;
  type: string;
  datePublication: string;
  datePublicationTs: number;
  estEnVigueur: boolean;
  domaines: number[];
  /** Slug texte du domaine (civil, travail, ...) pour le filtre Meili — T2.1. */
  domaine: string | null;
  resume: string;
};

function getClient(): Meilisearch {
  const host = process.env.MEILISEARCH_HOST;
  const key = process.env.MEILISEARCH_API_KEY;
  if (!host || !key) {
    console.error("[index-meilisearch] MEILISEARCH_HOST / MEILISEARCH_API_KEY manquant. Abandon.");
    process.exit(1);
  }
  return new Meilisearch({ host, apiKey: key });
}

async function ensureIndexSettings(client: Meilisearch) {
  // Crée l'index s'il n'existe pas (idempotent).
  try {
    await client.createIndex(INDEX, { primaryKey: "id" });
  } catch {
    /* déjà existant */
  }
  const index = client.index(INDEX);
  await index.updateSettings({
    searchableAttributes: ["titre", "reference", "resume"],
    filterableAttributes: ["source", "type", "domaine", "domaines", "datePublicationTs", "estEnVigueur"],
    sortableAttributes: ["datePublicationTs"],
    rankingRules: [
      "words",
      "typo",
      "proximity",
      "attribute",
      "sort",
      "exactness",
    ],
  });
}

async function fetchAllTextes(): Promise<MeiliTexteDoc[]> {
  const db = getDb();
  if (!db) {
    console.error("[index-meilisearch] DATABASE_URL absent. Abandon.");
    process.exit(1);
  }
  const rows = await db
    .select({
      id: textes.id,
      slug: textes.slug,
      titre: textes.titre,
      reference: textes.reference,
      type: textes.type,
      datePublication: textes.datePublication,
      estEnVigueur: textes.estEnVigueur,
      domaines: textes.domaines,
      domaineSlug: textes.domaineSlug,
      resume: textes.resume,
      sourceCode: sources.code,
      sourceNom: sources.nom,
    })
    .from(textes)
    .innerJoin(sources, eq(textes.sourceId, sources.id));

  const docs: MeiliTexteDoc[] = [];
  for (const row of rows) {
    const slug = sourceUrlSlugFromDbCode(row.sourceCode);
    if (!slug) {
      console.warn(`[index-meilisearch] code source inconnu ${row.sourceCode}, ignoré (${row.slug})`);
      continue;
    }
    const dateIso = String(row.datePublication);
    const ts = Math.floor(new Date(`${dateIso}T00:00:00Z`).getTime() / 1000);
    docs.push({
      id: row.id,
      slug: row.slug,
      source: slug,
      sourceLabel: row.sourceNom,
      titre: row.titre,
      reference: row.reference,
      type: row.type,
      datePublication: dateIso,
      datePublicationTs: Number.isFinite(ts) ? ts : 0,
      estEnVigueur: row.estEnVigueur ?? true,
      domaines: row.domaines ?? [],
      domaine: row.domaineSlug ?? null,
      resume: row.resume ?? "",
    });
  }
  return docs;
}

async function main() {
  const client = getClient();
  await ensureIndexSettings(client);

  const docs = await fetchAllTextes();
  if (docs.length === 0) {
    console.log("[index-meilisearch] aucun texte en base. Index vidé.");
    await client.index(INDEX).deleteAllDocuments();
    return;
  }
  // Remplacement complet (les documents disparus en base sont retirés).
  const task = await client.index(INDEX).addDocuments(docs, { primaryKey: "id" });
  console.log(`[index-meilisearch] ${docs.length} textes envoyés (task uid=${task.taskUid})`);
}

main().catch((e) => {
  console.error("[index-meilisearch] fatal", e);
  process.exit(1);
});
