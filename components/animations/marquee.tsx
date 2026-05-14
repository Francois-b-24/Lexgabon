"use client";

import { cn } from "@/lib/utils";

export function Marquee({ text, className }: { text: string; className?: string }) {
  const row = (
    <span className="inline-flex shrink-0 gap-24 px-12">{text}</span>
  );
  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-lg-gold/20 bg-lg-navy py-3 text-[11px] uppercase tracking-[0.2em] text-lg-gold/80",
        className,
      )}
    >
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {row}
        {row}
      </div>
    </div>
  );
}
