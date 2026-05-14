import { fetchAllowlistedPagesContext, selectFeedUrlsForQuery } from "@/lib/amaia/allowlist-fetch";
import { retrieveAmaiaIndexedParts } from "@/lib/amaia/retrieve";

/**
 * Assemble le contexte injecté dans le prompt Ama’IA : base indexée puis extraits HTML
 * issus d’une liste blanche d’institutions (URLs dérivées du flux officiel et, au plus
 * une, d’un hit Meilisearch allowlisté).
 */
export async function buildGabonLawContext(query: string): Promise<string> {
  const { indexedBlock, meiliSourceUrls } = await retrieveAmaiaIndexedParts(query);

  const feedUrls = selectFeedUrlsForQuery(query, 2);
  const extraMeili = meiliSourceUrls.filter((u) => !feedUrls.includes(u)).slice(0, 1);
  const urlsToFetch = [...feedUrls, ...extraMeili];

  const webBlock =
    urlsToFetch.length > 0 ? await fetchAllowlistedPagesContext(urlsToFetch) : "";

  const parts: string[] = [];
  parts.push(
    "### Base documentaire indexée (extraits issus de textes / PDF ingérés — recherche PostgreSQL ou Meilisearch)\n",
  );
  parts.push(
    indexedBlock.trim() ||
      "(Aucun extrait indexé ne correspond clairement à la question ; vous pouvez vous appuyer sur les autres sections ou sur vos connaissances avec prudence.)",
  );
  parts.push(
    "\n\n### Pages web — liste blanche institutions (extrait HTML à l’instant T ; ne se substitue pas au document authentique sur le site source)\n",
  );
  parts.push(
    webBlock.trim() ||
      "(Aucune page institutionnelle sélectionnée ou aucun contenu texte exploitable n’a été récupéré pour cette question.)",
  );

  return parts.join("");
}
