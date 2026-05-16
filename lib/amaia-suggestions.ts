/**
 * Suggestions cliquables affichées sur la page chatbot (T2.2).
 *
 * Chaque suggestion porte :
 * - `domaine` : pour le filtre visuel et la coloration future.
 * - `profils` : liste des profils utilisateur pour lesquels la suggestion est pertinente
 *   (vide = visible pour tous, y compris « profil non défini »).
 * - `prompt` : la question pré-formulée qui remplit la textarea au clic.
 * - `contextHint` (optionnel) : préfixe injecté dans le message utilisateur côté front
 *   avant envoi à /api/chat, pour orienter le retriever et le LLM.
 *
 * Tout est en français : Ama'IA répond en français, et le `prompt` est ce que l'utilisateur
 * voit dans la textarea — il doit pouvoir le relire avant d'envoyer.
 */

import type { UserProfile } from "@/lib/user-profile";

export type SuggestionDomaine =
  | "travail"
  | "commercial"
  | "fiscal"
  | "civil"
  | "penal"
  | "famille"
  | "social"
  | "general";

export type AmaiaSuggestion = {
  id: string;
  domaine: SuggestionDomaine;
  profils: readonly UserProfile[]; // vide = tous profils
  prompt: string;
  contextHint?: string;
};

export const AMAIA_SUGGESTIONS: readonly AmaiaSuggestion[] = [
  // Droit du travail (le domaine le mieux indexé aujourd'hui — corpus Code du travail)
  {
    id: "travail-preavis-cadre",
    domaine: "travail",
    profils: [],
    prompt:
      "Quel est le délai de préavis applicable au licenciement d'un cadre au Gabon ?",
    contextHint: "Question portant sur le Code du travail gabonais, en particulier le préavis de licenciement.",
  },
  {
    id: "travail-cdd-renouvellement",
    domaine: "travail",
    profils: ["avocat", "juriste"],
    prompt:
      "Quelles sont les conditions de renouvellement d'un contrat à durée déterminée au Gabon ?",
    contextHint: "Code du travail gabonais — formation, conditions et limites du CDD.",
  },
  {
    id: "travail-pedago-licenciement",
    domaine: "travail",
    profils: ["etudiant"],
    prompt:
      "Comment se déroule une procédure de licenciement pour motif personnel au Gabon ? Explique-moi les étapes.",
    contextHint: "Réponse pédagogique attendue : énoncer les étapes en les nommant.",
  },

  // Droit commercial / OHADA
  {
    id: "commercial-ohada-sarl",
    domaine: "commercial",
    profils: [],
    prompt:
      "Quelles sont les formalités OHADA pour créer une SARL applicable au Gabon ?",
    contextHint: "Acte uniforme OHADA relatif au droit des sociétés commerciales et du GIE — focus SARL.",
  },
  {
    id: "commercial-ohada-recouvrement",
    domaine: "commercial",
    profils: ["avocat", "juriste"],
    prompt:
      "Quelles sont les procédures simplifiées de recouvrement de créance prévues par l'OHADA ?",
    contextHint: "Acte uniforme OHADA portant organisation des procédures simplifiées de recouvrement et des voies d'exécution.",
  },

  // Droit fiscal
  {
    id: "fiscal-tva",
    domaine: "fiscal",
    profils: ["juriste"],
    prompt:
      "Quel est le régime de la TVA applicable aux prestations de services au Gabon ?",
    contextHint: "Code général des impôts du Gabon — régime de TVA.",
  },

  // Droit pénal
  {
    id: "penal-prescription",
    domaine: "penal",
    profils: ["avocat"],
    prompt:
      "Quels sont les délais de prescription de l'action publique en droit gabonais ?",
    contextHint: "Code pénal et Code de procédure pénale gabonais — prescription de l'action publique.",
  },

  // Droit de la famille
  {
    id: "famille-divorce-procedure",
    domaine: "famille",
    profils: ["avocat", "etudiant"],
    prompt:
      "Quelle est la procédure de divorce contentieux au Gabon ?",
    contextHint: "Code civil gabonais — procédure de divorce contentieux et juge compétent.",
  },

  // Droit social (sécurité sociale)
  {
    id: "social-cnss-affiliation",
    domaine: "social",
    profils: ["juriste"],
    prompt:
      "Quelles sont les obligations d'affiliation à la CNSS pour un employeur au Gabon ?",
    contextHint: "Sécurité sociale gabonaise et CNSS — obligations d'affiliation employeur.",
  },

  // Général — repère systémique pour étudiants
  {
    id: "general-hierarchie-normes",
    domaine: "general",
    profils: ["etudiant"],
    prompt:
      "Quelle est la hiérarchie des normes en droit gabonais ?",
    contextHint: "Constitution, traités, lois, ordonnances, décrets — articulation et place dans la hiérarchie.",
  },
];

const SUGGESTIONS_MAX = 9;
const SUGGESTIONS_MIN_VISIBLE = 6;

/**
 * Retourne 6 à 9 suggestions pertinentes pour le profil donné.
 * - Si le profil est défini : priorité aux suggestions qui le ciblent explicitement, puis
 *   complète avec les suggestions « tous profils » jusqu'à atteindre SUGGESTIONS_MIN_VISIBLE.
 * - Si pas de profil : on prend les suggestions « tous profils » (profils=[]) en priorité.
 */
export function getSuggestionsForProfile(
  profile: UserProfile | null,
): AmaiaSuggestion[] {
  const all = AMAIA_SUGGESTIONS;
  const targeted = profile ? all.filter((s) => s.profils.includes(profile)) : [];
  const generic = all.filter((s) => s.profils.length === 0);

  const merged: AmaiaSuggestion[] = [];
  const seen = new Set<string>();
  for (const s of [...targeted, ...generic]) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    merged.push(s);
    if (merged.length >= SUGGESTIONS_MAX) break;
  }
  if (merged.length < SUGGESTIONS_MIN_VISIBLE) {
    // Fallback : complète avec n'importe quelles autres suggestions pour atteindre le minimum.
    for (const s of all) {
      if (seen.has(s.id)) continue;
      seen.add(s.id);
      merged.push(s);
      if (merged.length >= SUGGESTIONS_MIN_VISIBLE) break;
    }
  }
  return merged;
}

/**
 * Construit le texte effectivement envoyé à /api/chat quand l'utilisateur clique sur une
 * suggestion. Le contextHint est préfixé pour orienter le retriever et le LLM, mais reste
 * visible dans la textarea pour que l'utilisateur le voie avant d'envoyer.
 */
export function buildSuggestionMessage(suggestion: AmaiaSuggestion): string {
  if (!suggestion.contextHint) return suggestion.prompt;
  return `${suggestion.prompt}\n\n[Contexte : ${suggestion.contextHint}]`;
}
