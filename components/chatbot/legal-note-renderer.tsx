"use client";

import { RefBadgeLink } from "@/components/chatbot/ref-popover";
import type { StructuredAnswer } from "@/lib/chatbot-types";

/**
 * Rendu d'une réponse Ama'IA en « note juridique » : paragraphes courts,
 * citations résolues, disclaimer isolé.
 *
 * Devenu client component en T2.3 pour porter les popovers d'articles. Reste
 * léger : la logique de popover est encapsulée dans `RefBadgeLink`.
 */
export function LegalNoteRenderer({ structured }: { structured: StructuredAnswer }) {
  const { paragraphs, disclaimer } = structured;

  return (
    <article className="space-y-4 text-[15px] leading-relaxed text-white/90">
      {paragraphs.map((p, i) => (
        <div key={i} className="space-y-1.5">
          {p.text ? (
            <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{p.text}</p>
          ) : null}
          {p.refs.length > 0 ? (
            <p className="flex flex-wrap gap-1.5 pt-0.5">
              {p.refs.map((r, j) => (
                <RefBadgeLink key={`${i}-${j}-${r.label}`} refItem={r} />
              ))}
            </p>
          ) : null}
        </div>
      ))}
      {disclaimer ? (
        <p className="border-t border-white/10 pt-3 text-[12px] italic text-white/50">
          {disclaimer}
        </p>
      ) : null}
    </article>
  );
}
