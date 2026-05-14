import { OFFICIAL_VEILLE_FEED } from "@/lib/veille/official-feed";

const DEFAULT_HOSTS = [
  "journal-officiel.ga",
  "www.journal-officiel.ga",
  "ohada.org",
  "www.ohada.org",
  "cemac.int",
  "www.cemac.int",
  "beac.int",
  "www.beac.int",
] as const;

const FETCH_TIMEOUT_MS = 4000;
const MAX_RESPONSE_BYTES = 512 * 1024;
const MAX_CHARS_PER_PAGE = 2000;
const MAX_TOTAL_CHARS = 4000;
const FEED_TOP_N = 2;
const FEED_MIN_SCORE = 1;

const UA = "LexGabon-AmaIA/1.0 (+https://lexgabon.ga)";

function parseEnvAllowlistHosts(): string[] {
  const raw = process.env.AMAIA_FETCH_ALLOWLIST?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

/** Hostnames autorisés pour un GET serveur (surcharge possible via AMAIA_FETCH_ALLOWLIST). */
export function getAllowlistedHosts(): Set<string> {
  const set = new Set<string>(DEFAULT_HOSTS);
  for (const h of parseEnvAllowlistHosts()) set.add(h);
  return set;
}

export function isUrlAllowlisted(urlString: string, hosts: Set<string>): boolean {
  try {
    const u = new URL(urlString);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    return hosts.has(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function tokenizeForMatch(text: string): string[] {
  const t = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const words = t.match(/[a-z0-9àâäéèêëïîôùûüçœæ]{3,}/g) ?? [];
  return Array.from(new Set(words));
}

function scoreFeedItem(queryTokens: readonly string[], titre: string, resume: string): number {
  const hay = `${titre} ${resume}`.toLowerCase();
  let score = 0;
  for (const tok of queryTokens) {
    if (hay.includes(tok)) score += 1;
  }
  return score;
}

/** Jusqu’à deux URLs du flux officiel dont le titre/résumé recoupe la question. */
export function selectFeedUrlsForQuery(query: string, max = FEED_TOP_N): string[] {
  const q = query.trim();
  if (!q) return [];
  const queryTokens = tokenizeForMatch(q);
  if (queryTokens.length === 0) return [];

  const hosts = getAllowlistedHosts();
  const scored = OFFICIAL_VEILLE_FEED.map((item) => ({
    url: item.url,
    score: scoreFeedItem(queryTokens, item.titre, item.resume),
  }))
    .filter((x) => x.score >= FEED_MIN_SCORE && isUrlAllowlisted(x.url, hosts))
    .sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const { url } of scored) {
    if (seen.has(url)) continue;
    seen.add(url);
    out.push(url);
    if (out.length >= max) break;
  }
  return out;
}

function stripTagsAndNoise(html: string): string {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  s = s.replace(/<[^>]+>/g, " ");
  s = s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

async function fetchOnePage(url: string, hosts: Set<string>): Promise<string> {
  if (!isUrlAllowlisted(url, hosts)) return "";

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) return "";

    const ct = (res.headers.get("content-type") ?? "").toLowerCase();
    if (ct.includes("application/pdf")) return "";
    if (!ct.includes("text/html") && !ct.includes("application/xhtml")) {
      if (!ct.includes("text/")) return "";
    }

    const buf = await res.arrayBuffer();
    const slice = buf.byteLength > MAX_RESPONSE_BYTES ? buf.slice(0, MAX_RESPONSE_BYTES) : buf;
    const html = new TextDecoder("utf-8", { fatal: false }).decode(slice);
    let text = stripTagsAndNoise(html);
    if (text.length > MAX_CHARS_PER_PAGE) text = text.slice(0, MAX_CHARS_PER_PAGE) + "…";
    return text;
  } catch {
    return "";
  } finally {
    clearTimeout(t);
  }
}

/**
 * Télécharge en parallèle des pages HTML dont l’hôte est sur la liste blanche,
 * extrait du texte brut (sans dépendance DOM) et renvoie un bloc unique pour le LLM.
 */
export async function fetchAllowlistedPagesContext(urls: string[]): Promise<string> {
  const unique = Array.from(new Set(urls.filter(Boolean)));
  if (unique.length === 0) return "";

  const hosts = getAllowlistedHosts();
  const safeUrls = unique.filter((u) => isUrlAllowlisted(u, hosts)).slice(0, 4);

  const parts = await Promise.all(
    safeUrls.map(async (url) => {
      const body = await fetchOnePage(url, hosts);
      if (!body) return "";
      return `### Extrait volatile (${url})\n${body}`;
    }),
  );

  let merged = parts.filter(Boolean).join("\n\n");
  if (merged.length > MAX_TOTAL_CHARS) merged = merged.slice(0, MAX_TOTAL_CHARS) + "…";
  return merged;
}
