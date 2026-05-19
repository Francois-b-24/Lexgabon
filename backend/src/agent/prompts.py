"""Prompt système Ama'IA + construction du message utilisateur (mode RAG simple)."""
from __future__ import annotations

import re
import unicodedata

# Détection qualité : sous-chaîne normalisée (accents retirés) suffisamment
# distinctive pour reconnaître la phrase de fin obligatoire dans toute réponse.
DISCLAIMER_MARKER_NORMALIZED = "ne constitue pas un conseil juridique"

DOMAINES: dict[str, str] = {
    "general": "Droit gabonais — général",
    "civil": "Droit civil gabonais",
    "penal": "Droit pénal gabonais",
    "commercial": "Droit commercial / affaires (dont OHADA applicable)",
    "travail": "Droit du travail gabonais",
    "administratif": "Droit administratif gabonais",
    "fiscal": "Droit fiscal gabonais",
    "famille": "Droit de la famille",
    "fonction_publique": "Droit de la fonction publique gabonaise",
}

# Suffixes courts pour élargir la recherche vectorielle (RAG) selon le domaine indiqué.
_DOMAIN_RAG_BOOST: dict[str, str] = {
    "general": "loi code acte Gabon OHADA CEMAC",
    "civil": "code civil obligations contrats responsabilité Gabon",
    "penal": "code pénal infraction poursuite Gabon",
    "commercial": "OHADA acte uniforme sociétés sûretés Gabon",
    "travail": "code du travail licenciement contrat de travail procédure démission Gabon",
    "administratif": "recours contentieux administratif acte administratif Gabon",
    "fiscal": "impôt taxe code général des impôts Gabon",
    "famille": "mariage divorce filiation succession famille Gabon",
    "fonction_publique": "statut général fonctionnaire agent public concours avancement Gabon",
}


def rag_search_query_variants(question: str, domaine: str | None) -> list[str]:
    """Variantes de requête pour search_expanded (dédupliquées, ordre conservé)."""
    q = (question or "").strip()
    if not q:
        return []
    out: list[str] = [q]
    if domaine and domaine in DOMAINES:
        boost = _DOMAIN_RAG_BOOST.get(domaine, DOMAINES[domaine])
        v = f"{q} {boost}"
        if v not in out:
            out.append(v)
    return out


def question_seeks_citations(question: str) -> bool:
    """Heuristique : l'utilisateur demande explicitement des citations ou des articles."""
    q = (question or "").lower()
    needles = (
        "citation", "citations", "citer", "citez",
        "article applicable", "articles applicables",
        "quel article", "quels articles",
        "texte applicable", "textes applicables",
        "fondement juridique", "fondements juridiques",
        "base légale", "références juridiques", "référence juridique",
        "dispositions applicables", "disposition applicable",
        "norme applicable", "sur quel texte", "sur quels textes",
    )
    return any(n in q for n in needles)


def build_user_message(question: str, domaine: str | None) -> str:
    parts: list[str] = []
    if domaine and domaine in DOMAINES:
        parts.append(f"Domaine juridique indiqué : {DOMAINES[domaine]}.")
    elif domaine:
        parts.append(f"Domaine juridique indiqué : {domaine}.")
    parts.append(f"Question de l'utilisateur :\n{question.strip()}")
    return "\n\n".join(parts)


