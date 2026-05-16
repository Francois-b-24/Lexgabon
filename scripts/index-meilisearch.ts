/**
 * Indexe les articles (Postgres `articles` × `textes` × `sources`) dans Meilisearch
 * sur l'index `articles`. Un document = un article + métadonnées de son texte parent.
 *
 * D1 : on indexe les articles (pas les textes globaux) pour que la recherche full-text
 * « préavis » remonte les bons articles avec lien direct vers /textes/<source>/<slug>#article-N.
 *
 * - searchableAttributes : titre, articleNumero, contenu, reference, resume.
 *   (priorité sur le titre + numéro + contenu, ordre = poids du ranking).
 * - filterableAttributes : source, type, domaine, datePublicationTs, estEnVigueur.
 * - sortableAttributes : datePublicationTs.
 *
 * Usage : DATABASE_URL=... MEILISEARCH_HOST=... MEILISEARCH_API_KEY=... npx tsx scripts/index-meilisearch.ts
 */
import { Meilisearch } from "meilisearch";
import { eq } from "drizzle-orm";

import { getDb } from "../lib/db";
import { articles, sources, textes } from "../lib/db/schema";
import { sourceUrlSlugFromDbCode } from "../lib/sources";

const INDEX = "articles";

type MeiliArticleDoc = {
  /**
   * ID unique Meili : <texte_id>__<numero_normalisé>. Stable, sert de primaryKey.
   * Meili impose [a-z A-Z 0-9 - _] uniquement, donc on remplace ':' par '__' et on
   * normalise les espaces (cas « 12 bis » → « 12-bis »).
   */
  id: string;
  /** ID texte (pour regroupement). */
  texteId: string;
  /** slug texte (pour construire l'URL). */
  texteSlug: string;
  /** Numéro de l'article (« 12 », « 12 bis », « 12-1 »…). */
  articleNumero: string;
  /** Titre du texte parent (pour affichage dans les cartes de résultat). */
  titre: string;
  /** Titre optionnel de l'article. */
  articleTitre: string | null;
  /** Référence légale du texte (Loi 022/2021, etc.). */
  reference: string;
  /** Contenu complet de l'article (indexé pour recherche full-text). */
  contenu: string;
  /** Résumé du texte parent. */
  resume: string;
  /** Slug URL de la source (jo-ga, ohada, ...). */
  source: string;
  /** Libellé long de la source. */
  sourceLabel: string;
  type: string;
  domaine: string | null;
  datePublication: string;
  datePublicationTs: number;
  estEnVigueur: boolean;
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
  try {
    await client.createIndex(INDEX, { primaryKey: "id" });
  } catch {
    /* déjà existant */
  }
  const index = client.index(INDEX);
  await index.updateSettings({
    // Ordre = poids du ranking. titre et articleNumero d'abord pour qu'une recherche
    // « article 82 » sorte directement l'article 82 du Code du travail.
    searchableAttributes: ["articleNumero", "titre", "articleTitre", "contenu", "reference"],
    filterableAttributes: ["source", "type", "domaine", "datePublicationTs", "estEnVigueur"],
    sortableAttributes: ["datePublicationTs"],
    rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness"],
  });
}

async function fetchAllArticles(): Promise<MeiliArticleDoc[]> {
  const db = getDb();
  if (!db) {
    console.error("[index-meilisearch] DATABASE_URL absent. Abandon.");
    process.exit(1);
  }

  const rows = await db
    .select({
      articleId: articles.id,
      articleNumero: articles.numero,
      articleTitre: articles.titre,
      contenu: articles.contenu,
      texteId: textes.id,
      texteSlug: textes.slug,
      titre: textes.titre,
      reference: textes.reference,
      type: textes.type,
      datePublication: textes.datePublication,
      estEnVigueur: textes.estEnVigueur,
      domaineSlug: textes.domaineSlug,
      resume: textes.resume,
      sourceCode: sources.code,
      sourceNom: sources.nom,
    })
    .from(articles)
    .innerJoin(textes, eq(articles.texteId, textes.id))
    .innerJoin(sources, eq(textes.sourceId, sources.id));

  const docs: MeiliArticleDoc[] = [];
  for (const row of rows) {
    const slug = sourceUrlSlugFromDbCode(row.sourceCode);
    if (!slug) continue;
    const dateIso = String(row.datePublication);
    const ts = Math.floor(new Date(`${dateIso}T00:00:00Z`).getTime() / 1000);
    // Meili impose [a-z A-Z 0-9 - _] dans les ID. On remplace ':' par '__' et on
    // normalise les espaces (« 12 bis » → « 12-bis »).
    const safeNumero = row.articleNumero.replace(/\s+/g, "-");
    docs.push({
      id: `${row.texteId}__${safeNumero}`,
      texteId: row.texteId,
      texteSlug: row.texteSlug,
      articleNumero: row.articleNumero,
      titre: row.titre,
      articleTitre: row.articleTitre,
      reference: row.reference,
      contenu: row.contenu,
      resume: row.resume ?? "",
      source: slug,
      sourceLabel: row.sourceNom,
      type: row.type,
      domaine: row.domaineSlug ?? null,
      datePublication: dateIso,
      datePublicationTs: Number.isFinite(ts) ? ts : 0,
      estEnVigueur: row.estEnVigueur ?? true,
    });
  }
  return docs;
}

async function main() {
  const client = getClient();
  await ensureIndexSettings(client);

  const docs = await fetchAllArticles();
  if (docs.length === 0) {
    console.log("[index-meilisearch] aucun article en base. Index vidé.");
    await client.index(INDEX).deleteAllDocuments();
    return;
  }
  // Remplacement total : on supprime les anciens documents avant d'ajouter les nouveaux.
  // Comme l'`id` est stable (texteId:numero), on pourrait juste faire addDocuments,
  // mais deleteAllDocuments + addDocuments garantit que les articles disparus en base
  // (renumérotation, suppression d'un texte) sont retirés de l'index.
  await client.index(INDEX).deleteAllDocuments();
  const task = await client.index(INDEX).addDocuments(docs, { primaryKey: "id" });
  console.log(`[index-meilisearch] ${docs.length} articles envoyés (task uid=${task.taskUid})`);

  // Nettoyage : ancien index `textes` n'est plus utilisé, on le supprime s'il existe.
  try {
    await client.deleteIndex("textes");
    console.log("[index-meilisearch] ancien index 'textes' supprimé (plus utilisé)");
  } catch {
    /* index 'textes' n'existait pas ou déjà supprimé */
  }
}

main().catch((e) => {
  console.error("[index-meilisearch] fatal", e);
  process.exit(1);
});
