/** Session stable partagée entre chatbot, Veille et upload / ingest-url (localStorage). */

export const LEGAL_AGENT_SESSION_STORAGE_KEY = "lexgabon_legal_agent_session_id";

export function getLegalAgentSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LEGAL_AGENT_SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setLegalAgentSessionId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LEGAL_AGENT_SESSION_STORAGE_KEY, id);
  } catch {
    /* quota / private mode */
  }
}

/** Retourne un id existant ou en crée un et le persiste. */
export function getOrCreateLegalAgentSessionId(): string {
  const existing = getLegalAgentSessionId();
  if (existing && existing.trim()) return existing.trim();
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `sess-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  setLegalAgentSessionId(id);
  return id;
}
