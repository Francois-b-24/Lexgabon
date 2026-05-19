/**
 * Tests du filtrage des suggestions Ama'IA par profil (T2.2).
 */
import { describe, expect, it } from "vitest";
import {
  AMAIA_SUGGESTIONS,
  buildSuggestionMessage,
  getSuggestionsForProfile,
} from "@/lib/amaia-suggestions";

describe("getSuggestionsForProfile", () => {
  it("retourne au moins 6 suggestions quel que soit le profil", () => {
    for (const p of [null, "professionnel", "etudiant"] as const) {
      const result = getSuggestionsForProfile(p);
      expect(result.length).toBeGreaterThanOrEqual(6);
      expect(result.length).toBeLessThanOrEqual(9);
    }
  });

  it("ne retourne aucun doublon", () => {
    const result = getSuggestionsForProfile("professionnel");
    const ids = result.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("priorise les suggestions ciblant le profil professionnel", () => {
    const result = getSuggestionsForProfile("professionnel");
    const targeted = AMAIA_SUGGESTIONS.filter((s) => s.profils.includes("professionnel"));
    for (const s of targeted) {
      expect(result.some((r) => r.id === s.id)).toBe(true);
    }
  });

  it("priorise les suggestions ciblant le profil etudiant", () => {
    const result = getSuggestionsForProfile("etudiant");
    const etudiantTargeted = AMAIA_SUGGESTIONS.filter((s) => s.profils.includes("etudiant"));
    for (const s of etudiantTargeted) {
      expect(result.some((r) => r.id === s.id)).toBe(true);
    }
  });

  it("pour un profil sans suggestions ciblées, retombe sur les génériques", () => {
    // Note : il n'y a pas de profil sans aucune suggestion ciblée dans notre corpus, mais
    // on vérifie au moins que les génériques (profils=[]) sont toujours présentes pour null.
    const result = getSuggestionsForProfile(null);
    const generic = AMAIA_SUGGESTIONS.filter((s) => s.profils.length === 0);
    for (const s of generic) {
      expect(result.some((r) => r.id === s.id)).toBe(true);
    }
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
      domaine: "general" as const,
      profils: [],
      prompt: "Question seule.",
    };
    expect(buildSuggestionMessage(fake)).toBe("Question seule.");
  });
});
