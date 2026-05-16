/**
 * Service de recherche pour la route SSR `/recherche` et l'API `/api/search`.
 *
 * - `mode=fulltext` → Meilisearch (index `textes`).
 * - `mode=semantic` → proxy POST vers le backend FastAPI (qui interroge Chroma).
 *
 * Si Meili / le backend sont indisponibles, fallback gracieux sur `mockVeille`
 * (déjà utilisé ailleurs dans l'app) avec `degraded: true` dans la réponse.
 */
import "server-only";

import { Meilisearch } from "meilisearch";
import { mockVeille } from "@/lib/mock/veille";
import {
  ALL_SOURCE_URL_SLUGS,
  type SourceUrlSlug,
  isValidSourceUrlSlug,
  sourceUrlSlugFromDbCode,
} from "@/lib/sources";
import {
  SEARCH_PAGE_SIZE,
  SEARCH_PAGE_SIZE_MAX,
  type SearchFilters,
  type SearchHit,
  type SearchResponse,
} from "@/lib/search-types";

const MEILI_INDEX = "textes";

function getMeili() {
  const host = process.env.MEILISEARCH_HOST;
  const key = process.env.MEILISEARCH_API_KEY;
  if (!host || !key) return null;
  try {
    return new Meilisearch({ host, apiKey: key });
  } catch (e) {
    console.error("[search-service] meili init", e);
    return null;
  }
}

function buildMeiliFilter(filters: SearchFilters): string[] {
  const clauses: string[] = [];
  if (filters.sources.length > 0) {
    const list = filters.sources.map((s) => `"${s}"`).join(", ");
    clauses.push(`source IN [${list}]`);
  }
  if (filters.types.length > 0) {
    const list = filters.types.map((t) => `"${t}"`).join(", ");
    clauses.push(`type IN [${list}]`);
  }
  if (filters.domaines.length > 0) {
    // T2.1 : on filtre sur le champ `domaine` (slug string) indexé via T1.3 schéma + ingest-articles.
    // `domaines` int[] reste pour compat future (table `domaines` peuplée).
    const list = filters.domaines.map((d) => `"${d}"`).join(", ");
    clauses.push(`domaine IN [${list}]`);
  }
  if (filters.dateFrom) {
    clauses.push(`datePublicationTs >= ${dateToTimestamp(filters.dateFrom)}`);
  }
  if (filters.dateTo) {
    clauses.push(`datePublicationTs <= ${dateToTimestamp(filters.dateTo)}`);
  }
  return clauses;
}

function dateToTimestamp(iso: string): number {
  const d = new Date(`${iso}T00:00:00Z`);
  return Math.floor(d.getTime() / 1000);
}

function fallbackFromMock(filters: SearchFilters): SearchResponse {
  const q = filters.q.trim().toLowerCase();
  let list = mockVeille.slice();
  if (q) {
    list = list.filter(
      (m) =>
        m.titre.toLowerCase().includes(q) ||
        m.resume.toLowerCase().includes(q) ||
        m.source.toLowerCase().includes(q),
    );
  }
  if (filters.sources.length > 0) {
    list = list.filter((m) => {
      const slug = sourceUrlSlugFromDbCode(m.source.toUpperCase());
      return slug !== null && filters.sources.includes(slug);
    });
  }

  const hits: SearchHit[] = list.map((m) => {
    const sourceSlug = sourceUrlSlugFromDbCode(m.source.toUpperCase());
    return {
      slug: m.slug,
      source: sourceSlug,
      sourceLabel: m.source,
      titre: m.titre,
      resume: m.resume,
      type: null,
      reference: null,
      datePublication: m.dateIso ?? null,
      estEnVigueur: true,
    };
  });

  const total = hits.length;
  const start = (filters.page - 1) * filters.pageSize;
  const paged = hits.slice(start, start + filters.pageSize);
  return {
    hits: paged,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    mode: filters.mode,
    degraded: true,
  };
}

export function clampPageSize(n: number | undefined): number {
  if (!n || Number.isNaN(n)) return SEARCH_PAGE_SIZE;
  return Math.max(1, Math.min(SEARCH_PAGE_SIZE_MAX, Math.floor(n)));
}

export function parseSearchFilters(searchParams: URLSearchParams): SearchFilters {
  const rawSources = searchParams.getAll("source").filter(isValidSourceUrlSlug);
  const sources: SourceUrlSlug[] = rawSources.length > 0 ? Array.from(new Set(rawSources)) : [];
  const types = searchParams.getAll("type").filter((t) => t.length > 0 && t.length < 32);
  const domaines = searchParams
    .getAll("domaine")
    .filter((d) => /^[a-z0-9-]{1,32}$/i.test(d));
  const mode = (searchParams.get("mode") === "semantic" ? "semantic" : "fulltext") as
    | "semantic"
    | "fulltext";
  const rawPage = Number(searchParams.get("page") ?? 1);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const pageSize = clampPageSize(Number(searchParams.get("pageSize") ?? SEARCH_PAGE_SIZE));

  return {
    q: (searchParams.get("q") ?? "").slice(0, 256),
    mode,
    sources,
    types,
    domaines,
    dateFrom: validateIsoDate(searchParams.get("date_from")),
    dateTo: validateIsoDate(searchParams.get("date_to")),
    page,
    pageSize,
  };
}

