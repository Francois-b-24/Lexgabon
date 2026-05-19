/**
 * Tests des suggestions Ama'IA filtrées par thème.
 */
import { describe, expect, it } from "vitest";
import {
  AMAIA_SUGGESTIONS,
  SUGGESTION_DOMAINES,
  buildSuggestionMessage,
  getSuggestionsForDomaine,
} from "@/lib/amaia-suggestions";

describe("getSuggestionsForDomaine", () => {
  it("retourne 5 suggestions pour chaque thème", () => {
    for (const d of SUGGESTION_DOMAINES) {
      const result = getSuggestionsForDomaine(d);
      expect(result).toHaveLength(5);
      for (const s of result) {
        expect(s.domaine).toBe(d);
      }
    }
  });

  it("retourne un tableau vide quand aucun thème n'est sélectionné", () => {
    expect(getSuggestionsForDomaine(null)).toEqual([]);
  });

  it("ne contient aucun doublon d'id", () => {
    const ids = AMAIA_SUGGESTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("expose exactement 25 suggestions (5 thèmes × 5)", () => {
    expect(AMAIA_SUGGESTIONS).toHaveLength(25);
  });
});

describe("buildSuggestionMessage", () => {
  it("ajoute le contextHint en suffixe entre crochets", () => {
    const s = AMAIA_SUGGESTIONS.find((x) => x.contextHint);
    if (!s) throw new Error("test fixture: at least one suggestion must have a contextHint");
    const msg = buildSuggestionMessage(s);
    expect(msg).toContain(s.prompt);
    expect(msg).toContain("[Contexte :");
    expect(msg).toContain(s.contextHint!);
  });

  it("ne touche pas au prompt si contextHint absent", () => {
    const fake = {
      id: "no-context",
      domaine: "civil" as const,
      prompt: "Question seule.",
    };
    expect(buildSuggestionMessage(fake)).toBe("Question seule.");
  });
});
