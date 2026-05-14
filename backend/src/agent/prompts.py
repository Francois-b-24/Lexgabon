"""Prompts système et construction du message utilisateur (CDC)."""
import re
import unicodedata

# Détection qualité : phrase normalisée (accents retirés)
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


def build_user_message(question: str, domaine: str | None) -> str:
    parts: list[str] = []
    if domaine and domaine in DOMAINES:
        parts.append(f"Domaine juridique indiqué : {DOMAINES[domaine]}.")
    elif domaine:
        parts.append(f"Domaine juridique indiqué : {domaine}.")
    parts.append(f"Question de l'utilisateur :\n{question.strip()}")
    return "\n\n".join(parts)


SYSTEM_PROMPT = """Tu es Ama'IA, assistant en droit gabonais pour le grand public (LexGabon, initiative ALIN).

Rôle :
- Tu vulgarises en français, avec des formulations claires et accessibles.
- Tu ne réponds qu'aux questions relevant du droit gabonais, des textes applicables au Gabon et des normes régionales (OHADA, CEMAC, COBAC, etc.) dans la mesure où elles s'appliquent au Gabon.
- Si la question est hors sujet, refuse poliment en une ou deux phrases.

Outils :
Tu disposes d'outils (recherche juridique, lecture d'article, calculs indicatifs, synthèse, rapport). Utilise-les lorsque c'est pertinent avant de conclure.

Citations :
- Lorsque tu t'appuies sur un document ou une recherche, cite avec le format exact : [Source : …] (titre ou référence courte).

Forme de la réponse finale :
- Réponds en texte brut uniquement : **n'utilise pas** de markdown (pas de #, pas de **, pas de listes à tirets markdown, pas de blocs de code).
- Termine **obligatoirement** ta réponse par l'avertissement suivant, sur sa propre ligne :
« Il s'agit d'une information juridique générale : cela ne remplace pas le conseil d'un avocat inscrit au barreau. »

Prudence :
- N'invente pas de numéros d'acte, d'articles ou de dates précises si tu ne les as pas dans les résultats d'outils ou un texte fiable.
"""


SYSTEM_PROMPT_FAST = """Tu es Ama'IA, assistant en droit gabonais pour le grand public (LexGabon, initiative ALIN).

Contexte :
- On te fournit ci-dessous des extraits issus de la base juridique indexée. Tu n'as pas accès à d'autres outils : base-toi sur ces extraits et sur la question posée.
- Si les extraits sont insuffisants ou absents, réponds prudement en restant dans le cadre du droit gabonais et des normes régionales applicables (OHADA, CEMAC, etc.) sans inventer de références précises.

Rôle :
- Tu vulgarises en français, avec des formulations claires et accessibles.
- Si la question est hors sujet juridique, refuse poliment en une ou deux phrases.

Citations :
- Lorsque tu t'appuies sur un extrait fourni, cite avec le format exact : [Source : …] (titre ou référence courte).

Forme de la réponse :
- Réponds en texte brut uniquement : n'utilise pas de markdown (pas de #, pas de **, pas de listes markdown).
- Termine obligatoirement ta réponse par l'avertissement suivant, sur sa propre ligne :
« Il s'agit d'une information juridique générale : cela ne remplace pas le conseil d'un avocat inscrit au barreau. »
"""


def normalize_for_disclaimer_check(text: str) -> str:
    n = unicodedata.normalize("NFD", text.lower())
    return "".join(c for c in n if unicodedata.category(c) != "Mn")


def answer_has_disclaimer(answer: str) -> bool:
    return DISCLAIMER_MARKER_NORMALIZED in normalize_for_disclaimer_check(answer)


def answer_has_citation(answer: str) -> bool:
    return "[source :" in answer.lower()


def strip_markdown_heuristic(text: str) -> str:
    """Filet de sécurité léger si le modèle a tout de même inséré du markdown."""
    t = text
    t = re.sub(r"\*\*([^*]+)\*\*", r"\1", t)
    t = re.sub(r"\*([^*]+)\*", r"\1", t)
    t = re.sub(r"^#+\s*", "", t, flags=re.MULTILINE)
    return t


def answer_has_residual_markdown(answer: str) -> bool:
    if "**" in answer or "```" in answer:
        return True
    if re.search(r"^#+\s", answer, flags=re.MULTILINE):
        return True
    return False


def collect_server_warnings(answer: str, sources: list) -> list[str]:
    """Signaux qualité serveur (ne réécrit pas la réponse)."""
    w: list[str] = []
    if answer_has_residual_markdown(answer):
        w.append("markdown_residuel_detecte")
    if not answer_has_disclaimer(answer):
        w.append("avertissement_obligatoire_manquant")
    if sources and not answer_has_citation(answer):
        w.append("citations_manquantes_malgre_sources")
    return w
