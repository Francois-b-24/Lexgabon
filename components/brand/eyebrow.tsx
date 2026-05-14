import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-7 inline-flex items-center gap-3.5 text-[11px] uppercase tracking-[0.22em] text-lg-gold",
        className,
      )}
    >
      <span className="h-px w-8 bg-lg-gold" aria-hidden />
      {children}
    </div>
  );
}
