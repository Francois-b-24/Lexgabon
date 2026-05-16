/**
 * Cron Vercel quotidien (03:00 UTC, voir vercel.json).
 *
 * Stratégie (D7) :
 * 1. Appelle le backend FastAPI POST /api/veille/scrape qui crawle les portails
 *    officiels (OHADA, JO Gabon, CEMAC, COBAC, CIMA) et renvoie une liste
 *    d'items détectés.
 * 2. Upsert ces items dans la table `veille_items` (idempotent par slug).
 * 3. Fallback gracieux : si le backend est injoignable, on retombe sur
 *    `OFFICIAL_VEILLE_FEED` (synchronisation du fichier curé côté code).
 *
 * Auth : Bearer CRON_SECRET.
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { veilleItems } from "@/lib/db/schema";
import { OFFICIAL_VEILLE_FEED } from "@/lib/veille/official-feed";
import { sourceUrlSlugFromDbCode, isValidSourceUrlSlug } from "@/lib/sources";

type ScrapeItem = {
  slug: string;
  source: string;
  type: string | null;
  titre: string;
  resume: string | null;
  url: string;
  portal: string;
  date_publication: string | null;
};

type SyncStats = {
  source: "scrape" | "fallback";
  totalItems: number;
  upserted: number;
  unchanged: number;
  skipped: number;
  errors: number;
};

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function fetchFromBackend(): Promise<{ items: ScrapeItem[]; errors: number } | null> {
  const base = process.env.LEGAL_AGENT_API_BASE_URL?.trim();
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) return null;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/veille/scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[cron] backend scrape failed", res.status);
      return null;
    }
    const data = (await res.json()) as { items?: ScrapeItem[]; errors?: unknown[] };
    return {
      items: data.items ?? [],
      errors: Array.isArray(data.errors) ? data.errors.length : 0,
    };
  } catch (e) {
    console.error("[cron] backend scrape unreachable", e);
    return null;
  }
}

async function upsertFromScrape(items: ScrapeItem[]): Promise<SyncStats> {
  const db = getDb();
  const stats: SyncStats = {
    source: "scrape",
    totalItems: items.length,
    upserted: 0,
    unchanged: 0,
    skipped: 0,
    errors: 0,
  };
  if (!db) {
    stats.skipped = items.length;
    return stats;
  }
  for (const item of items) {
    if (!isValidSourceUrlSlug(item.source)) {
      stats.skipped++;
      continue;
    }
    const existing = await db
      .select({ id: veilleItems.id, titre: veilleItems.titre, url: veilleItems.url })
      .from(veilleItems)
      .where(eq(veilleItems.slug, item.slug))
      .limit(1);
    const values = {
      slug: item.slug,
      source: item.source,
      type: item.type,
      titre: item.titre,
      resume: item.resume,
      url: item.url,
      portal: item.portal,
      domaine: null,
      datePublication: item.date_publication,
      estNouveau: !existing[0], // marqué nouveau si on le découvre
    };
    if (existing[0]) {
      if (existing[0].titre === item.titre && existing[0].url === item.url) {
        stats.unchanged++;
        continue;
      }
      await db
        .update(veilleItems)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(veilleItems.id, existing[0].id));
      stats.upserted++;
    } else {
      await db.insert(veilleItems).values(values);
      stats.upserted++;
    }
  }
  return stats;
}

async function syncFromFallback(): Promise<SyncStats> {
  const db = getDb();
  const stats: SyncStats = {
    source: "fallback",
    totalItems: OFFICIAL_VEILLE_FEED.length,
    upserted: 0,
    unchanged: 0,
    skipped: 0,
    errors: 0,
  };
  if (!db) {
    stats.skipped = OFFICIAL_VEILLE_FEED.length;
    return stats;
  }
  for (const item of OFFICIAL_VEILLE_FEED) {
    const sourceSlug = sourceUrlSlugFromDbCode(item.source.toUpperCase());
    if (!sourceSlug) {
      stats.skipped++;
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
        stats.unchanged++;
        continue;
      }
      await db
        .update(veilleItems)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(veilleItems.id, existing[0].id));
      stats.upserted++;
    } else {
      await db.insert(veilleItems).values(values);
      stats.upserted++;
    }
  }
  return stats;
}

async function run(): Promise<SyncStats> {
  const scrape = await fetchFromBackend();
  if (scrape && scrape.items.length > 0) {
    const stats = await upsertFromScrape(scrape.items);
    stats.errors = scrape.errors;
    return stats;
  }
  return syncFromFallback();
}

export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const stats = await run();
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
    const stats = await run();
    return NextResponse.json({ ok: true, mode: "POST", ...stats });
  } catch (e) {
    console.error("[cron] sync failed", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
