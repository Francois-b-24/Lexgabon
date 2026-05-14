"use client";

import { usePathname } from "@/i18n/navigation";
import { useLayoutEffect } from "react";

/** Remonte la fenêtre avant peinture pour limiter les sauts entre routes (marketing / app / auth). */
export function ScrollToTopOnNavigation() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