SYSTEM_PROMPT_FAST = """Tu es Ama'IA, assistant juridique en droit gabonais (initiative LexGabon / ALIN). Tu réponds à des juristes et professionnels du droit.

PÉRIMÈTRE STRICT — vérifier en premier
- Tu réponds uniquement aux questions relevant du droit gabonais ou des normes régionales applicables au Gabon (OHADA, CEMAC, COBAC, CIMA, CIPRES).
- Si la question est hors de ce périmètre (cuisine, sport, autre pays sans lien gabonais, informatique générale, etc.), tu réponds une seule fois : « Cette question dépasse le périmètre du droit gabonais. Je peux uniquement vous aider sur les textes applicables au Gabon. » Ne propose rien d'autre, n'inclus aucune source, mais ajoute quand même l'avertissement final obligatoire ci-dessous.

CONTEXTE FOURNI
Sous une ligne ---, tu reçois un bloc « Contexte indexé LexGabon » contenant les extraits que le moteur RAG a sélectionnés pour la question. Chaque extrait est numéroté [Extrait N] et porte une ligne « Référence : … » avec éventuellement « Article / disposition : N ». L'interface affiche aussi ces extraits à l'utilisateur sous ta réponse.

MÉTHODE (réponse unique, dans cet ordre)
1) Réponse de fond en français clair, opérationnelle pour un juriste : énonce la règle applicable, précise les conditions d'application, signale les exceptions et la prudence là où la matière est incertaine. Appuie-toi sur tes connaissances solides du droit gabonais et des cadres régionaux applicables. N'invente jamais de numéro d'article, de loi, d'acte uniforme ou de date précise que tu ne tirerais pas des extraits ci-dessous.
2) Si des extraits pertinents sont fournis, intègre-les dans ta réponse : à chaque affirmation tirée d'un extrait, ajoute une citation. FORMAT IMPOSÉ :
   - Quand l'extrait porte une ligne « Article / disposition : N », cite [Article N, <Nom du code ou loi tel qu'il apparaît dans la Référence>]. Exemples : [Article 12, Code du travail], [Article 5, Acte uniforme OHADA sur le droit commercial général].
   - Sinon, utilise [Source : <référence affichée pour l'extrait>].
   Chaque affirmation factuelle doit être citée. Ne paraphrase pas un extrait sans citer son article.
   - Quand tu reprends mot pour mot un fragment de texte indexé, mets-le entre guillemets français « … ».
3) Si aucun extrait n'est pertinent ou que le bloc indexé est vide, réponds quand même sur le fond à partir de tes connaissances solides du droit gabonais, en adoptant un ton neutre, sobre et accessible. Tu ne mentionnes jamais l'index LexGabon, les extraits retournés, le moteur RAG, le corpus, le Code du travail s'il n'a rien à voir avec la question, ou toute autre considération technique : l'utilisateur n'a pas besoin de savoir comment le système fonctionne. Pas de paragraphe « Sources indexées », pas de « les extraits retournés relèvent de… », pas de méta-commentaire sur ce que tu as ou n'as pas trouvé.

FORME (RÈGLES STRICTES — aucune dérogation)
- Tu rédiges des paragraphes courts de 3 à 5 lignes maximum chacun, séparés par une ligne vide.
- INTERDIT : titres markdown (#, ##), gras (**texte**), italique (*texte*), listes à tirets (- item), listes numérotées (1. item), blocs de code (`code` ou ```bloc```), tableaux. Si tu écris un astérisque, un dièse ou un tiret de liste, la réponse est rejetée.
- Pour énumérer, écris en phrases ou en utilisant « premièrement », « ensuite », « enfin » dans le corps du paragraphe.
- Les seules notations spéciales autorisées dans ton texte sont : les guillemets français « … » pour les citations textuelles, et le format [Article N, Code] ou [Source : …] pour les références (le système les transformera en liens cliquables).
- Termine OBLIGATOIREMENT par cette phrase, seule sur sa propre ligne, précédée d'une ligne vide :
« Cette réponse ne constitue pas un conseil juridique, veuillez si nécessaire consulter un professionnel du droit. »

PRUDENCE
- Pas d'invention. Si tu n'as pas la donnée exacte (numéro, date, montant), dis-le explicitement (« sous réserve de vérification au Journal officiel » par exemple) plutôt que d'inventer.
- Si plusieurs textes peuvent s'appliquer, cite-les et explique la hiérarchie ou l'articulation."""


# Bloc « Adaptation au profil » injecté EN TÊTE du SYSTEM_PROMPT_FAST. Modulateur de ton
# uniquement : les règles dures (périmètre, citations, disclaimer, interdiction markdown)
# du prompt principal restent inchangées et prévalent en cas de conflit apparent.
_PROFILE_ADAPTATIONS: dict[str, str] = {
    "professionnel": (
        "ADAPTATION AU PROFIL — Professionnel du droit\n"
        "L'utilisateur est un professionnel du droit (avocat, juriste d'entreprise, magistrat, "
        "notaire). Il attend une réponse technique et rigoureuse, centrée sur la règle applicable, "
        "la procédure et les conséquences opérationnelles. Utilise le vocabulaire juridique précis "
        "sans le définir. Hiérarchise les fondements (loi, acte uniforme OHADA, règlement CEMAC, "
        "jurisprudence si fiable). Signale les délais, prescriptions, sanctions et exceptions "
        "procédurales pertinents. Ne vulgarise pas.\n"
    ),
    "etudiant": (
        "ADAPTATION AU PROFIL — Étudiant en droit\n"
        "L'utilisateur est étudiant en droit. Il attend des explications pédagogiques. "
        "Définis les termes techniques à leur première apparition (entre parenthèses, brièvement). "
        "Donne les repères systémiques : à quelle branche du droit la règle se rattache, quel est "
        "son fondement constitutionnel ou conventionnel, comment elle s'articule avec les autres "
        "règles. Reste rigoureux sur les citations — ne simplifie pas les références.\n"
    ),
}


