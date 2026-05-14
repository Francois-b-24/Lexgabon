import type { VeilleItem } from "@/lib/veille/types";

/**
 * Sélection manuelle d’entrées pointant vers des **publications ou portails officiels**
 * (Journal officiel du Gabon, OHADA, BEAC/COBAC, CEMAC). Les titres et dates reprennent
 * les références publiques usuelles ; les résumés restent courts et indicatifs — seul le
 * document accessible via le lien fait foi.
 */
export const OFFICIAL_VEILLE_FEED: VeilleItem[] = [
  {
    id: "jo-loi-org-001-2025",
    slug: "loi-organique-001-2025-code-electoral",
    source: "Gabon",
    date: "19 janv. 2025",
    dateIso: "2025-01-19",
    titre: "Loi organique n°001/2025 — Code électoral de la République gabonaise",
    resume:
      "Texte paru au Journal officiel : organisation des élections et référendums (présidentielle, législatives, sénatoriales, locales).",
    portal: "journal-officiel.ga",
    url: "https://journal-officiel.ga/21554-001-2025-/",
    isNew: true,
  },
  {
    id: "jo-loi-ref-002-r-2024",
    slug: "loi-referendaire-002-r-2024-constitution",
    source: "Gabon",
    date: "19 déc. 2024",
    dateIso: "2024-12-19",
    titre: "Loi référendaire n°002-R/2024 — Constitution de la République gabonaise",
    resume:
      "Publication au Journal officiel suite au référendum : texte constitutionnel adopté et promulgué.",
    portal: "journal-officiel.ga",
    url: "https://journal-officiel.ga/21489-002-r-2024-/",
    isNew: true,
  },
  {
    id: "jo-loi-022-2024",
    slug: "loi-022-2024-ordonnances-urgence",
    source: "Gabon",
    date: "21 juil. 2024",
    dateIso: "2024-07-21",
    titre: "Loi n°022/2024 — Pouvoir du Président de la Transition de légiférer par ordonnances",
    resume:
      "Acte parlementaire publié au Journal officiel encadrant la législation d’urgence en intersession.",
    portal: "journal-officiel.ga",
    url: "https://journal-officiel.ga/21133-022-2024-/",
    isNew: true,
  },
  {
    id: "jo-loi-020-2024",
    slug: "loi-020-2024-emprunt-bird",
    source: "Gabon",
    date: "21 juil. 2024",
    dateIso: "2024-07-21",
    titre: "Loi n°020/2024 — Autorisation d’emprunt auprès de la Banque mondiale (projet HISWACA)",
    resume:
      "Loi de finances / emprunt d’État publiée au Journal officiel ; conditions et montant dans l’acte officiel.",
    portal: "journal-officiel.ga",
    url: "https://journal-officiel.ga/21132-020-2024-/",
  },
  {
    id: "ohada-au-recouvrement-2023",
    slug: "ohada-au-recouvrement-voies-execution-2023",
    source: "OHADA",
    date: "17 oct. 2023",
    dateIso: "2023-10-17",
    titre:
      "Acte uniforme portant organisation des procédures simplifiées de recouvrement et des voies d’exécution (révision du 17 octobre 2023)",
    resume:
      "Adopté par le Conseil des ministres de l’OHADA ; publication et entrée en vigueur suivent le Journal officiel de l’OHADA.",
    portal: "ohada.org",
    url: "https://www.ohada.org/publication-prochaine-du-nouvel-acte-uniforme-portant-organisation-des-procedures-simplifiees-de-recouvrement-et-des-voies-dexecution/",
  },
  {
    id: "ohada-actes-vigueur",
    slug: "ohada-actes-uniformes-en-vigueur",
    source: "OHADA",
    date: "—",
    dateIso: "2024-01-01",
    titre: "Actes uniformes en vigueur — droit des affaires harmonisé (17 États membres)",
    resume:
      "Index officiel : sociétés, sûretés, procédures collectives, comptabilité, transport, arbitrage, etc.",
    portal: "ohada.org",
    url: "https://www.ohada.org/category/actes-uniformes/actes-uniformes-en-vigueur/",
  },
  {
    id: "cemac-reg-2-18-changes",
    slug: "cemac-reglement-2-18-changes-umac",
    source: "CEMAC",
    date: "21 déc. 2018",
    dateIso: "2018-12-21",
    titre: "Règlement n°2/18/CEMAC/UMAC/CM — Réglementation des changes dans la CEMAC",
    resume:
      "Texte UMAC/CEMAC relatif aux opérations de change ; publié sur le portail de la BEAC (actualités officielles).",
    portal: "beac.int",
    url: "https://beac.int/beac/actualites/reglement-n218cemacumaccm-portant-reglementation-changes-cemac",
  },
  {
    id: "cemac-decisions",
    slug: "cemac-decisions-communautaires",
    source: "CEMAC",
    date: "—",
    dateIso: "2024-06-01",
    titre: "Décisions communautaires CEMAC — Publications officielles",
    resume:
      "Flux des actes et décisions communautaires publiés sur le site de la Communauté économique et monétaire de l’Afrique centrale.",
    portal: "cemac.int",
    url: "https://cemac.int/decisions/",
  },
  {
    id: "cobac-reglements-beac",
    slug: "cobac-reglements-commission-bancaire",
    source: "COBAC",
    date: "—",
    dateIso: "2024-12-20",
    titre: "Règlements de la COBAC — supervision bancaire (CEMAC)",
    resume:
      "Recueil officiel des règlements de la Commission bancaire de l’Afrique centrale sur le site de la BEAC.",
    portal: "beac.int",
    url: "https://beac.int/supervision-bancaire/reglements-de-cobac",
  },
];
