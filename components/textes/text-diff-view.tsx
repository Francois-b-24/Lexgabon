import type { ArticleDiff, DiffSegment, TextDiff } from "@/lib/text-diff";

/**
 * Rendu visuel d'un TextDiff. Accessibilité AA :
 *  - couleur (vert/rouge/jaune) + texte explicite (préfixe + balise sémantique
 *    <ins>/<del>/<mark>) + libellé de statut.
 *  - contraste vérifié : emerald-300 / rose-300 / amber-200 sur fond white/[0.04].
 */
export function TextDiffView({ diff, beforeLabel, afterLabel }: {
  diff: TextDiff;
  beforeLabel: string;
  afterLabel: string;
}) {
  return (
    <div className="space-y-6">
      <DiffSummary diff={diff} beforeLabel={beforeLabel} afterLabel={afterLabel} />
      <ul className="space-y-4">
        {diff.articles.map((art) => (
          <li key={`${art.status}-${art.numero}`}>
            <ArticleDiffCard article={art} beforeLabel={beforeLabel} afterLabel={afterLabel} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function DiffSummary({
  diff,
  beforeLabel,
  afterLabel,
}: {
  diff: TextDiff;
  beforeLabel: string;
  afterLabel: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-2 text-[11px] uppercase tracking-wider text-white/45">
        Comparaison :{" "}
        <span className="text-white/75">{beforeLabel}</span>
        {" → "}
        <span className="text-white/75">{afterLabel}</span>
      </p>
      <ul className="flex flex-wrap gap-2 text-[12px]">
        <li className="rounded bg-emerald-500/15 px-2 py-0.5 text-emerald-300">
          + {diff.added} ajouté{diff.added > 1 ? "s" : ""}
        </li>
        <li className="rounded bg-rose-500/15 px-2 py-0.5 text-rose-300">
          − {diff.removed} supprimé{diff.removed > 1 ? "s" : ""}
        </li>
        <li className="rounded bg-amber-500/15 px-2 py-0.5 text-amber-200">
          ~ {diff.modified} modifié{diff.modified > 1 ? "s" : ""}
        </li>
        <li className="rounded bg-white/[0.06] px-2 py-0.5 text-white/55">
          = {diff.unchanged} inchangé{diff.unchanged > 1 ? "s" : ""}
        </li>
      </ul>
    </div>
  );
}

const STATUS_STYLES: Record<ArticleDiff["status"], { wrapper: string; label: string; aria: string; sign: string }> = {
  added: {
    wrapper: "border-emerald-500/35 bg-emerald-500/[0.06]",
    label: "Article ajouté",
    aria: "Article ajouté dans la nouvelle version",
    sign: "+",
  },
  removed: {
    wrapper: "border-rose-500/35 bg-rose-500/[0.06]",
    label: "Article supprimé",
    aria: "Article supprimé dans la nouvelle version",
    sign: "−",
  },
  modified: {
    wrapper: "border-amber-500/35 bg-amber-500/[0.05]",
    label: "Article modifié",
    aria: "Article modifié entre les deux versions",
    sign: "~",
  },
  unchanged: {
    wrapper: "border-white/10 bg-white/[0.03]",
    label: "Article inchangé",
    aria: "Article inchangé entre les deux versions",
    sign: "=",
  },
};

function ArticleDiffCard({
  article,
  beforeLabel,
  afterLabel,
}: {
  article: ArticleDiff;
  beforeLabel: string;
  afterLabel: string;
}) {
  const style = STATUS_STYLES[article.status];

  return (
    <section
      className={`rounded-lg border px-4 py-3 ${style.wrapper}`}
      aria-label={`${style.aria} : article ${article.numero}`}
    >
      <header className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span aria-hidden className="font-mono text-[14px] text-white/45">
          {style.sign}
        </span>
        <h3 className="font-app-serif text-[15px] font-semibold text-white">
          Article {article.numero}
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-white/40">
          {style.label}
        </span>
      </header>

      {article.status === "modified" && article.segments ? (
        <div className="space-y-1 text-[14px] leading-relaxed text-white/85">
          {article.segments.map((s, idx) => (
            <SegmentLine key={idx} segment={s} />
          ))}
        </div>
      ) : article.status === "unchanged" ? (
        <p className="text-[13px] text-white/55">
          {(article.after ?? article.before)?.contenu}
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {article.before ? (
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wider text-rose-300/80">
                {beforeLabel}
              </p>
              <p className="whitespace-pre-wrap text-[13px] text-white/75 line-through decoration-rose-400/50">
                {article.before.contenu}
              </p>
            </div>
          ) : null}
          {article.after ? (
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wider text-emerald-300/80">
                {afterLabel}
              </p>
              <p className="whitespace-pre-wrap text-[13px] text-white/85">
                {article.after.contenu}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

function SegmentLine({ segment }: { segment: DiffSegment }) {
  if (segment.op === "equal") {
    return <p className="text-white/75">{segment.text}</p>;
  }
  if (segment.op === "insert") {
    return (
      <p className="text-emerald-200">
        <ins
          className="no-underline"
          aria-label="Phrase ajoutée"
          title="Phrase ajoutée"
        >
          <span aria-hidden>+ </span>
          {segment.text}
        </ins>
      </p>
    );
  }
  return (
    <p className="text-rose-200">
      <del
        className="decoration-rose-400/50"
        aria-label="Phrase supprimée"
        title="Phrase supprimée"
      >
        <span aria-hidden>− </span>
        {segment.text}
      </del>
    </p>
  );
}
