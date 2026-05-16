/**
 * Service de lecture des items de veille (T2.4).
 * Consommé par la page SSR /veille et le flux RSS.
 */
import "server-only";

import { and, desc, eq, gte, ilike, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { veilleItems } from "@/lib/db/schema";
import { OFFICIAL_VEILLE_FEED } from "@/lib/veille/official-feed";
import {
  ALL_SOURCE_URL_SLUGS,
  type SourceUrlSlug,
  isValidSourceUrlSlug,
  sourceUrlSlugFromDbCode,
} from "@/lib/sources";

export type VeilleItemRow = {
  id: string;
  slug: string;
  source: SourceUrlSlug;
  type: string | null;
  titre: string;
  resume: string | null;
  url: string;
  portal: string;
  domaine: string | null;
  datePublication: string | null;
  dateIngest: string;
  estNouveau: boolean;
};

export type VeilleQuery = {
  sources: SourceUrlSlug[];
  domaines: string[];
  q: string;
  limit: number;
  /** Filtre min. de date publication (ISO YYYY-MM-DD) — utile pour RSS « depuis ». */
  since: string | null;
};

const VEILLE_DEFAULT_LIMIT = 60;
const VEILLE_MAX_LIMIT = 200;

export function parseVeilleQuery(searchParams: URLSearchParams): VeilleQuery {
  const sources = Array.from(
    new Set(searchParams.getAll("source").filter(isValidSourceUrlSlug)),
  ) as SourceUrlSlug[];
  const domaines = searchParams
    .getAll("domaine")
    .filter((d) => /^[a-z0-9-]{1,32}$/i.test(d));
  const q = (searchParams.get("q") ?? "").trim().slice(0, 128);
  const rawLimit = Number(searchParams.get("limit") ?? VEILLE_DEFAULT_LIMIT);
  const limit = Number.isFinite(rawLimit)
    ? Math.max(1, Math.min(VEILLE_MAX_LIMIT, Math.floor(rawLimit)))
    : VEILLE_DEFAULT_LIMIT;
  const since = validateIsoDate(searchParams.get("since"));
  return { sources, domaines, q, limit, since };
}

function validateIsoDate(raw: string | null): string | null {
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : raw;
}

/**
 * Lit les items de veille filtrés. Fallback gracieux sur `OFFICIAL_VEILLE_FEED`
 * si la DB est indisponible — la page reste utilisable même sans Postgres.
 */
export async function listVeilleItems(
  query: VeilleQuery,
): Promise<{ items: VeilleItemRow[]; degraded: boolean }> {
  const db = getDb();
  if (!db) return { items: fallbackFromMock(query), degraded: true };

  try {
    const conditions: SQL[] = [];
    if (query.sources.length > 0) {
      conditions.push(
        or(...query.sources.map((s) => eq(veilleItems.source, s))) as SQL,
      );
    }
    if (query.domaines.length > 0) {
      conditions.push(
        or(...query.domaines.map((d) => eq(veilleItems.domaine, d))) as SQL,
      );
    }
    if (query.q) {
      const like = `%${query.q}%`;
      conditions.push(
        or(
          ilike(veilleItems.titre, like),
          ilike(veilleItems.resume, like),
          ilike(veilleItems.portal, like),
        ) as SQL,
      );
    }
    if (query.since) {
      conditions.push(gte(veilleItems.datePublication, query.since));
    }

    const rows = await db
      .select({
        id: veilleItems.id,
        slug: veilleItems.slug,
        source: veilleItems.source,
        type: veilleItems.type,
        titre: veilleItems.titre,
        resume: veilleItems.resume,
        url: veilleItems.url,
        portal: veilleItems.portal,
        domaine: veilleItems.domaine,
        datePublication: veilleItems.datePublication,
        dateIngest: veilleItems.dateIngest,
        estNouveau: veilleItems.estNouveau,
      })
      .from(veilleItems)
      .where(conditions.length > 0 ? and(...conditions) : sql`true`)
      .orderBy(desc(veilleItems.datePublication), desc(veilleItems.dateIngest))
      .limit(query.limit);

    const mapped: VeilleItemRow[] = rows
      .filter((r) => isValidSourceUrlSlug(r.source))
      .map((r) => ({
        id: r.id,
        slug: r.slug,
        source: r.source as SourceUrlSlug,
        type: r.type,
        titre: r.titre,
        resume: r.resume,
        url: r.url,
        portal: r.portal,
        domaine: r.domaine,
        datePublication: r.datePublication ? String(r.datePublication) : null,
        dateIngest: r.dateIngest ? r.dateIngest.toISOString() : new Date().toISOString(),
        estNouveau: r.estNouveau ?? false,
      }));

    if (mapped.length === 0) {
      return { items: fallbackFromMock(query), degraded: true };
    }
    return { items: mapped, degraded: false };
  } catch (e) {
    console.error("[veille-service] read failed", e);
    return { items: fallbackFromMock(query), degraded: true };
  }
}

function fallbackFromMock(query: VeilleQuery): VeilleItemRow[] {
  const filtered = OFFICIAL_VEILLE_FEED.filter((m) => {
    const slug = sourceUrlSlugFromDbCode(m.source.toUpperCase());
    if (query.sources.length > 0) {
      if (!slug || !query.sources.includes(slug)) return false;
    }
    if (query.q) {
      const q = query.q.toLowerCase();
      if (
        !m.titre.toLowerCase().includes(q) &&
        !m.resume.toLowerCase().includes(q) &&
        !m.portal.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (query.since && m.dateIso < query.since) return false;
    return true;
  });

  const now = new Date().toISOString();
  return filtered.slice(0, query.limit).map((m) => {
    const slug = sourceUrlSlugFromDbCode(m.source.toUpperCase());
    return {
      id: m.id,
      slug: m.slug,
      source: (slug ?? "jo-ga") as SourceUrlSlug,
      type: null,
      titre: m.titre,
      resume: m.resume,
      url: m.url,
      portal: m.portal,
      domaine: null,
      datePublication: m.dateIso ?? null,
      dateIngest: now,
      estNouveau: Boolean(m.isNew),
    };
  });
}

export const VEILLE_FILTER_OPTIONS = {
  sources: ALL_SOURCE_URL_SLUGS,
};
