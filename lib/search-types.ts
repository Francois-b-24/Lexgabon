/**
 * Types partagés entre l'API `/api/search`, le service Meilisearch et la page SSR.
 */
import type { SourceUrlSlug } from "@/lib/sources";

export type SearchMode = "fulltext" | "semantic";

export type SearchFilters = {
  q: string;
  mode: SearchMode;
  sources: SourceUrlSlug[];
  types: string[];
  domaines: string[];
  dateFrom: string | null; // YYYY-MM-DD
  dateTo: string | null;
  page: number;
  pageSize: number;
};

export type SearchHit = {
  slug: string;
  source: SourceUrlSlug | null;
  sourceLabel: string | null;
  titre: string;
  resume: string | null;
  type: string | null;
  reference: string | null;
  datePublication: string | null;
  estEnVigueur: boolean;
  /** Numéro d'article qui a matché (mode sémantique) ; null en full-text texte. */
  articleNumero?: string | null;
  /** Score Meili / Chroma normalisé 0-1 (informatif, pas affiché). */
  score?: number;
};

export type FacetDistribution = {
  source: Record<string, number>;
  type: Record<string, number>;
  domaine: Record<string, number>;
};

export type SearchResponse = {
  hits: SearchHit[];
  total: number;
  page: number;
  pageSize: number;
  mode: SearchMode;
  /** `true` si on a renvoyé un fallback faute de Meili/Chroma joignable. */
  degraded: boolean;
  /**
   * Compte par facette (source/type/domaine) calculé par Meilisearch sur la requête courante.
   * `null` quand non disponible (mode sémantique, fallback mock, ou Meili indisponible).
   */
  facets: FacetDistribution | null;
};

export const SEARCH_PAGE_SIZE = 20;
export const SEARCH_PAGE_SIZE_MAX = 50;
