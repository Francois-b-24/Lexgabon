import { OFFICIAL_VEILLE_FEED } from "@/lib/veille/official-feed";
import type { VeilleItem } from "@/lib/veille/types";

export type { VeilleItem };

/** Flux veille : liens curatés vers publications et portails officiels. */
export const mockVeille: VeilleItem[] = OFFICIAL_VEILLE_FEED;

/** Fiche d’aperçu démo alignée sur une entrée réelle du Journal officiel du Gabon. */
export const mockTexteDetail = {
  slug: "loi-organique-001-2025-code-electoral",
  reference: "Loi organique n°001/2025",
  titre: "Code électoral de la République gabonaise",
  datePublication: "2025-01-19",
  sourceUrl: "https://journal-officiel.ga/21554-001-2025-/",
  resume:
    "Loi organique fixant le régime des élections et référendums. Pour le texte intégral et les modifications ultérieures, ouvrez la publication officielle sur le Journal officiel.",
  articles: [
    {
      id: "1",
      titre: "Publication officielle",
      contenu:
        "Ce résumé est fourni à titre indicatif. Seule la version publiée au Journal officiel de la République gabonaise fait foi : utilisez le lien « Télécharger le PDF officiel » ci-contre.",
    },
  ],
};

export type MockTexteDetail = typeof mockTexteDetail;

/** Détail démo pour les entrées veille sans fiche étendue `mockTexteDetail`. */
export function mockDetailFromVeilleItem(item: VeilleItem): MockTexteDetail {
  return {
    slug: item.slug,
    reference: `${item.source} · ${item.date}`,
    titre: item.titre,
    datePublication: item.dateIso,
    sourceUrl: item.url,
    resume: item.resume,
    articles: [
      {
        id: "1",
        titre: "Texte officiel",
        contenu:
          "Ouvrez le lien source pour consulter le document publié par l’institution compétente. LexGabon ne substitue pas au Journal officiel ni aux portails OHADA, CEMAC ou BEAC.",
      },
    ],
  };
}

export function resolveMockTexteDetail(slug: string): MockTexteDetail | null {
  if (slug === mockTexteDetail.slug) return mockTexteDetail;
  const item = mockVeille.find((m) => m.slug === slug);
  if (!item) return null;
  return mockDetailFromVeilleItem(item);
}
