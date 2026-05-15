"use client";

import { useCallback, useEffect, useState } from "react";
import { getOrCreateLegalAgentSessionId, setLegalAgentSessionId } from "@/lib/legal-agent-session";
import { clearAllLocalSessionData } from "@/lib/veille/indexed-sources-storage";

/** Session partagée (localStorage) : créée au premier montage côté client. */
export function useLegalAgentSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    setSessionId(getOrCreateLegalAgentSessionId());
  }, []);

  const syncFromServer = useCallback((serverSessionId: string | undefined | null) => {
    const s = serverSessionId?.trim();
    if (!s) return;
    setLegalAgentSessionId(s);
    setSessionId(s);
  }, []);

  /** Après `/api/session/clear` : nouveau session_id local (nouvelle session navigateur). */
  const rotateAfterServerClear = useCallback(() => {
    clearAllLocalSessionData();
    setSessionId(getOrCreateLegalAgentSessionId());
  }, []);

  return { sessionId, syncFromServer, rotateAfterServerClear };
}
