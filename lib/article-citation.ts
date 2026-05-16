/**
 * Fonction pure pour construire la citation normalisée d'un article (T2.1).
 *
 * Forme cible : « Art. 12 du Code du travail (Loi n° 022/2021 du 19 novembre 2021) ».
 *
 * Ne PAS placer cette fonction dans un fichier `"use client"` : elle est appelée
 * en SSR depuis app/[locale]/(app)/textes/[source]/[slug]/page.tsx (server component).
 * Un import depuis un fichier client réduirait l'export à un proxy `undefined` côté serveur.
 */
export function buildArticleCitation(
  articleNumero: string,
  texteTitre: string,
  reference: string | null,
): string {
  const codeName = texteTitre.replace(/\s*\(.*?\)\s*$/, "").trim();
  const base = `Art. ${articleNumero} du ${codeName}`;
  if (!reference) return base;
  if (base.includes(reference)) return base;
  return `${base} (${reference})`;
}
