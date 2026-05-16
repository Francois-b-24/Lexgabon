/**
 * Consomme `backend/data/articles_ingest.jsonl` (produit par scripts/ingest_pdfs.py)
 * et peuple les tables `sources`, `textes`, `articles` côté Postgres via Drizzle.
 *
 * Idempotent :
 *  - upsert sur `sources.code`
 *  - upsert sur `textes.slug`
 *  - upsert sur `articles (texte_id, numero)`
 *
 * Usage : DATABASE_URL=postgres://... npx tsx scripts/ingest-articles.ts [--jsonl path]
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { eq } from "drizzle-orm";

import { getDb } from "../lib/db";
import { articles, sources, textes } from "../lib/db/schema";

type Row = {
  texte_slug: string;
  source_code: string;
  source_filename?: string;
  source_key?: string;
  type?: string;
  domaine?: string | null;
  code?: string;
  reference?: string | null;
  titre_texte?: string | null;
  autorite?: string | null;
  date_publication?: string | null;
  url_source?: string | null;
  numero: string;
  contenu: string;
  position: number;
  titre_section?: string | null;
};

function parseArgs(): { jsonl: string } {
  const args = process.argv.slice(2);
  let jsonl =
    process.env.ARTICLES_JSONL ??
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../backend/data/articles_ingest.jsonl");
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--jsonl" && args[i + 1]) {
      jsonl = path.resolve(args[++i]);
    }
  }
  return { jsonl };
}

async function readJsonl(file: string): Promise<Row[]> {
  const raw = await fs.readFile(file, "utf-8");
  const out: Row[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      out.push(JSON.parse(trimmed) as Row);
    } catch (e) {
      console.warn("[ingest-articles] ligne JSON invalide ignorée :", e);
    }
  }
  return out;
}

async function ensureSource(
  db: NonNullable<ReturnType<typeof getDb>>,
  code: string,
): Promise<number> {
  const existing = await db
    .select({ id: sources.id })
    .from(sources)
    .where(eq(sources.code, code))
    .limit(1);
  if (existing[0]) return existing[0].id;

  const nom =
    code === "JOG"
      ? "Journal officiel du Gabon"
      : code === "OHADA"
        ? "OHADA"
        : code === "CEMAC"
          ? "CEMAC"
          : code === "COBAC"
            ? "COBAC"
            : code;
  const urlBase =
    code === "JOG"
      ? "https://journal-officiel.ga/"
      : code === "OHADA"
        ? "https://www.ohada.org/"
        : code === "CEMAC"
          ? "https://cemac.int/"
          : code === "COBAC"
            ? "https://www.beac.int/supervision-bancaire/reglements-de-cobac"
            : "";
  const inserted = await db
    .insert(sources)
    .values({ code, nom, urlBase, estActif: true })
    .returning({ id: sources.id });
  return inserted[0].id;
}

async function ensureTexte(
  db: NonNullable<ReturnType<typeof getDb>>,
  row: Row,
  sourceId: number,
): Promise<string> {
  const existing = await db
    .select({ id: textes.id })
    .from(textes)
    .where(eq(textes.slug, row.texte_slug))
    .limit(1);
  if (existing[0]) {
    await db
      .update(textes)
      .set({
        sourceId,
        type: row.type ?? "loi",
        reference: row.reference ?? row.texte_slug,
        titre: row.titre_texte ?? row.texte_slug,
        datePublication: row.date_publication ?? new Date().toISOString().slice(0, 10),
        urlSource: row.url_source ?? "",
        domaineSlug: row.domaine ?? null,
        updatedAt: new Date(),
      })
      .where(eq(textes.id, existing[0].id));
    return existing[0].id;
  }
  const inserted = await db
    .insert(textes)
    .values({
      slug: row.texte_slug,
      sourceId,
      type: row.type ?? "loi",
      reference: row.reference ?? row.texte_slug,
      titre: row.titre_texte ?? row.texte_slug,
      datePublication: row.date_publication ?? new Date().toISOString().slice(0, 10),
      urlSource: row.url_source ?? "",
      domaineSlug: row.domaine ?? null,
      estEnVigueur: true,
    })
    .returning({ id: textes.id });
  return inserted[0].id;
}

async function upsertArticlesBulk(
  db: NonNullable<ReturnType<typeof getDb>>,
  texteId: string,
  rows: Row[],
): Promise<number> {
  if (rows.length === 0) return 0;
  // Dédoublonnage défensif : certains PDF redémarrent la numérotation en annexes
  // (cas du Code du travail gabonais avec deux "Article 1" et "Article 2"). On garde
  // la première occurrence (corps principal) et on ignore les renumérotations en fin.
  const seenNumeros = new Set<string>();
  const uniqueRows = rows.filter((r) => {
    if (seenNumeros.has(r.numero)) return false;
    seenNumeros.add(r.numero);
    return true;
  });
  const skipped = rows.length - uniqueRows.length;
  if (skipped > 0) {
    console.warn(
      `[ingest-articles] ${skipped} articles dupliqués ignorés pour texte_id=${texteId} (annexes avec renumérotation).`,
    );
  }
  // Stratégie simple et idempotente : on supprime tous les articles du texte puis on réinsère.
  await db.delete(articles).where(eq(articles.texteId, texteId));
  const values = uniqueRows.map((r) => ({
    texteId,
    numero: r.numero,
    titre: null,
    contenu: r.contenu,
    position: r.position,
    titreSection: r.titre_section ?? null,
    refsCroisees: [],
  }));
  // Insertion par lots de 500 pour rester sous la limite des paramètres pg.
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < values.length; i += BATCH) {
    const slice = values.slice(i, i + BATCH);
    await db.insert(articles).values(slice);
    inserted += slice.length;
  }
  return inserted;
}

async function main() {
  const { jsonl } = parseArgs();
  const db = getDb();
  if (!db) {
    console.error("[ingest-articles] DATABASE_URL absent ou invalide. Abandon.");
    process.exit(1);
  }

  let rows: Row[];
  try {
    rows = await readJsonl(jsonl);
  } catch (e) {
    console.error(`[ingest-articles] impossible de lire ${jsonl} :`, e);
    process.exit(1);
  }

  if (rows.length === 0) {
    console.log("[ingest-articles] aucun article à ingérer (JSONL vide).");
    return;
  }

  // Filtrer les lignes avec source_code manquant — on ne peut pas peupler `sources` sans.
  const valid = rows.filter((r) => r.source_code && r.texte_slug);
  if (valid.length < rows.length) {
    console.warn(
      `[ingest-articles] ${rows.length - valid.length} lignes ignorées (source_code ou texte_slug manquant).`,
    );
  }

  // Groupe par texte_slug.
  const bySlug = new Map<string, Row[]>();
  for (const r of valid) {
    const list = bySlug.get(r.texte_slug) ?? [];
    list.push(r);
    bySlug.set(r.texte_slug, list);
  }

  let totalTextes = 0;
  let totalArticles = 0;
  const entries = Array.from(bySlug.entries());
  for (const [slug, items] of entries) {
    const sourceCode = items[0].source_code;
    const sourceId = await ensureSource(db, sourceCode);
    const texteId = await ensureTexte(db, items[0], sourceId);
    const ins = await upsertArticlesBulk(db, texteId, items);
    totalTextes++;
    totalArticles += ins;
    console.log(`[ingest-articles] ${slug} (${sourceCode}) → ${ins} articles`);
  }
  console.log(`[ingest-articles] TOTAL : ${totalTextes} textes, ${totalArticles} articles`);
}

main().catch((e) => {
  console.error("[ingest-articles] fatal", e);
  process.exit(1);
});
