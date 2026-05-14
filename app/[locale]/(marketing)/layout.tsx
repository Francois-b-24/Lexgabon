import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--lg-paper)] text-[var(--lg-ink)]">
      <SiteHeader />
      {children}
    </div>
  );
}
