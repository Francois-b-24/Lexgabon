/**
 * Service de lecture des textes juridiques (Postgres via Drizzle).
 * Encapsule les requêtes pour la route SSR `/textes/[source]/[slug]`.
 */
import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { articles, sources, textes, textVersions } from "@/lib/db/schema";
import { dbCodesFromUrlSlug, type SourceUrlSlug, sourceUrlSlugFromDbCode } from "@/lib/sources";
import type { VersionPayload } from "@/lib/text-diff";

export type TexteDetail = {
  id: string;
  slug: string;
  source: SourceUrlSlug;
  sourceLabel: string;
  reference: string;
  titre: string;
  type: string;
  domaineSlug: string | null;
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
        domaineSlug: textes.domaineSlug,
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
        domaineSlug: row.domaineSlug ?? null,
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


export type ArticlePreview = {
  numero: string;
  titre: string | null;
  titreSection: string | null;
  contenu: string;
  texteSlug: string;
  texteTitre: string;
  texteReference: string;
  source: SourceUrlSlug;
  permalink: string; // chemin relatif côté Next, ex. /fr/textes/jo-ga/code-travail-2021#article-12
};

/**
 * Récupère un article unique pour le popover Ama'IA (T2.3).
 * Retourne `null` si la DB est indisponible, le slug texte ou le numéro inexistants.
 */
export async function findArticleByTexteSlugAndNumero(
  texteSlug: string,
  numero: string,
): Promise<ArticlePreview | null> {
  const db = getDb();
  if (!db) return null;
  if (!texteSlug || !numero) return null;
  try {
    const rows = await db
      .select({
        numero: articles.numero,
        titre: articles.titre,
        titreSection: articles.titreSection,
        contenu: articles.contenu,
        texteSlug: textes.slug,
        texteTitre: textes.titre,
        texteReference: textes.reference,
        sourceCode: sources.code,
      })
      .from(articles)
      .innerJoin(textes, eq(articles.texteId, textes.id))
      .innerJoin(sources, eq(textes.sourceId, sources.id))
      .where(and(eq(textes.slug, texteSlug), eq(articles.numero, numero)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    const sourceSlug = sourceUrlSlugFromDbCode(row.sourceCode);
    if (!sourceSlug) return null;
    return {
      numero: row.numero,
      titre: row.titre,
      titreSection: row.titreSection,
      contenu: row.contenu,
      texteSlug: row.texteSlug,
      texteTitre: row.texteTitre,
      texteReference: row.texteReference,
      source: sourceSlug,
      permalink: `/textes/${sourceSlug}/${encodeURIComponent(row.texteSlug)}#article-${row.numero}`,
    };
  } catch (e) {
    console.error("[textes-service] article lookup failed", e);
    return null;
  }
}


export type TextVersionSummary = {
  id: string;
  label: string;
  dateValidite: string;
};

export type TextVersionFull = TextVersionSummary & {
  contenu: VersionPayload;
};

/** Liste les versions d'un texte par slug (ordre date descendante). */
export async function listVersionsForTexteSlug(
  texteSlug: string,
): Promise<TextVersionSummary[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const rows = await db
      .select({
        id: textVersions.id,
        label: textVersions.label,
        dateValidite: textVersions.dateValidite,
      })
      .from(textVersions)
      .innerJoin(textes, eq(textVersions.texteId, textes.id))
      .where(eq(textes.slug, texteSlug))
      .orderBy(desc(textVersions.dateValidite));
    return rows.map((r) => ({
      id: r.id,
      label: r.label,
      dateValidite: String(r.dateValidite),
    }));
  } catch (e) {
    console.error("[textes-service] versions list failed", e);
    return [];
  }
}

/** Récupère une version unique (avec son `contenuJson` parsé). */
export async function getVersionById(versionId: string): Promise<TextVersionFull | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const rows = await db
      .select({
        id: textVersions.id,
        label: textVersions.label,
        dateValidite: textVersions.dateValidite,
        contenuJson: textVersions.contenuJson,
      })
      .from(textVersions)
      .where(eq(textVersions.id, versionId))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    const payload = row.contenuJson as VersionPayload;
    if (!payload || !Array.isArray(payload.articles)) return null;
    return {
      id: row.id,
      label: row.label,
      dateValidite: String(row.dateValidite),
      contenu: payload,
    };
  } catch (e) {
    console.error("[textes-service] version lookup failed", e);
    return null;
  }
}