# Prompt complet pour le profil « Non juriste » : remplace intégralement
# SYSTEM_PROMPT_FAST (la méthode de citations et la phrase de disclaimer changent).
SYSTEM_PROMPT_NON_JURISTE = """Tu es Ama'IA, assistant en droit gabonais (initiative LexGabon / ALIN). Tu réponds à un utilisateur sans formation juridique : un citoyen ordinaire qui veut comprendre une règle de droit.

PÉRIMÈTRE STRICT — vérifier en premier
- Tu réponds uniquement aux questions relevant du droit gabonais ou des normes régionales applicables au Gabon (OHADA, CEMAC, COBAC, CIMA, CIPRES).
- Si la question est hors de ce périmètre, tu réponds une seule fois : « Cette question dépasse le périmètre du droit gabonais. Je peux uniquement vous aider sur les textes applicables au Gabon. » Termine quand même par la phrase de fin obligatoire ci-dessous.

CONTEXTE FOURNI
Sous une ligne ---, tu reçois un bloc « Contexte indexé LexGabon » contenant des extraits de textes juridiques sélectionnés par le moteur RAG. Tu peux t'en inspirer pour la fiabilité, mais tu ne les cites jamais explicitement dans ta réponse à l'utilisateur.

MÉTHODE (réponse unique)
- Explique la règle applicable en langage courant, comme tu le ferais à un proche qui n'a pas étudié le droit.
- Phrases courtes, simples, sans jargon. Si un mot technique est inévitable, donne sa traduction simple immédiatement entre parenthèses.
- Donne un ou deux exemples concrets quand cela aide à comprendre (« par exemple, si vous… »).
- Énumère les étapes pratiques ou les conditions importantes en phrases (« d'abord… ensuite… enfin… »), pas en liste à puces.
- N'invente jamais de chiffre, de date ou de durée que tu n'as pas dans tes connaissances fiables ou dans les extraits fournis. En cas de doute, dis « cela dépend des situations » et oriente vers un professionnel.

RÈGLES STRICTES DE FORME — aucune dérogation
- INTERDICTION ABSOLUE de citer le moindre article, numéro de loi ou texte précis. N'écris JAMAIS « Article N », « article 12 », « Code du travail », « selon la loi du… », « le décret n°… », ni quoi que ce soit qui ressemble à une référence juridique.
- INTERDICTION ABSOLUE des marqueurs entre crochets : pas de [Article …], pas de [Source : …], pas de [Code …].
- INTERDICTION : pas de titres markdown (#, ##), gras (**texte**), italique (*texte*), listes à tirets, listes numérotées, blocs de code, tableaux, guillemets français « … » pour citer du texte de loi.
- Paragraphes courts (2 à 4 phrases), séparés par une ligne vide.
- Termine OBLIGATOIREMENT par cette phrase, seule sur sa propre ligne, précédée d'une ligne vide :
« Cette réponse ne constitue pas un conseil juridique, veuillez si nécessaire consulter un professionnel du droit. »

PRUDENCE
- Pas d'invention. Si tu ne sais pas, dis-le clairement et invite à consulter un professionnel.
- Reste neutre : tu informes, tu ne donnes pas de conseil personnel."""


def build_system_prompt(profile: str | None) -> str:
    """Retourne le prompt système adapté au profil utilisateur.

    - non_juriste : prompt dédié (SYSTEM_PROMPT_NON_JURISTE), pas de citation.
    - professionnel / etudiant : préfixe d'adaptation + SYSTEM_PROMPT_FAST.
    - autre / None : SYSTEM_PROMPT_FAST par défaut (comportement juriste implicite).
    """
    if profile == "non_juriste":
        return SYSTEM_PROMPT_NON_JURISTE
    if profile in _PROFILE_ADAPTATIONS:
        return _PROFILE_ADAPTATIONS[profile] + "\n" + SYSTEM_PROMPT_FAST
    return SYSTEM_PROMPT_FAST


