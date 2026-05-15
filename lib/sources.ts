/**
 * Mapping entre le `code` stocké dans la table `sources` (libellé court arbitraire)
 * et le segment d'URL utilisé sur `/textes/[source]/[slug]`.
 *
 * On garde la table SQL telle quelle ; ce fichier est la source de vérité pour le
 * routing afin de ne pas dépendre d'une colonne supplémentaire.
 */

export type SourceUrlSlug = "jo-ga" | "ohada" | "cemac" | "cobac" | "cima";

const URL_SLUG_BY_DB_CODE: Record<string, SourceUrlSlug> = {
  // Codes attendus côté SQL `sources.code`. Ajouter ici quand on ingère une nouvelle source.
  JOG: "jo-ga",
  "JO-GA": "jo-ga",
  GABON: "jo-ga",
  OHADA: "ohada",
  CEMAC: "cemac",
  COBAC: "cobac",
  CIMA: "cima",
};

const DB_CODE_BY_URL_SLUG: Record<SourceUrlSlug, readonly string[]> = {
  "jo-ga": ["JOG", "JO-GA", "GABON"],
  ohada: ["OHADA"],
  cemac: ["CEMAC"],
  cobac: ["COBAC"],
  cima: ["CIMA"],
};

const URL_SLUG_LABEL_FR: Record<SourceUrlSlug, string> = {
  "jo-ga": "Journal officiel du Gabon",
  ohada: "OHADA",
  cemac: "CEMAC",
  cobac: "COBAC",
  cima: "CIMA",
};

export function sourceUrlSlugFromDbCode(code: string | null | undefined): SourceUrlSlug | null {
  if (!code) return null;
  return URL_SLUG_BY_DB_CODE[code.toUpperCase()] ?? null;
}

export function dbCodesFromUrlSlug(slug: string | null | undefined): readonly string[] {
  if (!slug) return [];
  const key = slug.toLowerCase();
  return key in DB_CODE_BY_URL_SLUG ? DB_CODE_BY_URL_SLUG[key as SourceUrlSlug] : [];
}

export function isValidSourceUrlSlug(slug: string | null | undefined): slug is SourceUrlSlug {
  if (!slug) return false;
  return slug.toLowerCase() in DB_CODE_BY_URL_SLUG;
}

export function sourceLabelFr(slug: SourceUrlSlug): string {
  return URL_SLUG_LABEL_FR[slug];
}

export const ALL_SOURCE_URL_SLUGS: readonly SourceUrlSlug[] = ["jo-ga", "ohada", "cemac", "cobac", "cima"];
