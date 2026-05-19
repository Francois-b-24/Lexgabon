/**
 * Suggestions cliquables affichées sur la page chatbot — filtrées par thème.
 *
 * 5 thèmes × 5 questions = 25 suggestions. Le thème est choisi via le
 * ThemeSelector au-dessus des cartes ; les suggestions ne dépendent plus du
 * profil utilisateur (qui reste utilisé pour l'adaptation du prompt côté
 * backend).
 *
 * Le `contextHint` (optionnel) est préfixé au prompt envoyé au backend pour
 * aider le retriever Chroma. Le `prompt` reste visible dans la textarea.
 */

export type SuggestionDomaine =
  | "civil"
  | "commercial"
  | "travail"
  | "fonction_publique"
  | "fiscal";

export const SUGGESTION_DOMAINES: readonly SuggestionDomaine[] = [
  "civil",
  "commercial",
  "travail",
  "fonction_publique",
  "fiscal",
] as const;

export type AmaiaSuggestion = {
  id: string;
  domaine: SuggestionDomaine;
  prompt: string;
  contextHint?: string;
};

const QUESTIONS_PAR_DOMAINE: Record<SuggestionDomaine, readonly AmaiaSuggestion[]> = {
  civil: [
    {
      id: "civil-1",
      domaine: "civil",
      prompt: "Quelles sont les conditions pour se marier au Gabon ?",
      contextHint: "Code civil gabonais — conditions de fond et de forme du mariage.",
    },
    {
      id: "civil-2",
      domaine: "civil",
      prompt: "Comment se déroule une procédure de divorce ?",
      contextHint: "Code civil gabonais — divorce contentieux et juge compétent.",
    },
    {
      id: "civil-3",
      domaine: "civil",
      prompt: "Quels sont mes droits en matière de succession ?",
      contextHint: "Code civil gabonais — dévolution successorale et réserve héréditaire.",
    },
    {
      id: "civil-4",
      domaine: "civil",
      prompt: "Comment reconnaître officiellement un enfant ?",
      contextHint: "Code civil gabonais — reconnaissance et filiation.",
    },
    {
      id: "civil-5",
      domaine: "civil",
      prompt: "Quelles sont les règles d'adoption au Gabon ?",
      contextHint: "Code civil gabonais — adoption plénière et simple.",
    },
  ],
  commercial: [
    {
      id: "commercial-1",
      domaine: "commercial",
      prompt: "Comment créer une société commerciale au Gabon ?",
      contextHint: "Acte uniforme OHADA sur le droit des sociétés commerciales et du GIE.",
    },
    {
      id: "commercial-2",
      domaine: "commercial",
      prompt: "Quelles sont les obligations d'un commerçant ?",
      contextHint: "Acte uniforme OHADA portant droit commercial général.",
    },
    {
      id: "commercial-3",
      domaine: "commercial",
      prompt: "Comment se déroule une procédure de redressement judiciaire ?",
      contextHint: "Acte uniforme OHADA portant organisation des procédures collectives d'apurement du passif.",
    },
    {
      id: "commercial-4",
      domaine: "commercial",
      prompt: "Quels sont les différents types de sociétés OHADA ?",
      contextHint: "Acte uniforme OHADA — SARL, SA, SAS, SNC, SCS et autres formes sociales.",
    },
    {
      id: "commercial-5",
      domaine: "commercial",
      prompt: "Comment rédiger un contrat commercial valide ?",
      contextHint: "Code civil gabonais et Acte uniforme OHADA — conditions de validité d'un contrat.",
    },
  ],
  travail: [
    {
      id: "travail-1",
      domaine: "travail",
      prompt: "Quelle est la durée légale du travail au Gabon ?",
      contextHint: "Code du travail gabonais — durée légale, heures supplémentaires.",
    },
    {
      id: "travail-2",
      domaine: "travail",
      prompt: "Quelles sont les conditions de licenciement pour un salarié ?",
      contextHint: "Code du travail gabonais — motifs et procédure de licenciement.",
    },
    {
      id: "travail-3",
      domaine: "travail",
      prompt: "Comment calculer l'indemnité de fin de contrat ?",
      contextHint: "Code du travail gabonais — indemnités de licenciement et de fin de contrat.",
    },
    {
      id: "travail-4",
      domaine: "travail",
      prompt: "Quels sont les droits aux congés payés ?",
      contextHint: "Code du travail gabonais — congés payés, durée et acquisition.",
    },
    {
      id: "travail-5",
      domaine: "travail",
      prompt: "Comment se déroule la rupture conventionnelle ?",
      contextHint: "Code du travail gabonais — rupture du contrat de travail d'un commun accord.",
    },
  ],
  fonction_publique: [
    {
      id: "fonction_publique-1",
      domaine: "fonction_publique",
      prompt: "Comment devient-on fonctionnaire au Gabon ?",
      contextHint: "Statut général de la fonction publique gabonaise — recrutement et concours.",
    },
    {
      id: "fonction_publique-2",
      domaine: "fonction_publique",
      prompt: "Quels sont les droits et obligations d'un agent public ?",
      contextHint: "Statut général de la fonction publique gabonaise — droits et obligations.",
    },
    {
      id: "fonction_publique-3",
      domaine: "fonction_publique",
      prompt: "Comment fonctionne l'avancement dans la fonction publique ?",
      contextHint: "Statut général de la fonction publique gabonaise — avancement d'échelon et de grade.",
    },
    {
      id: "fonction_publique-4",
      domaine: "fonction_publique",
      prompt: "Quelles sont les sanctions disciplinaires applicables ?",
      contextHint: "Statut général de la fonction publique gabonaise — régime disciplinaire.",
    },
    {
      id: "fonction_publique-5",
      domaine: "fonction_publique",
      prompt: "Comment se déroule la mise à la retraite d'un fonctionnaire ?",
      contextHint: "Statut général de la fonction publique gabonaise — admission à la retraite.",
    },
  ],
  fiscal: [
    {
      id: "fiscal-1",
      domaine: "fiscal",
      prompt: "Quels sont les principaux impôts au Gabon ?",
      contextHint: "Code général des impôts gabonais — panorama des impôts directs et indirects.",
    },
    {
      id: "fiscal-2",
      domaine: "fiscal",
      prompt: "Comment déclarer mes revenus en tant que particulier ?",
      contextHint: "Code général des impôts gabonais — impôt sur le revenu des personnes physiques.",
    },
    {
      id: "fiscal-3",
      domaine: "fiscal",
      prompt: "Quelles sont les obligations fiscales d'une entreprise ?",
      contextHint: "Code général des impôts gabonais — obligations déclaratives des sociétés.",
    },
    {
      id: "fiscal-4",
      domaine: "fiscal",
      prompt: "Comment fonctionne la TVA au Gabon ?",
      contextHint: "Code général des impôts gabonais — régime de la TVA.",
    },
    {
      id: "fiscal-5",
      domaine: "fiscal",
      prompt: "Quels sont les délais de prescription en matière fiscale ?",
      contextHint: "Code général des impôts gabonais — prescription des créances fiscales.",
    },
  ],
};

export const AMAIA_SUGGESTIONS: readonly AmaiaSuggestion[] = SUGGESTION_DOMAINES.flatMap(
  (d) => QUESTIONS_PAR_DOMAINE[d],
);

/**
 * Retourne les 5 suggestions du domaine choisi, ou [] si aucun domaine sélectionné.
 */
export function getSuggestionsForDomaine(
  domaine: SuggestionDomaine | null,
): readonly AmaiaSuggestion[] {
  if (!domaine) return [];
  return QUESTIONS_PAR_DOMAINE[domaine] ?? [];
}

/**
 * Construit le texte effectivement envoyé à /api/chat quand l'utilisateur clique sur une
 * suggestion. Le contextHint est préfixé pour orienter le retriever, mais reste visible
 * dans la textarea pour que l'utilisateur le voie avant d'envoyer.
 */
export function buildSuggestionMessage(suggestion: AmaiaSuggestion): string {
  if (!suggestion.contextHint) return suggestion.prompt;
  return `${suggestion.prompt}\n\n[Contexte : ${suggestion.contextHint}]`;
}
