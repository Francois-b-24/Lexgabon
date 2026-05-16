import { OFFICIAL_VEILLE_FEED } from "@/lib/veille/official-feed";
import type { VeilleItem } from "@/lib/veille/types";

export type { VeilleItem };

/**
 * Flux veille : liens curatés vers publications et portails officiels.
 *
 * Utilisé en mode dégradé (fallback) par :
 * - `lib/veille-service.ts` quand la table `veille_items` est inaccessible.
 * - `lib/search-service.ts` quand Meilisearch est inaccessible.
 * - `lib/landing-stats.ts` pour le compteur de sources de la landing.
 * - `app/[locale]/(app)/textes/page.tsx` pour la liste de démarrage.
 */
export const mockVeille: VeilleItem[] = OFFICIAL_VEILLE_FEED;
