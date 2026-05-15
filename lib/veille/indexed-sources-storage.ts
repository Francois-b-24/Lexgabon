import { LEGAL_AGENT_SESSION_STORAGE_KEY } from "@/lib/legal-agent-session";

export type IndexedSourceKind = "pdf" | "url";

export type IndexedSourceEntry = {
  id: string;
  kind: IndexedSourceKind;
  label: string;
  chunks: number;
  createdAt: string;
  url?: string;
};

const PREFIX = "lexgabon_indexed_sources:";

function keyForSession(sessionId: string): string {
  return `${PREFIX}${sessionId}`;
}

export function loadIndexedSources(sessionId: string): IndexedSourceEntry[] {
  if (typeof window === "undefined" || !sessionId) return [];
  try {
    const raw = window.localStorage.getItem(keyForSession(sessionId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is IndexedSourceEntry =>
        x != null &&
        typeof x === "object" &&
        typeof (x as IndexedSourceEntry).id === "string" &&
        ((x as IndexedSourceEntry).kind === "pdf" || (x as IndexedSourceEntry).kind === "url"),
    );
  } catch {
    return [];
  }
}

export function saveIndexedSources(sessionId: string, items: IndexedSourceEntry[]): void {
  if (typeof window === "undefined" || !sessionId) return;
  try {
    window.localStorage.setItem(keyForSession(sessionId), JSON.stringify(items));
  } catch {
    /* quota */
  }
}

export function appendIndexedSource(sessionId: string, entry: IndexedSourceEntry): void {
  const list = loadIndexedSources(sessionId);
  list.unshift(entry);
  saveIndexedSources(sessionId, list);
}

export function removeIndexedSource(sessionId: string, entryId: string): void {
  const list = loadIndexedSources(sessionId).filter((e) => e.id !== entryId);
  saveIndexedSources(sessionId, list);
}

export function clearIndexedSourcesForSession(sessionId: string): void {
  if (typeof window === "undefined" || !sessionId) return;
  try {
    window.localStorage.removeItem(keyForSession(sessionId));
  } catch {
    /* */
  }
}

/** Efface la liste locale pour la session courante + réinitialise l’id de session stocké. */
export function clearAllLocalSessionData(): void {
  if (typeof window === "undefined") return;
  const sid = window.localStorage.getItem(LEGAL_AGENT_SESSION_STORAGE_KEY);
  if (sid) {
    try {
      window.localStorage.removeItem(keyForSession(sid));
    } catch {
      /* */
    }
  }
  try {
    window.localStorage.removeItem(LEGAL_AGENT_SESSION_STORAGE_KEY);
  } catch {
    /* */
  }
}
