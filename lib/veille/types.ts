/** Élément affiché dans la veille, la recherche fallback et les liens textes démo. */
export type VeilleItem = {
  id: string;
  /** Slug sous `/textes/[slug]` (aperçu ou fiche démo). */
  slug: string;
  source: "OHADA" | "CEMAC" | "COBAC" | "Gabon";
  date: string;
  /** Pour les stats landing (max des entrées). */
  dateIso: string;
  titre: string;
  resume: string;
  portal: string;
  url: string;
  isNew?: boolean;
};
