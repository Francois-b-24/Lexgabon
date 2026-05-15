import type { StructuredAnswer, StructuredRef } from "@/lib/chatbot-types";

/**
 * Rendu d'une réponse Ama'IA en « note juridique » : paragraphes courts,
 * citations résolues, disclaimer isolé. Composant server par défaut (pas
 * de "use client") ; T2.3 ajoutera un wrapper client pour les popovers.
 *
 * Le composant ne fait QUE rendre. Il ne déduit rien : si `structured` est
 * vide, l'appelant doit fournir un fallback texte.
 */

function RefBadge({ refItem }: { refItem: StructuredRef }) {
  const isArticle = refItem.kind === "article";
  const cls = isArticle
    ? "inline-flex items-center rounded bg-lg-gold/15 px-1.5 py-0.5 text-[11px] font-medium text-lg-gold-light"
    : "inline-flex items-center rounded bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-medium text-white/75";
  return <span className={cls}>{refItem.label}</span>;
}

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
                <RefBadge key={`${i}-${j}-${r.label}`} refItem={r} />
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
