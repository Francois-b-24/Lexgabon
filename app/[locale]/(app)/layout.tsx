import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh min-h-screen flex-col bg-lg-app-navy font-app-sans text-lg-app-text">
      <SiteHeader />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">{children}</div>
    </div>
  );
}
