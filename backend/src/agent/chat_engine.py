"""Moteur du chatbot : RAG une fois + un appel LLM (pas d'outils, pas de session uploads)."""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from src.agent import llm
from src.agent.prompts import (
    build_system_prompt,
    build_user_message,
    question_seeks_citations,
    strip_markdown_heuristic,
    strip_meta_rag_paragraphs,
)
from src.rag import retriever
from src.rag.gate import GateDecision, GateReason, evaluate as gate_evaluate


# Capture les marqueurs de citation article dans la réponse LLM.
# Formes couvertes (toutes insensibles à la casse) :
#   [Article 12, Code …]          — format imposé par le prompt
#   [Art. 12 bis, Code …]         — variante abrégée avec ponctuation
#   article 12 du Code …          — mention inline sans crochet
#   « article 12 »                — guillemets français
#   article 12-1 / 12 ter / 1er   — numéros composés et ordinaux
_ARTICLE_CITATION_RE = re.compile(
    r"""
    (?:
        # Forme entre crochets : [Article 12 …] ou [Art. 12 …]
        \[\s*art(?:icle|\.)\s+
      |
        # Forme guillemets français : « article 12 »
        «\s*article\s+
      |
        # Mention inline hors crochet : "article 12" ou "Art. 12"
        \bart(?:icle|\.)\s+
    )
    # Numéro : entier + optional ordinal (1er) + optional composé (-1) + optional suffixe latin
    (?P<num>
        [0-9]+
        (?:\s*(?:er|ère|ere))?
        (?:[-–]\d+)?
        (?:\s*(?:bis|ter|quater|quinquies|sexies))?
    )
    """,
    re.IGNORECASE | re.VERBOSE,
)


def _cited_article_numbers(answer_text: str) -> set[str]:
    """Renvoie l'ensemble des numéros d'articles que le LLM a explicitement cités."""
    out: set[str] = set()
    for m in _ARTICLE_CITATION_RE.finditer(answer_text or ""):
        raw = (m.group("num") or "").strip().lower()
        if not raw:
            continue
        # 1) Retire les suffixes ordinaux directement collés ou séparés d'un chiffre
        #    (1er → 1, 2ème → 2) sans toucher aux suffixes latins (quater contient "er").
        normalized = re.sub(r"(?<=\d)\s*(?:er|ère|ere|ème|eme)\b", "", raw)
        # 2) Colle le suffixe latin au chiffre : « 12 bis » → « 12bis ».
        normalized = re.sub(r"(?<=\d)\s+(?=(?:bis|ter|quater|quinquies|sexies)\b)", "", normalized)
        # 3) Retire les espaces résiduels (ex. tiret composé mal formé).
        normalized = re.sub(r"\s+", "", normalized)
        if normalized:
            out.add(normalized)
    return out


def _filter_sources_to_cited(
    sources: list[dict[str, Any]], cited: set[str]
) -> list[dict[str, Any]]:
    """Garde uniquement les sources dont le numero_article apparaît dans la réponse.

    Si la réponse ne cite explicitement aucun article (cited est vide), on
    renvoie une liste vide : pas de sources affichées sous une réponse qui
    n'en a pas utilisé. Évite d'afficher 12 articles du Code du travail
    sous une réponse sur le droit fiscal qui n'a cité aucun d'entre eux.
    """
    if not cited:
        return []
    kept: list[dict[str, Any]] = []
    for s in sources:
        meta = s.get("metadata") if isinstance(s.get("metadata"), dict) else {}
        num_raw = meta.get("numero_article") if meta else None
        if num_raw is None:
            continue
        normalized = re.sub(r"\s+", "", str(num_raw).strip().lower())
        if normalized and normalized in cited:
            kept.append(s)
    return kept


@dataclass
class ChatAnswer:
    text: str
    sources: list[dict[str, Any]] = field(default_factory=list)
    # Décision du gate lexical, remontée jusqu'à la route pour être exposée
    # dans la réponse API : le refus est un champ typé, pas une phrase à parser.
    decision: GateDecision | None = None


def _domain_labels(decision: GateDecision) -> str:
    """Libellés lisibles des domaines couverts, pour l'utilisateur."""
    from src.rag.lexique import get_lexique

    lex = get_lexique()
    labels: list[str] = []
    for dom_id in decision.indexed_domains:
        d = lex.domain(dom_id)
        labels.append(d.code if d and d.code else dom_id)
    return ", ".join(labels)


