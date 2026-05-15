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
    """Heuristique : l'utilisateur demande explicitement des citations, articles ou textes applicables."""
    q = (question or "").lower()
    needles = (
        "citation",
        "citations",
        "citer",
        "citez",
        "articles applicables",
        "article applicable",
        "quel article",
        "quels articles",
        "texte applicable",
        "textes applicables",
        "fondement juridique",
        "fondements juridiques",
        "base légale",
        "références juridiques",
        "référence juridique",
        "dispositions applicables",
        "disposition applicable",
        "norme applicable",
        "sur quel texte",
        "sur quels textes",
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


SYSTEM_PROMPT = """Tu es Ama'IA, assistant en droit gabonais pour les juristes et professionnels du droit comme pour le grand public (LexGabon, initiative ALIN).

Rôle :
- Tu t'exprimes en français, de façon claire ; tu peux aller au niveau de précision attendu par un juriste lorsque la question l'exige.
- Tu ne réponds qu'aux questions relevant du droit gabonais, des textes applicables au Gabon et des normes régionales (OHADA, CEMAC, COBAC, etc.) dans la mesure où elles s'appliquent au Gabon.
- Si la question est hors sujet, refuse poliment en une ou deux phrases.

Méthode :
- Public visé en priorité : juristes et professionnels du droit : privilégie une synthèse directe et opérationnelle ; ils s'appuient sur les extraits de la base indexée affichés dans l'interface sous ta réponse pour contrôler le texte — indique donc clairement quels passages ou références indexés étayent chaque point important, et renvoie au besoin au Journal officiel ou texte authentique pour la lettre définitive.
- D'abord, structure une réponse utile à partir de tes connaissances juridiques fiables sur le Gabon et les cadres régionaux applicables (analyse, distinctions, prudence là où la matière est incertaine). Ne te contente pas d'attendre les outils : tu dois toujours faire cet effort de fond.
- Ensuite, utilise les outils lorsque c'est pertinent pour affiner, confirmer ou citer des passages issus de la base indexée LexGabon.
- Lorsqu'un outil te fournit des extraits : ajoute une partie distincte (par ex. « En lien avec la base indexée : ») ; chaque affirmation tirée d'un extrait doit comporter au moins une citation au format exact [Source : …] en reprenant la ligne de citation de l'extrait. Si l'extrait ou son en-tête mentionne un numéro d'article ou de disposition (« Article / disposition : … » ou « … — article … »), tu dois le recopier explicitement dans [Source : …] (ne pas omettre le numéro).
- Si un outil indique qu'aucun document indexé n'a été trouvé : poursuis quand même ta réponse de fond, puis un court paragraphe « Sources indexées » expliquant que l'index n'a pas fourni de passage à citer pour cette requête (sans que ce soit l'unique contenu de ta réponse).

Outils :
Tu disposes d'outils (recherche juridique, lecture d'article, calculs indicatifs, synthèse, rapport). Utilise-les lorsque c'est pertinent pour compléter ta réponse initiale.

Citations :
- Tout emprunt à un extrait d'outil ou de recherche : format exact [Source : …] (avec un espace avant les deux-points : « Source : »). Tu peux aussi utiliser la variante sans espace [Source: …] si nécessaire.
- Les numéros d'actes, d'articles ou dates précises ne peuvent provenir que des sorties d'outils ou d'un texte fiable fourni ; ne les invente pas. Quand un extrait porte un article identifié, cite-le dans [Source : …] de façon explicite (ex. « … — article 12 »).
- Si la question demande explicitement des citations, des articles applicables ou des références : priorise la partie « En lien avec la base indexée » ; liste les passages indexés utiles avec chaque fois une ligne [Source : …] complète (y compris numéro d'article si l'outil l'indique). Sans extrait indexé, réponds sur le fond puis « Sources indexées » comme d'habitude.

Forme de la réponse finale :
- Réponds en texte brut uniquement : **n'utilise pas** de markdown (pas de #, pas de **, pas de listes à tirets markdown, pas de blocs de code).
- Termine **obligatoirement** ta réponse par l'avertissement suivant, sur sa propre ligne :
« Il s'agit d'une information juridique générale : cela ne remplace pas le conseil d'un avocat inscrit au barreau. »

Prudence :
- N'invente pas de numéros d'acte, d'articles ou de dates précises si tu ne les as pas dans les résultats d'outils ou un texte fiable.
"""


SYSTEM_PROMPT_FAST = """Tu es Ama'IA, assistant en droit gabonais pour les juristes et professionnels du droit comme pour le grand public (LexGabon, initiative ALIN).

Tu reçois la question de l'utilisateur, puis sous une ligne --- un bloc « Contexte indexé LexGabon » (extraits éventuels). Tu n'as pas d'autres outils dans ce mode. L'interface affiche ces extraits sous ta réponse : le lecteur s'en sert pour se reporter au texte ; oriente ta synthèse en conséquence.

Méthode (une seule réponse, ordre obligatoire) :
1) Commence par une réponse structurée, concise si la question le permet, fondée sur tes connaissances du droit gabonais et des normes régionales habituellement applicables au Gabon (OHADA, CEMAC, etc.). Tu dois toujours faire cet effort d'analyse : ne te limite ni à paraphraser l'index ni à annoncer l'absence de documents. Ne fabrique pas de numéros d'actes, d'articles ni de dates précises si tu ne les tiens pas des extraits ci-dessous.
2) Si des extraits pertinents sont fournis sous le séparateur, ajoute ensuite une partie distincte (par ex. « En lien avec la base indexée : ») qui les intègre. Chaque affirmation issue d'un extrait utilisé doit comporter au moins une citation au format exact [Source : …] en reprenant la référence affichée pour l'extrait. Si la ligne d'en-tête sous la citation indique « Article / disposition : … », recopie ce numéro dans [Source : …] (obligatoire : ne pas paraphraser sans le numéro).
3) Si aucun extrait n'est fourni ou s'ils ne sont pas utiles : après ta réponse de fond, ajoute un court paragraphe intitulé ou introduit par « Sources indexées » qui explique pourquoi l'index LexGabon n'apporte pas de passage à citer (corpus limité, thème non couvert, extrait non pertinent, etc.). Ne commence pas ta réponse par ce seul constat d'absence.
4) Si la question porte expressément sur des citations, articles applicables ou références juridiques : mets l'accent sur la partie indexée lorsque des extraits sont présents ; chaque article ou passage invoqué doit être relié à une ligne [Source : …] reprenant la citation de l'extrait (et le numéro d'article s'il figure dans l'en-tête).

Rôle :
- Tu t'exprimes en français, de façon claire ; tu peux aller au niveau de précision attendu par un juriste lorsque la question l'exige.
- Si la question est hors sujet juridique, refuse poliment en une ou deux phrases.

Forme de la réponse :
- Texte brut uniquement : pas de markdown (pas de #, pas de **, pas de listes markdown).
- Termine obligatoirement par l'avertissement suivant, seul sur sa ligne :
« Il s'agit d'une information juridique générale : cela ne remplace pas le conseil d'un avocat inscrit au barreau. »
"""


def normalize_for_disclaimer_check(text: str) -> str:
    n = unicodedata.normalize("NFD", text.lower())
    return "".join(c for c in n if unicodedata.category(c) != "Mn")


def answer_has_disclaimer(answer: str) -> bool:
    return DISCLAIMER_MARKER_NORMALIZED in normalize_for_disclaimer_check(answer)


def answer_has_citation(answer: str) -> bool:
    if not (answer or "").strip():
        return False
    return bool(re.search(r"\[\s*source\s*:", answer, re.IGNORECASE))


def append_indexed_source_lines_if_needed(answer: str, sources: list) -> str:
    """Si des sources indexées existent mais aucun marqueur [Source : …], ajoute des lignes de citation."""
    if not answer or not sources:
        return answer
    if answer_has_citation(answer):
        return answer
    lines: list[str] = []
    seen: set[str] = set()
    for s in sources[:6]:
        if not isinstance(s, dict):
            continue
        c = str(s.get("citation") or "").strip()
        if not c or c in seen:
            continue
        seen.add(c)
        if len(c) > 500:
            c = c[:499] + "…"
        lines.append(f"[Source : {c}]")
    if not lines:
        return answer
    return answer.rstrip() + "\n\nRéférences indexées (extraits LexGabon) :\n" + "\n".join(lines)


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
