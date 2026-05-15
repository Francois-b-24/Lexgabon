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
};

export type StructuredRef = {
  kind: "article" | "source";
  label: string;
  article?: string | null;
  code?: string | null;
  slug?: string | null;
  url?: string | null;
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