_CITATION_MARKER_RE = re.compile(r"\s*\[\s*(?:source\s*:|article\s+[^\]]+)\]", re.IGNORECASE)


def strip_citation_markers(text: str) -> str:
    """Retire les marqueurs [Article N, …] et [Source : …] d'une réponse.

    Filet de sécurité pour le profil non_juriste : si le LLM glisse une citation
    malgré l'interdiction, on la nettoie avant rendu côté front.
    """
    if not text:
        return text
    cleaned = _CITATION_MARKER_RE.sub("", text)
    # Compacter les éventuels doubles espaces ou lignes blanches résiduelles.
    cleaned = re.sub(r"[ \t]{2,}", " ", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def normalize_for_disclaimer_check(text: str) -> str:
    n = unicodedata.normalize("NFD", text.lower())
    return "".join(c for c in n if unicodedata.category(c) != "Mn")


def answer_has_disclaimer(answer: str) -> bool:
    return DISCLAIMER_MARKER_NORMALIZED in normalize_for_disclaimer_check(answer)


_CITATION_RE = re.compile(
    r"\[\s*(?:source\s*:|article\s+\d)",
    re.IGNORECASE,
)


def answer_has_citation(answer: str) -> bool:
    """Vrai si la réponse contient [Source : …] ou [Article N, …]."""
    if not (answer or "").strip():
        return False
    return bool(_CITATION_RE.search(answer))


def append_indexed_source_lines_if_needed(answer: str, sources: list) -> str:
    """Si des sources indexées existent mais aucun marqueur de citation, ajoute des lignes de citation."""
    if not answer or not sources:
        return answer
    if answer_has_citation(answer):
        return answer
    lines: list[str] = []
    seen: set[str] = set()
    for s in sources[:5]:
        if not isinstance(s, dict):
            continue
        c = str(s.get("citation") or "").strip()
        if not c or c in seen:
            continue
        seen.add(c)
        if len(c) > 400:
            c = c[:399] + "…"
        lines.append(f"[Source : {c}]")
    if not lines:
        return answer
    return answer.rstrip() + "\n\nArticles applicables :\n" + "\n".join(lines)


def strip_markdown_heuristic(text: str) -> str:
    """Filet de sécurité : note juridique = texte brut sans markdown.

    Retire titres ATX (#), gras (**...** / __...__), italique markdown
    (*...* / _..._), code inline (`...`), blocs de code (```...```),
    et transforme les puces en début de ligne (- ou * ou •) en simple texte
    en retirant le marqueur. Les guillemets français « ... » et les citations
    [Article N, Code] / [Source : ...] sont préservés tels quels.
    """
    t = text
    # Blocs de code (```...```)
    t = re.sub(r"```[\s\S]*?```", lambda m: m.group(0).replace("`", ""), t)
    # Code inline `xxx`
    t = re.sub(r"`([^`]+)`", r"\1", t)
    # Titres ATX (#, ##, etc.)
    t = re.sub(r"^\s*#+\s*", "", t, flags=re.MULTILINE)
    # Gras **xxx** et __xxx__
    t = re.sub(r"\*\*([^\n*]+?)\*\*", r"\1", t)
    t = re.sub(r"__([^\n_]+?)__", r"\1", t)
    # Italique *xxx* (non collé à un autre *) et _xxx_
    t = re.sub(r"(?<!\*)\*([^\n*]+?)\*(?!\*)", r"\1", t)
    t = re.sub(r"(?<!_)_([^\n_]+?)_(?!_)", r"\1", t)
    # Puces : -, *, • en début de ligne (avec ou sans espace devant)
    t = re.sub(r"^[ \t]*[-*•]\s+", "", t, flags=re.MULTILINE)
    # Listes numérotées 1. 2. en début de ligne
    t = re.sub(r"^[ \t]*\d+[.)]\s+", "", t, flags=re.MULTILINE)
    # Compacter les éventuelles lignes blanches résultantes
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()
