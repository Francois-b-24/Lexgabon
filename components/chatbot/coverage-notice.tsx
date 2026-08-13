import type { RetrievalDecision, RetrievalReason } from "@/lib/chatbot-types";

/**
 * Bandeau affiché quand le corpus indexé ne couvre pas la question.
 *
 * Pourquoi un composant plutôt qu'une phrase dans la réponse : le refus est une
 * décision typée prise avant l'appel au modèle (backend/src/rag/gate.py). Le
 * matérialiser visuellement permet à l'utilisateur de distinguer d'un coup d'œil
 * un refus motivé d'une réponse de fond — ce que le texte seul ne permettait pas.
 *
 * Le ton est informatif, pas alarmant : ce n'est pas une erreur (les erreurs de
 * transport ont leur propre bandeau rouge), c'est une limite connue du corpus.
 */

/** Libellés des domaines indexés, alignés sur `domaine` du manifest corpus. */
const DOMAIN_LABELS: Record<string, string> = {
  travail: "droit du travail",
  impots: "fiscalité",
  douane: "douanes",
  hydrocarbures: "hydrocarbures",
  "marche-public": "marchés publics",
  sante: "santé publique",
  communication: "communication",
};

function formatDomains(ids: string[] | undefined): string {
  if (!ids || ids.length === 0) return "";
  return ids.map((id) => DOMAIN_LABELS[id] ?? id).join(", ");
}

function buildMessage(decision: RetrievalDecision): string {
  const code = decision.invoked_code_label;
  const reason: RetrievalReason = decision.reason;

  switch (reason) {
    case "out_of_jurisdiction":
      return "Cette question porte sur le droit d'un autre pays. LexGabon ne couvre que les textes applicables au Gabon.";
    case "regional_not_indexed":
      return "Cette question porte sur une norme régionale qui n'est pas encore indexée.";
    case "code_not_indexed":
      return code
        ? `${code} ne fait pas partie des textes indexés par LexGabon.`
        : "Le texte invoqué ne fait pas partie des textes indexés par LexGabon.";
    case "outdated_reference":
      return decision.detected_year
        ? `La version ${decision.detected_year} de ce texte n'est pas indexée : LexGabon porte l'édition en vigueur.`
        : "La version visée de ce texte n'est pas indexée.";
    case "domain_not_indexed":
      return "Cette matière juridique n'est pas encore indexée par LexGabon.";
    default:
      return "Cette question n'est pas couverte par les textes indexés.";
  }
}

export function CoverageNotice({ decision }: { decision: RetrievalDecision }) {
  // `indexed === false` est le seul signal de refus : on ne devine rien du texte.
  if (decision.indexed !== false) return null;

  const domains = formatDomains(decision.indexed_domains);

  return (
    <div
      role="status"
      className="rounded-lg border border-amber-400/30 bg-amber-950/25 px-3.5 py-3 text-[13px] leading-relaxed text-amber-100/90"
    >
      <p className="font-medium">{buildMessage(decision)}</p>
      {domains ? (
        <p className="mt-1.5 text-amber-100/65">
          Matières couvertes : {domains}.
        </p>
      ) : null}
    </div>
  );
}
