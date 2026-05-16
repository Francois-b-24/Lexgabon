/**
 * Récupère l'état du corpus depuis le backend FastAPI (D6).
 *
 * - Endpoint cible : `GET ${LEGAL_AGENT_API_BASE_URL}/api/corpus/status`.
 * - Cache Next : `revalidate = 3600` (1h). Suffisant pour des stats qui bougent
 *   au rythme des ingestions manuelles.
 * - Fallback : `CORPUS_SOURCES` statique de `lib/methodologie-data.ts` si le
 *   backend est injoignable. La page reste utilisable.
 */
import "server-only";

import { CORPUS_LAST_UPDATED, CORPUS_SOURCES, type CorpusSource } from "@/lib/methodologie-data";

export type CorpusStatus = {
  totalChunks: number;
  articlesDistincts: number;
  sources: CorpusSource[];
  lastUpdated: string; // YYYY-MM-DD
  degraded: boolean; // true si on a dû tomber sur le fallback statique
};

type BackendSource = {
  code: string;
  label: string;
  portal_url: string | null;
  status: "indexed" | "partial" | "monitored";
  texts: string[];
};

type BackendResponse = {
  total_chunks: number;
  articles_distincts: number;
  sources: BackendSource[];
  last_updated: string | null;
};

function fallback(): CorpusStatus {
  return {
    totalChunks: 0,
    articlesDistincts: 0,
    sources: CORPUS_SOURCES,
    lastUpdated: CORPUS_LAST_UPDATED,
    degraded: true,
  };
}

function isoToDate(iso: string | null | undefined): string {
  if (!iso) return CORPUS_LAST_UPDATED;
  return iso.slice(0, 10); // ISO 8601 → YYYY-MM-DD
}

export async function getCorpusStatus(): Promise<CorpusStatus> {
  const base = process.env.LEGAL_AGENT_API_BASE_URL?.trim();
  if (!base) return fallback();

  const url = `${base.replace(/\/$/, "")}/api/corpus/status`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as BackendResponse;
    if (!data || typeof data.total_chunks !== "number") {
      return fallback();
    }

    const sources: CorpusSource[] = data.sources.map((s) => ({
      dbCode: s.code,
      label: s.label,
      portalUrl: s.portal_url ?? "",
      status: s.status,
      lastSync: isoToDate(data.last_updated),
      texts: s.texts ?? [],
    }));

    return {
      totalChunks: data.total_chunks,
      articlesDistincts: data.articles_distincts,
      sources,
      lastUpdated: isoToDate(data.last_updated),
      degraded: false,
    };
  } catch (e) {
    console.error("[corpus-status] backend unreachable", e);
    return fallback();
  }
}
