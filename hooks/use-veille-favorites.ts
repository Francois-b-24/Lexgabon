"use client";

import { useCallback, useEffect, useState } from "react";
import { readVeilleFavoriteIds, writeVeilleFavoriteIds } from "@/lib/veille/favorites-storage";

export function useVeilleFavorites() {
  const [ids, setIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setIds(readVeilleFavoriteIds());
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeVeilleFavoriteIds(next);
      return next;
    });
  }, []);

  const has = useCallback((id: string) => ids.has(id), [ids]);

  return { ids, toggle, has };
}
