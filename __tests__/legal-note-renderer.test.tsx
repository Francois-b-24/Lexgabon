import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LegalNoteRenderer } from "@/components/chatbot/legal-note-renderer";
import type { StructuredAnswer } from "@/lib/chatbot-types";

const DISCLAIMER =
  "Il s'agit d'une information juridique générale : cela ne remplace pas le conseil d'un avocat inscrit au barreau.";

describe("LegalNoteRenderer", () => {
  it("rend chaque paragraphe + son disclaimer", () => {
    const structured: StructuredAnswer = {
      paragraphs: [
        { text: "Le préavis dépend de l'ancienneté du salarié.", refs: [] },
        { text: "Il commence à courir à la notification.", refs: [] },
      ],
      disclaimer: DISCLAIMER,
    };
    render(<LegalNoteRenderer structured={structured} />);
    expect(screen.getByText(/Le préavis dépend/)).toBeInTheDocument();
    expect(screen.getByText(/à la notification/)).toBeInTheDocument();
    expect(screen.getByText(DISCLAIMER)).toBeInTheDocument();
  });

  it("affiche les badges de référence sous le paragraphe correspondant", () => {
    const structured: StructuredAnswer = {
      paragraphs: [
        {
          text: "La règle s'applique sous conditions.",
          refs: [
            {
              kind: "article",
              label: "Article 82 du Code du travail",
              article: "82",
              code: "Code du travail",
              slug: "code-travail-2021",
            },
          ],
        },
      ],
      disclaimer: null,
    };
    render(<LegalNoteRenderer structured={structured} />);
    expect(screen.getByText("Article 82 du Code du travail")).toBeInTheDocument();
  });

  it("ne rend pas la zone disclaimer si elle est absente", () => {
    const structured: StructuredAnswer = {
      paragraphs: [{ text: "Réponse courte.", refs: [] }],
      disclaimer: null,
    };
    render(<LegalNoteRenderer structured={structured} />);
    expect(screen.queryByText(DISCLAIMER)).not.toBeInTheDocument();
  });

  it("rend un paragraphe purement citationnel (text vide + refs)", () => {
    const structured: StructuredAnswer = {
      paragraphs: [
        {
          text: "",
          refs: [
            { kind: "source", label: "Journal officiel n°139" },
          ],
        },
      ],
      disclaimer: null,
    };
    render(<LegalNoteRenderer structured={structured} />);
    expect(screen.getByText("Journal officiel n°139")).toBeInTheDocument();
  });

  it("différencie visuellement les refs article et source via les classes", () => {
    const structured: StructuredAnswer = {
      paragraphs: [
        {
          text: "Mixte.",
          refs: [
            { kind: "article", label: "Article 5 du Code OHADA" },
            { kind: "source", label: "JO n°1" },
          ],
        },
      ],
      disclaimer: null,
    };
    const { container } = render(<LegalNoteRenderer structured={structured} />);
    const badges = container.querySelectorAll("span");
    const articleBadge = Array.from(badges).find((b) => b.textContent === "Article 5 du Code OHADA");
    const sourceBadge = Array.from(badges).find((b) => b.textContent === "JO n°1");
    expect(articleBadge?.className).toMatch(/lg-gold/);
    expect(sourceBadge?.className).not.toMatch(/lg-gold/);
  });
});
