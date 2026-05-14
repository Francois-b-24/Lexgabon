import { cn } from "@/lib/utils";

export function GoldRule({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-px bg-[var(--lg-rule)] opacity-80", className)}
      aria-hidden
    />
  );
}
