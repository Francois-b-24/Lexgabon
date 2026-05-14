/** Cartes « Sources institutionnelles » sur l’accueil — source unique pour le comptage et la grille. */
export const OFFICIAL_LANDING_SOURCES = [
  {
    name: "Gabon",
    desc: "Lois · Ordonnances · Décrets",
    href: "https://journal-officiel.ga",
    scope: "Source primaire",
  },
  {
    name: "OHADA",
    desc: "Actes uniformes · CCJA",
    href: "https://ohada.org",
    scope: "Gabon · État membre",
  },
  {
    name: "CCJA",
    desc: "Jurisprudence OHADA",
    href: "https://ohada.org",
    scope: "Gabon · État membre",
  },
  {
    name: "CEMAC",
    desc: "Règlements · Directives",
    href: "https://cemac.int",
    scope: "Gabon · État membre",
  },
  {
    name: "COBAC",
    desc: "Règlements · Circulaires",
    href: "https://beac.int",
    scope: "Gabon · État membre",
  },
] as const;
