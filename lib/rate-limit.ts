/**
 * Rate limiting **en mémoire** (compteur par clé, fenêtre glissante).
 *
 * **Limite MVP** : sur Vercel, chaque instance serverless a sa propre Map — les quotas ne sont pas
 * partagés entre les instances. Pour un trafic élevé ou une limite stricte, utiliser Redis / Upstash.
 */
const hits = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 60_000;
const DEFAULT_MAX = 30;

export function rateLimit(key: string, maxPerWindow: number = DEFAULT_MAX): boolean {
  const now = Date.now();
  const e = hits.get(key);
  if (!e || now > e.reset) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (e.count >= maxPerWindow) return false;
  e.count += 1;
  return true;
}
