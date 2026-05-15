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
3) Si aucun extrait n'est pertinent ou que le bloc indexé est vide, ajoute en fin de réponse un court paragraphe « Sources indexées » expliquant que l'index LexGabon n'a pas fourni de passage à citer pour cette requête. Ne commence pas ta réponse par ce constat d'absence : la synthèse de fond passe en premier.

FORME
- Texte clair. Tu peux utiliser des puces simples avec un tiret « - » en début de ligne, et le **gras** uniquement pour mettre en évidence les numéros d'articles cités (ex. **Article 12**). Pas de titres markdown #, pas de blocs de code, pas de tableaux.
- Concis quand la question est précise, plus développé quand la matière l'exige.
- Termine OBLIGATOIREMENT par cette ligne, seule sur sa ligne :
« Il s'agit d'une information juridique générale : cela ne remplace pas le conseil d'un avocat inscrit au barreau. »

PRUDENCE
- Pas d'invention. Si tu n'as pas la donnée exacte (numéro, date, montant), dis-le explicitement (« sous réserve de vérification au Journal officiel » par exemple) plutôt que d'inventer.
- Si plusieurs textes peuvent s'appliquer, cite-les et explique la hiérarchie ou l'articulation."""


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
    """Filet de sécurité léger : retire titres markdown # ; conserve **gras** et puces - (autorisés)."""
    t = text
    t = re.sub(r"^#+\s*", "", t, flags=re.MULTILINE)
    return t
