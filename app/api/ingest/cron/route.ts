/**
 * Cron Vercel quotidien (03:00 UTC, voir vercel.json) — T2.4.
 *
 * Stratégie actuelle : on relit `OFFICIAL_VEILLE_FEED` (source curée côté code)
 * et on upsert idempotamment dans `veille_items`. Ça garantit que la page /veille
 * et le flux RSS reflètent toujours l'état du fichier `lib/veille/official-feed.ts`.
 *
 * Évolution prévue : remplacer cette synchronisation par un appel au backend
 * `POST /api/veille/ingest` qui (a) rescrape les portails listés dans `sources.yaml`,
 * (b) extrait titre/date du HTML, (c) renvoie un JSON d'items que cette route persiste.
 *
 * Le seed initial reste disponible via `npm run db:seed-veille`.
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { veilleItems } from "@/lib/db/schema";
import { OFFICIAL_VEILLE_FEED } from "@/lib/veille/official-feed";
import { sourceUrlSlugFromDbCode } from "@/lib/sources";

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  // Vercel Cron envoie GET avec `Authorization: Bearer <CRON_SECRET>`.
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function syncVeille(): Promise<{
  upserted: number;
  skipped: number;
  unchanged: number;
}> {
  const db = getDb();
  if (!db) {
    return { upserted: 0, skipped: OFFICIAL_VEILLE_FEED.length, unchanged: 0 };
  }
  let upserted = 0;
  let skipped = 0;
  let unchanged = 0;
  for (const item of OFFICIAL_VEILLE_FEED) {
    const sourceSlug = sourceUrlSlugFromDbCode(item.source.toUpperCase());
    if (!sourceSlug) {
      skipped++;
      continue;
    }
    const existing = await db
      .select({ id: veilleItems.id, titre: veilleItems.titre, url: veilleItems.url })
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
      if (existing[0].titre === item.titre && existing[0].url === item.url) {
        unchanged++;
        continue;
      }
      await db
        .update(veilleItems)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(veilleItems.id, existing[0].id));
      upserted++;
    } else {
      await db.insert(veilleItems).values(values);
      upserted++;
    }
  }
  return { upserted, skipped, unchanged };
}

export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const stats = await syncVeille();
    return NextResponse.json({ ok: true, mode: "GET", ...stats });
  } catch (e) {
    console.error("[cron] sync failed", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const stats = await syncVeille();
    return NextResponse.json({ ok: true, mode: "POST", ...stats });
  } catch (e) {
    console.error("[cron] sync failed", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
