/**
 * Service de lecture des textes juridiques (Postgres via Drizzle).
 * Encapsule les requêtes pour la route SSR `/textes/[source]/[slug]`.
 */
import "server-only";

import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { articles, sources, textes } from "@/lib/db/schema";
import { dbCodesFromUrlSlug, type SourceUrlSlug, sourceUrlSlugFromDbCode } from "@/lib/sources";

export type TexteDetail = {
  id: string;
  slug: string;
  source: SourceUrlSlug;
  sourceLabel: string;
  reference: string;
  titre: string;
  type: string;
  datePublication: string;
  dateEntreeVig: string | null;
  urlSource: string;
  pdfStorageKey: string | null;
  resume: string | null;
  estEnVigueur: boolean;
};

export type TexteArticle = {
  id: string;
  numero: string;
  titre: string | null;
  contenu: string;
  position: number;
  titreSection: string | null;
};

export async function findTexteBySourceAndSlug(
  sourceSlug: SourceUrlSlug,
  textSlug: string,
): Promise<{ texte: TexteDetail; articles: TexteArticle[] } | null> {
  const db = getDb();
  if (!db) return null;

  const dbCodes = dbCodesFromUrlSlug(sourceSlug);
  if (dbCodes.length === 0) return null;

  try {
    const rows = await db
      .select({
        id: textes.id,
        slug: textes.slug,
        reference: textes.reference,
        titre: textes.titre,
        type: textes.type,
        datePublication: textes.datePublication,
        dateEntreeVig: textes.dateEntreeVig,
        urlSource: textes.urlSource,
        pdfStorageKey: textes.pdfStorageKey,
        resume: textes.resume,
        estEnVigueur: textes.estEnVigueur,
        sourceCode: sources.code,
        sourceNom: sources.nom,
      })
      .from(textes)
      .innerJoin(sources, eq(textes.sourceId, sources.id))
      .where(eq(textes.slug, textSlug))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    const resolved = sourceUrlSlugFromDbCode(row.sourceCode);
    if (resolved !== sourceSlug) return null; // slug d'URL ne correspond pas à la source DB

    const artRows = await db
      .select({
        id: articles.id,
        numero: articles.numero,
        titre: articles.titre,
        contenu: articles.contenu,
        position: articles.position,
        titreSection: articles.titreSection,
      })
      .from(articles)
      .where(eq(articles.texteId, row.id))
      .orderBy(asc(articles.position));

    return {
      texte: {
        id: row.id,
        slug: row.slug,
        source: resolved,
        sourceLabel: row.sourceNom,
        reference: row.reference,
        titre: row.titre,
        type: row.type,
        datePublication: String(row.datePublication),
        dateEntreeVig: row.dateEntreeVig ? String(row.dateEntreeVig) : null,
        urlSource: row.urlSource,
        pdfStorageKey: row.pdfStorageKey,
        resume: row.resume,
        estEnVigueur: row.estEnVigueur ?? true,
      },
      articles: artRows.map((a) => ({
        id: a.id,
        numero: a.numero,
        titre: a.titre,
        contenu: a.contenu,
        position: a.position,
        titreSection: a.titreSection,
      })),
    };
  } catch (e) {
    console.error("[textes-service] db read failed", e);
    return null;
  }
}

