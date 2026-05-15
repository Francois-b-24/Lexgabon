import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { sources, textes } from "@/lib/db/schema";
import { getSiteUrl } from "@/lib/seo";
import { sourceUrlSlugFromDbCode } from "@/lib/sources";

const LOCALES = ["fr", "en"] as const;

const STATIC_PATHS = [
  { path: "", priority: 1.0 },
  { path: "/methodologie", priority: 0.8 },
  { path: "/chatbot", priority: 0.7 },
  { path: "/recherche", priority: 0.7 },
  { path: "/veille", priority: 0.6 },
  { path: "/textes", priority: 0.6 },
  { path: "/mentions-legales", priority: 0.3 },
  { path: "/cgu", priority: 0.3 },
] as const;

export const revalidate = 3600; // 1h

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Pages statiques × locales
  for (const locale of LOCALES) {
    for (const { path, priority } of STATIC_PATHS) {
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority,
      });
    }
  }

  // Textes ingérés en base (jointure pour récupérer le code source → slug d'URL)
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select({
          slug: textes.slug,
          updatedAt: textes.updatedAt,
          sourceCode: sources.code,
        })
        .from(textes)
        .innerJoin(sources, eq(textes.sourceId, sources.id));
      for (const row of rows) {
        const sourceSlug = sourceUrlSlugFromDbCode(row.sourceCode);
        if (!sourceSlug) continue;
        for (const locale of LOCALES) {
          entries.push({
            url: `${base}/${locale}/textes/${sourceSlug}/${encodeURIComponent(row.slug)}`,
            lastModified: row.updatedAt ?? now,
            changeFrequency: "monthly",
            priority: 0.8,
          });
        }
      }
    } catch (e) {
      console.error("[sitemap] db read failed", e);
    }
  }

  return entries;
}
