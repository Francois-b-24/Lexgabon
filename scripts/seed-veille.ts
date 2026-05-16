/**
 * Seed initial de la table `veille_items` à partir de `lib/veille/official-feed.ts`.
 * Idempotent par `slug` (upsert). Cette table sera ensuite enrichie par le cron
 * d'ingestion (T2.4 — endpoint backend `/api/veille/ingest` à venir).
 *
 * Usage : DATABASE_URL=postgres://... npx tsx scripts/seed-veille.ts
 */
import { eq } from "drizzle-orm";

import { getDb } from "../lib/db";
import { veilleItems } from "../lib/db/schema";
import { OFFICIAL_VEILLE_FEED } from "../lib/veille/official-feed";
import { sourceUrlSlugFromDbCode } from "../lib/sources";

async function main() {
  const db = getDb();
  if (!db) {
    console.error("[seed-veille] DATABASE_URL absent. Abandon.");
    process.exit(1);
  }

  let upserted = 0;
  let skipped = 0;

  for (const item of OFFICIAL_VEILLE_FEED) {
    const sourceSlug = sourceUrlSlugFromDbCode(item.source.toUpperCase());
    if (!sourceSlug) {
      console.warn(`[seed-veille] source inconnue ${item.source}, ignoré (slug=${item.slug})`);
      skipped++;
      continue;
    }

    const existing = await db
      .select({ id: veilleItems.id })
      .from(veilleItems)
      .where(eq(veilleItems.slug, item.slug))
      .limit(1);

    const values = {
      slug: item.slug,
      source: sourceSlug,
      type: null,
      titre: item.titre,
      resume: item.resume,
      url: item.url,
      portal: item.portal,
      domaine: null,
      datePublication: item.dateIso ?? null,
      estNouveau: Boolean(item.isNew),
    };

    if (existing[0]) {
      await db
        .update(veilleItems)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(veilleItems.id, existing[0].id));
    } else {
      await db.insert(veilleItems).values(values);
    }
    upserted++;
  }

  console.log(`[seed-veille] ${upserted} items upsertés (${skipped} ignorés)`);
}

main().catch((e) => {
  console.error("[seed-veille] fatal", e);
  process.exit(1);
});
