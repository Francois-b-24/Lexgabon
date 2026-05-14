import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionTitle({
  children,
  className,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag
      className={cn(
        "font-landing-serif text-[clamp(30px,3.8vw,50px)] font-normal tracking-[-0.015em] text-lg-ink [&_em]:italic [&_em]:text-lg-steel",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