function validateIsoDate(raw: string | null): string | null {
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : raw;
}

async function searchFulltext(filters: SearchFilters): Promise<SearchResponse> {
  const client = getMeili();
  if (!client) return fallbackFromMock(filters);
  try {
    const filter = buildMeiliFilter(filters);
    const res = await client.index(MEILI_INDEX).search(filters.q, {
      limit: filters.pageSize,
      offset: (filters.page - 1) * filters.pageSize,
      filter: filter.length ? filter : undefined,
    });
    const hits: SearchHit[] = res.hits.map((h) => {
      const doc = h as Record<string, unknown>;
      const rawSource = typeof doc.source === "string" ? doc.source : "";
      const slug = isValidSourceUrlSlug(rawSource) ? rawSource : null;
      return {
        slug: String(doc.slug ?? ""),
        source: slug,
        sourceLabel: typeof doc.sourceLabel === "string" ? doc.sourceLabel : null,
        titre: String(doc.titre ?? ""),
        resume: typeof doc.resume === "string" ? doc.resume : null,
        type: typeof doc.type === "string" ? doc.type : null,
        reference: typeof doc.reference === "string" ? doc.reference : null,
        datePublication: typeof doc.datePublication === "string" ? doc.datePublication : null,
        estEnVigueur: doc.estEnVigueur !== false,
      };
    });
    return {
      hits,
      total: res.estimatedTotalHits ?? hits.length,
      page: filters.page,
      pageSize: filters.pageSize,
      mode: "fulltext",
      degraded: false,
    };
  } catch (e) {
    console.error("[search-service] meili search failed", e);
    return fallbackFromMock(filters);
  }
}

async function searchSemantic(filters: SearchFilters): Promise<SearchResponse> {
  const base = process.env.LEGAL_AGENT_API_BASE_URL?.trim();
  if (!base) return fallbackFromMock(filters);

  const url = `${base.replace(/\/$/, "")}/api/search-semantic`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: filters.q,
        sources: filters.sources,
        types: filters.types,
        domaines: filters.domaines,
        date_from: filters.dateFrom,
        date_to: filters.dateTo,
        limit: filters.pageSize,
        offset: (filters.page - 1) * filters.pageSize,
      }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as {
      hits?: Array<Record<string, unknown>>;
      total?: number;
    };
    const hits: SearchHit[] = (data.hits ?? []).map((h) => {
      const rawSource = typeof h.source === "string" ? h.source : "";
      const slug = isValidSourceUrlSlug(rawSource) ? rawSource : null;
      return {
        slug: String(h.slug ?? ""),
        source: slug,
        sourceLabel: typeof h.sourceLabel === "string" ? h.sourceLabel : null,
        titre: String(h.titre ?? ""),
        resume: typeof h.resume === "string" ? h.resume : null,
        type: typeof h.type === "string" ? h.type : null,
        reference: typeof h.reference === "string" ? h.reference : null,
        datePublication: typeof h.datePublication === "string" ? h.datePublication : null,
        estEnVigueur: h.estEnVigueur !== false,
        articleNumero: typeof h.articleNumero === "string" ? h.articleNumero : null,
        score: typeof h.score === "number" ? h.score : undefined,
      };
    });
    return {
      hits,
      total: typeof data.total === "number" ? data.total : hits.length,
      page: filters.page,
      pageSize: filters.pageSize,
      mode: "semantic",
      degraded: false,
    };
  } catch (e) {
    console.error("[search-service] semantic search failed", e);
    return fallbackFromMock(filters);
  }
}

export async function runSearch(filters: SearchFilters): Promise<SearchResponse> {
  if (filters.mode === "semantic" && filters.q.trim().length >= 3) {
    return searchSemantic(filters);
  }
  return searchFulltext(filters);
}

export const SUPPORTED_TYPES = [
  "loi",
  "ordonnance",
  "decret",
  "acte uniforme",
  "reglement",
  "circulaire",
] as const;
export type SupportedType = (typeof SUPPORTED_TYPES)[number];

export const SUPPORTED_DOMAINES = [
  "civil",
  "penal",
  "commercial",
  "travail",
  "administratif",
  "fiscal",
  "famille",
  "social",
] as const;
export type SupportedDomaine = (typeof SUPPORTED_DOMAINES)[number];

export const SOURCE_FILTER_OPTIONS = ALL_SOURCE_URL_SLUGS;
