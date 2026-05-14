import { Meilisearch } from "meilisearch";
import { mockVeille } from "@/lib/mock/veille";

export function getMeili() {
  const host = process.env.MEILISEARCH_HOST;
  const key = process.env.MEILISEARCH_API_KEY;
  if (!host || !key) return null;
  return new Meilisearch({ host, apiKey: key });
}

export async function searchTextes(q: string) {
  const client = getMeili();
  if (client) {
    try {
      const res = await client.index("textes").search(q, { limit: 20 });
      return res.hits.map((h) => {
        const doc = h as Record<string, unknown>;
        return {
          slug: String(doc.slug ?? ""),
          titre: String(doc.titre ?? ""),
          resume: String(doc.resume ?? ""),
          source: String(doc.source ?? ""),
        };
      });
    } catch {
      /* fallback */
    }
  }
  const s = q.toLowerCase();
  return mockVeille
    .filter(
      (m) =>
        !s ||
        m.titre.toLowerCase().includes(s) ||
        m.resume.toLowerCase().includes(s) ||
        m.source.toLowerCase().includes(s),
    )
    .map((m) => ({
      slug: m.slug,
      titre: m.titre,
      resume: m.resume,
      source: m.source,
    }));
}
