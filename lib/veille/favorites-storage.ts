/** Clé localStorage pour les favoris de la page Veille (ids stables des entrées). */
export const VEILLE_FAVORITES_STORAGE_KEY = "lexgabon:veille-favorites";

export function readVeilleFavoriteIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(VEILLE_FAVORITES_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

export function writeVeilleFavoriteIds(ids: Set<string>): void {
  try {
    localStorage.setItem(VEILLE_FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    /* quota / mode privé */
  }
}
