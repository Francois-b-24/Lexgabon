/**
 * Types partagés entre le backend (StructuredAnswer Pydantic) et le front
 * (LegalNoteRenderer). Doit rester en miroir de backend/src/agent/schemas.py.
 */

export type ChatSource = {
  citation: string;
  text?: string;
  score?: number;
  badge?: string;
  slug?: string | null;
  numero_article?: string | null;
  url?: string | null;
  /** Slug d'URL Source (jo-ga, ohada, cemac, cobac, cima) — T2.1. */
  source?: string | null;
};

export type StructuredRef = {
  kind: "article" | "source";
  label: string;
  article?: string | null;
  code?: string | null;
  slug?: string | null;
  url?: string | null;
  /** Slug d'URL côté Next (jo-ga, ohada, ...) — T2.3. */
  source?: string | null;
  source_index?: number | null;
};

export type StructuredParagraph = {
  text: string;
  refs: StructuredRef[];
};

export type StructuredAnswer = {
  paragraphs: StructuredParagraph[];
  disclaimer?: string | null;
};

/**
 * Motif de la décision du gate lexical (backend/src/rag/gate.py).
 * Seul `covered` et `no_term_recognized` laissent la recherche s'exécuter :
 * les autres valeurs signifient que le corpus indexé ne couvre pas la question.
 */
export type RetrievalReason =
  | "covered"
  | "out_of_jurisdiction"
  | "regional_not_indexed"
  | "code_not_indexed"
  | "outdated_reference"
  | "domain_not_indexed"
  | "no_term_recognized";

/**
 * Décision de couverture, décidée avant l'appel au LLM. Permet de distinguer
 * un refus motivé d'une réponse sourcée sans inspecter le texte de la réponse.
 */
export type RetrievalDecision = {
  reason: RetrievalReason;
  /** false ⇒ le corpus ne couvre pas la question : afficher le refus. */
  indexed: boolean;
  matched_domaines?: string[];
  /** Termes ayant déclenché la décision — trace auditable. */
  matched_terms?: string[];
  invoked_code?: string | null;
  /** Libellé lisible du code invoqué, ex. « Code civil ». */
  invoked_code_label?: string | null;
  detected_year?: number | null;
  /** Matières réellement couvertes par l'index. */
  indexed_domains?: string[];
  n_passages?: number;
};
