import { getDb } from "@/lib/db";
import { chunks, textes } from "@/lib/db/schema";
import { getMeili } from "@/lib/meilisearch";
import { eq, ilike, or } from "drizzle-orm";
import { getAllowlistedHosts, isUrlAllowlisted } from "@/lib/amaia/allowlist-fetch";

export type AmaiaIndexedRetrieval = {
  /** Bloc texte pour le prompt (chunks DB ou résumés Meilisearch). */
  indexedBlock: string;
  /** Au plus une URL Meilisearch allowlistée, pour compléter le fetch web. */
  meiliSourceUrls: string[];
};

function readMeiliDocUrl(doc: Record<string, unknown>): string {
  const raw = doc.url_source ?? doc.urlSource ?? doc.url ?? "";
  return String(raw ?? "").trim();
}

async function retrieveFromMeilisearch(query: string): Promise<{ text: string; sourceUrls: string[] }> {
  const client = getMeili();
  const hosts = getAllowlistedHosts();
  if (!client) return { text: "", sourceUrls: [] };

  try {
    const res = await client.index("textes").search(query, { limit: 8 });
    const parts: string[] = [];
    let meiliAllowlistedUrl: string | undefined;

    for (const h of res.hits) {
      const doc = h as Record<string, unknown>;
      const titre = String(doc.titre ?? "");
      const resume = String(doc.resume ?? "");
      const slug = String(doc.slug ?? "");
      const source = String(doc.source ?? "");
      const url = readMeiliDocUrl(doc);
      if (!meiliAllowlistedUrl && url && isUrlAllowlisted(url, hosts)) {
        meiliAllowlistedUrl = url;
      }
      const urlLine = url ? `URL officielle (référence) : ${url}` : "";
      const block = [titre ? `[${titre}]` : "", urlLine, resume || slug, source ? `(${source})` : ""]
        .filter(Boolean)
        .join("\n");
      if (block) parts.push(block);
    }

    return {
      text: parts.join("\n\n---\n\n"),
      sourceUrls: meiliAllowlistedUrl ? [meiliAllowlistedUrl] : [],
    };
  } catch {
    return { text: "", sourceUrls: [] };
  }
}

export async function retrieveAmaiaIndexedParts(query: string): Promise<AmaiaIndexedRetrieval> {
  const q = query.trim();
  if (!q) return { indexedBlock: "", meiliSourceUrls: [] };

  const db = getDb();
  if (db) {
    try {
      const ilikeQ = `%${q}%`;
      const rows = await db
        .select({
          contenu: chunks.contenu,
          titre: textes.titre,
          urlSource: textes.urlSource,
        })
        .from(chunks)
        .innerJoin(textes, eq(chunks.texteId, textes.id))
        .where(or(ilike(chunks.contenu, ilikeQ), ilike(textes.titre, ilikeQ)))
        .limit(8);
      if (rows.length) {
        const indexedBlock = rows
          .map((r) => {
            const ref = r.urlSource ? `URL officielle (référence) : ${r.urlSource}` : "";
            return [`[${r.titre}]`, ref, r.contenu].filter(Boolean).join("\n");
          })
          .join("\n\n---\n\n");
        return { indexedBlock, meiliSourceUrls: [] };
      }
      const any = await db
        .select({ contenu: chunks.contenu, titre: textes.titre, urlSource: textes.urlSource })
        .from(chunks)
        .innerJoin(textes, eq(chunks.texteId, textes.id))
        .limit(6);
      if (any.length) {
        const indexedBlock = any
          .map((r) => {
            const ref = r.urlSource ? `URL officielle (référence) : ${r.urlSource}` : "";
            return [`[${r.titre}]`, ref, r.contenu].filter(Boolean).join("\n");
          })
          .join("\n\n---\n\n");
        return { indexedBlock, meiliSourceUrls: [] };
      }
    } catch {
      /* fallback Meilisearch ci-dessous */
    }
  }

  const { text, sourceUrls } = await retrieveFromMeilisearch(q);
  return { indexedBlock: text, meiliSourceUrls: sourceUrls };
}
