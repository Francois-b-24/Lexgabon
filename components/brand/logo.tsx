import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  tagline,
}: {
  className?: string;
  tagline: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/alin-logo.jpeg"
        alt="Logo ALIN"
        width={36}
        height={36}
        priority
        quality={90}
        className="h-9 w-9 shrink-0 rounded-md object-cover"
      />
      <div className="flex flex-col">
        <div className="font-logo text-[22px] font-bold leading-none tracking-[2px]">
          <span className="text-[#EDE9E0]">Lex</span>
          <span className="text-lg-gold">Gabon</span>
        </div>
        <div className="mt-0.5 h-[2.5px] w-full rounded-sm bg-lg-gold" />
        <p className="font-landing-sans mt-0.5 text-[8px] uppercase tracking-[0.15em] text-[#9bb0c8]">
          {tagline}
        </p>
      </div>
    </div>
  );
}
