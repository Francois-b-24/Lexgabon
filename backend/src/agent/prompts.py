"""Prompt système Ama'IA + construction du message utilisateur (mode RAG simple)."""
from __future__ import annotations

import re
import unicodedata

# Détection qualité : phrase normalisée (accents retirés).
DISCLAIMER_MARKER_NORMALIZED = "information juridique generale"

DOMAINES: dict[str, str] = {
    "general": "Droit gabonais — général",
    "civil": "Droit civil gabonais",
    "penal": "Droit pénal gabonais",
    "commercial": "Droit commercial / affaires (dont OHADA applicable)",
    "travail": "Droit du travail gabonais",
    "administratif": "Droit administratif gabonais",
    "fiscal": "Droit fiscal gabonais",
    "famille": "Droit de la famille",
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
3) Si aucun extrait n'est pertinent ou que le bloc indexé est vide, ajoute en fin de réponse un court paragraphe « Sources indexées » expliquant que l'index LexGabon n'a pas fourni de passage à citer pour cette requête. Ne commence pas ta réponse par ce constat d'absence : la synthèse de fond passe en premier.

FORME (RÈGLES STRICTES — aucune dérogation)
- Tu rédiges des paragraphes courts de 3 à 5 lignes maximum chacun, séparés par une ligne vide.
- INTERDIT : titres markdown (#, ##), gras (**texte**), italique (*texte*), listes à tirets (- item), listes numérotées (1. item), blocs de code (`code` ou ```bloc```), tableaux. Si tu écris un astérisque, un dièse ou un tiret de liste, la réponse est rejetée.
- Pour énumérer, écris en phrases ou en utilisant « premièrement », « ensuite », « enfin » dans le corps du paragraphe.
- Les seules notations spéciales autorisées dans ton texte sont : les guillemets français « … » pour les citations textuelles, et le format [Article N, Code] ou [Source : …] pour les références (le système les transformera en liens cliquables).
- Termine OBLIGATOIREMENT par cette phrase, seule sur sa propre ligne, précédée d'une ligne vide :
« Il s'agit d'une information juridique générale : cela ne remplace pas le conseil d'un avocat inscrit au barreau. »

PRUDENCE
- Pas d'invention. Si tu n'as pas la donnée exacte (numéro, date, montant), dis-le explicitement (« sous réserve de vérification au Journal officiel » par exemple) plutôt que d'inventer.
- Si plusieurs textes peuvent s'appliquer, cite-les et explique la hiérarchie ou l'articulation."""


# Bloc « Adaptation au profil » injecté EN TÊTE du SYSTEM_PROMPT_FAST. Modulateur de ton
# uniquement : les règles dures (périmètre, citations, disclaimer, interdiction markdown)
# du prompt principal restent inchangées et prévalent en cas de conflit apparent.
_PROFILE_ADAPTATIONS: dict[str, str] = {
    "avocat": (
        "ADAPTATION AU PROFIL — Avocat\n"
        "L'utilisateur est avocat. Il attend une réponse technique et rigoureuse, "
        "centrée sur le contentieux, la procédure et les fondements doctrinaux. "
        "Utilise le vocabulaire juridique précis sans le définir. Hiérarchise les "
        "fondements applicables (loi, jurisprudence si tu en as connaissance fiable, doctrine). "
        "Signale les délais, prescriptions et exceptions procédurales pertinents. "
        "Ne vulgarise pas — synthétise comme tu le ferais pour un confrère.\n"
    ),
    "juriste": (
        "ADAPTATION AU PROFIL — Juriste d'entreprise\n"
        "L'utilisateur est juriste d'entreprise ou DAF. Il attend une réponse opérationnelle, "
        "orientée applicabilité business et conformité. Mets en avant les obligations concrètes "
        "(déclarations, formalités, sanctions encourues, délais). Privilégie l'angle OHADA, "
        "CEMAC, COBAC et fiscalité quand pertinent. Vocabulaire juridique précis mais en lien "
        "avec les conséquences pour l'entreprise.\n"
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


def build_system_prompt(profile: str | None) -> str:
    """Retourne le prompt système, éventuellement préfixé par un bloc d'adaptation profil.

    Profile inconnu ou `None` → comportement par défaut (juriste implicite, prompt non modifié).
    """
    if profile in _PROFILE_ADAPTATIONS:
        return _PROFILE_ADAPTATIONS[profile] + "\n" + SYSTEM_PROMPT_FAST
    return SYSTEM_PROMPT_FAST


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
    return answer.rstrip() + "\n\nRéférences indexées :\n" + "\n".join(lines)


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
