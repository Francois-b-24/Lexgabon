/** Session liée à l'onglet / session navigateur (sessionStorage).
 *
 * Choix volontaire : on n'utilise PAS localStorage. La conversation Ama'IA et
 * l'identifiant de session vivent uniquement pour la durée de la session
 * navigateur. À la fermeture du navigateur (ou de l'onglet sur la plupart des
 * configurations), tout est balayé — important sur un poste partagé pour
 * qu'aucun utilisateur ne tombe sur l'historique d'un autre.
 */

export const LEGAL_AGENT_SESSION_STORAGE_KEY = "lexgabon_legal_agent_session_id";

export function getLegalAgentSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(LEGAL_AGENT_SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setLegalAgentSessionId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(LEGAL_AGENT_SESSION_STORAGE_KEY, id);
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
