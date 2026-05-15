"use client";

import { useCallback, useEffect, useState } from "react";
import { getOrCreateLegalAgentSessionId, setLegalAgentSessionId } from "@/lib/legal-agent-session";

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

  return { sessionId, syncFromServer };
}