def _refusal_block(decision: GateDecision) -> str:
    """Bloc directif quand le gate a prouvé que le corpus ne couvre pas la question.

    Le prompt cesse ici d'être le décideur : la décision est déjà prise, de façon
    déterministe et auditable, et le LLM n'a plus qu'à l'énoncer. C'est ce qui
    rend le refus reproductible — auparavant il dépendait du jugement du modèle
    sur des extraits hors-sujet qu'on lui envoyait quand même.
    """
    couverts = _domain_labels(decision)
    motif = {
        GateReason.OUT_OF_JURISDICTION: (
            "la question porte sur le droit d'un autre pays que le Gabon"
        ),
        GateReason.REGIONAL_NOT_INDEXED: (
            "la question porte sur une norme régionale qui n'est pas dans le corpus indexé"
        ),
        GateReason.CODE_NOT_INDEXED: (
            f"le texte invoqué ({decision.invoked_code_label or 'ce code'}) "
            "ne fait pas partie des textes indexés"
        ),
        GateReason.OUTDATED_REFERENCE: (
            f"la question vise une édition antérieure ({decision.detected_year}) "
            "du texte, alors que le corpus porte l'édition en vigueur"
        ),
        GateReason.DOMAIN_NOT_INDEXED: (
            "la matière juridique concernée n'est pas encore indexée"
        ),
    }.get(decision.reason, "le corpus indexé ne couvre pas cette question")

    return (
        "Décision du système (déjà prise, ne pas la rediscuter) : "
        f"{motif}.\n\n"
        "Instructions impératives :\n"
        "— Indique-le à l'utilisateur en une ou deux phrases sobres, à la première personne.\n"
        f"— Précise les matières que tu peux traiter : {couverts}.\n"
        "— Si le sujet de sa question relève de l'une de ces matières, invite-le à "
        "reformuler sans référence au texte non indexé.\n"
        "— N'invente aucun article, aucune date, aucune référence. Ne cite aucune source.\n"
        "— Ne mentionne ni la base documentaire, ni l'index, ni le moteur de recherche, "
        "ni les passages consultés : parle de ce que tu peux traiter, pas de la technique.\n"
        "— Ajoute l'avertissement final obligatoire."
    )


def _format_rag_block(rows: list[dict[str, Any]], decision: GateDecision | None = None) -> str:
    if decision is not None and decision.blocking:
        return _refusal_block(decision)
    if not rows:
        return (
            "Contexte indexé LexGabon : aucun passage n'a été retourné pour cette requête.\n\n"
            "Instructions :\n"
            "— Si la question relève bien du droit gabonais ou d'une norme régionale applicable (OHADA, CEMAC, COBAC, CIMA), réponds sur le fond à partir de tes connaissances juridiques fiables sans inventer de numéros d'articles ni de dates.\n"
            "— Adopte un ton neutre, sobre et accessible. Ne mentionne pas la base documentaire, l'index, le moteur RAG, le corpus, les passages consultés, ni l'absence de passage trouvé. L'utilisateur n'a pas besoin de cette information technique. Réponds simplement à sa question."
        )
    body = retriever.format_context_for_llm(rows, max_chars_per=900)
    return (
        "Contexte indexé LexGabon (extraits à exploiter ; chaque emprunt doit être cité au format "
        "[Article N, <Nom du code ou loi>] si l'extrait porte un numéro d'article, sinon [Source : <référence>]) :\n\n"
        + body
    )


def _anthropic_messages_from_history(hist: list[dict[str, str]]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for m in hist:
        role = m.get("role")
        content = (m.get("content") or "").strip()
        if role not in ("user", "assistant") or not content:
            continue
        out.append({"role": role, "content": content})
    return out


def run_chat(
    question: str,
    domaine: str | None,
    hist: list[dict[str, str]],
    *,
    profile: str | None = None,
) -> ChatAnswer:
    """Récupère top-k Chroma puis un seul appel LLM (texte uniquement).

    Le gate lexical tranche AVANT la recherche : quand il prouve que le corpus
    ne couvre pas la question, on n'interroge pas Chroma du tout. Cela évite
    d'envoyer au LLM des extraits hors-sujet en comptant sur lui pour ne pas les
    citer — ce qui était l'ancien fonctionnement, et ce qui laissait passer 8
    questions hors-périmètre sur 8.
    """
    q = question.strip()
    decision = gate_evaluate(q, domaine)

    if decision.blocking:
        rows: list[dict[str, Any]] = []
    else:
        cite_intent = question_seeks_citations(q)
        rows = retriever.search(q, domaine=domaine, citation_intent=cite_intent)

    rag_block = _format_rag_block(rows, decision)

    messages = _anthropic_messages_from_history(hist)
    if not messages or messages[-1].get("role") != "user":
        messages.append({"role": "user", "content": build_user_message(question, domaine)})

    last = str(messages[-1].get("content") or "")
    messages[-1] = {"role": "user", "content": f"{last}\n\n---\n\n{rag_block}"}

    system_prompt = build_system_prompt(profile)
    msg = llm.create_text_only(system=system_prompt, messages=messages)
    text = strip_markdown_heuristic(llm.extract_text_blocks(msg.content))
    text = strip_meta_rag_paragraphs(text)

    sources: list[dict[str, Any]] = []
    for r in rows[:20]:
        meta = r.get("metadata") if isinstance(r.get("metadata"), dict) else {}
        sources.append(
            {
                "citation": str(r.get("citation", "")),
                "text": str(r.get("text", ""))[:4000],
                "score": float(r.get("score", 0.4)),
                "badge": "doc",
                "id": r.get("id"),
                "metadata": meta,
            }
        )

    # On n'affiche que les sources que le LLM a effectivement citées. Si la
    # réponse n'a cité aucun article (cas type : question hors droit du travail
    # alors que la base ne contient que ce code), on retourne une liste vide
    # — pas de « Sources citées » trompeuses sous la réponse.
    cited = _cited_article_numbers(text)
    sources = _filter_sources_to_cited(sources, cited)
    return ChatAnswer(text=text, sources=sources, decision=decision)
