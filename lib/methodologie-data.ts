/**
 * Données affichées sur la page Méthodologie.
 *
 * Source de vérité : `backend/corpus/pdfs/manifest.yaml` et `backend/corpus/sources.yaml`.
 * Ce fichier doit rester synchronisé manuellement avec eux. Quand un nouveau code
 * sera ingéré, ajouter une entrée ici également.
 *
 * Note dette : à terme, exposer un endpoint `/api/corpus/status` côté FastAPI
 * qui lit ces YAML et publie les sources + date de dernière sync. La page
 * Méthodologie consommera alors cet endpoint en SSR (revalidation horaire).
 */

export type CorpusSource = {
  /** Code court côté DB (sources.code), mappé vers slug d'URL via lib/sources.ts. */
  dbCode: string;
  /** Libellé long affiché. */
  label: string;
  /** URL du portail officiel. */
  portalUrl: string;
  /** Statut d'ingestion : "indexed" (présent dans Chroma + Postgres), "partial" (scrapping en place mais quelques textes), "monitored" (allowlist seulement, pas encore ingéré). */
  status: "indexed" | "partial" | "monitored";
  /** Dernière synchronisation connue (YYYY-MM-DD). */
  lastSync: string;
  /** Liste indicative de textes ingérés ou suivis. */
  texts: string[];
};

/** Date de dernière mise à jour globale de l'index (manuelle, à mettre à jour à chaque ingestion). */
export const CORPUS_LAST_UPDATED = "2026-05-16";

/** Sources primaires suivies. Aligné sur `backend/corpus/sources.yaml`. */
export const CORPUS_SOURCES: CorpusSource[] = [
  {
    dbCode: "JOG",
    label: "Journal officiel de la République gabonaise",
    portalUrl: "https://journal-officiel.ga/",
    status: "partial",
    lastSync: "2026-05-16",
    texts: [
      "Code du travail — Loi n° 022/2021 du 19 novembre 2021 (ingéré, 415 articles)",
      "Code électoral — Loi organique n° 001/2025 (page suivie, ingestion à venir)",
      "Constitution gabonaise — Loi référendaire n° 002-R/2024 (page suivie)",
    ],
  },
  {
    dbCode: "OHADA",
    label: "Organisation pour l'Harmonisation en Afrique du Droit des Affaires",
    portalUrl: "https://www.ohada.org/",
    status: "monitored",
    lastSync: "2026-05-16",
    texts: [
      "Index officiel des actes uniformes en vigueur",
      "Acte uniforme sur les procédures simplifiées de recouvrement (révision 17/10/2023)",
    ],
  },
  {
    dbCode: "CEMAC",
    label: "Communauté Économique et Monétaire de l'Afrique Centrale",
    portalUrl: "https://cemac.int/",
    status: "monitored",
    lastSync: "2026-05-16",
    texts: ["Décisions communautaires CEMAC"],
  },
  {
    dbCode: "COBAC",
    label: "Commission Bancaire de l'Afrique Centrale",
    portalUrl: "https://www.beac.int/supervision-bancaire/reglements-de-cobac",
    status: "monitored",
    lastSync: "2026-05-16",
    texts: ["Recueil officiel des règlements COBAC"],
  },
  {
    dbCode: "CIMA",
    label: "Conférence Interafricaine des Marchés d'Assurances",
    portalUrl: "https://cima-afrique.org/",
    status: "monitored",
    lastSync: "2026-05-16",
    texts: ["Code des assurances CIMA (suivi à venir)"],
  },
];
