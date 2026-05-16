/**
 * Profil utilisateur LexGabon. Stocké en cookie + localStorage côté client.
 * Aucun lien avec Supabase : choix entièrement local, modifiable à tout moment.
 */

export type UserProfile = "avocat" | "juriste" | "etudiant";

export const USER_PROFILES: readonly UserProfile[] = ["avocat", "juriste", "etudiant"] as const;

const COOKIE_NAME = "lg_profile";
const LOCAL_STORAGE_KEY = "lexgabon:user-profile";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 an
export const PROFILE_CHANGE_EVENT = "lexgabon:profile-change";

function isUserProfile(v: unknown): v is UserProfile {
  return typeof v === "string" && (USER_PROFILES as readonly string[]).includes(v);
}

/** Lit le profil côté client. Renvoie `null` si aucun choix valide. */
export function readProfileClient(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const ls = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (isUserProfile(ls)) return ls;
  } catch {
    /* localStorage indisponible : on retombe sur le cookie */
  }
  const fromCookie = readProfileFromCookieString(document.cookie);
  return fromCookie;
}

/** Lit le profil depuis un header `Cookie` (utile en SSR/middleware). */
export function readProfileFromCookieString(cookieHeader: string | null | undefined): UserProfile | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.split("=");
    if (k && k.trim() === COOKIE_NAME) {
      const raw = decodeURIComponent(rest.join("=").trim());
      if (isUserProfile(raw)) return raw;
    }
  }
  return null;
}

/** Écrit le profil (cookie + localStorage). `null` efface le choix. */
export function writeProfileClient(profile: UserProfile | null): void {
  if (typeof window === "undefined") return;
  try {
    if (profile) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, profile);
    } else {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
  if (profile) {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(profile)}; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
  } else {
    document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
  }
  // Notifie toutes les instances de useUserProfile() montées dans la page,
  // sans quoi un changement dans le ProfileSwitcher ne se propage pas aux
  // autres composants (chaque hook a son propre useState local).
  try {
    window.dispatchEvent(new CustomEvent(PROFILE_CHANGE_EVENT, { detail: profile }));
  } catch {
    /* env sans CustomEvent : tant pis, le prochain montage relira la valeur */
  }
}
