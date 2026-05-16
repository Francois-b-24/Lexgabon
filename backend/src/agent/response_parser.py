"""Parse la réponse LLM en `StructuredAnswer` pour le rendu « note juridique ».

Stratégie (hybride avec fallback gracieux) :
- Le LLM produit du texte naturel + citations inline `[Article 12, Code du travail]`
  et/ou `[Source : Référence libre]`.
- On segmente en paragraphes (double saut de ligne), on isole la phrase disclaimer.
- Sur chaque paragraphe on extrait les références via deux regex strictes.
- Chaque référence est résolue contre `SourceItem[]` pour récupérer `slug`/`url`.
- Si aucune citation n'est trouvée dans un paragraphe, il reste un paragraphe sans `refs`.
- Si le texte ne se segmente pas (vide / une seule ligne / réponse de refus), on
  retourne au moins un paragraphe contenant le texte tel quel.
"""
from __future__ import annotations

import re
import unicodedata
from typing import Any

from src.agent.schemas import (
    SourceItem,
    StructuredAnswer,
    StructuredParagraph,
    StructuredRef,
)
from src.agent.prompts import (
    DISCLAIMER_MARKER_NORMALIZED,
    normalize_for_disclaimer_check,
)


# Citation type article : [Article 12, Code du travail] ou [Article 12 bis, Code OHADA]
_RE_ARTICLE_CITATION = re.compile(
    r"\[\s*Article\s+(?P<num>\d+(?:[-–]\d+)?(?:\s*(?:bis|ter|quater|quinquies|sexies))?)\s*,\s*(?P<code>[^\]]+?)\s*\]",
    re.IGNORECASE,
)

# Citation libre : [Source : ...] ou [Source: ...]
_RE_SOURCE_CITATION = re.compile(
    r"\[\s*Source\s*:\s*(?P<ref>[^\]]+?)\s*\]",
    re.IGNORECASE,
)


def _norm(text: str) -> str:
    """Normalise pour comparaison (lowercase, sans accents, espaces tassés)."""
    nfd = unicodedata.normalize("NFD", text.lower())
    no_accents = "".join(c for c in nfd if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", no_accents).strip()


def _normalize_article_num(raw: str) -> str:
    s = re.sub(r"\s+", " ", raw).strip().lower()
    return s


def _resolve_article_ref(
    article_num: str,
    code_label: str,
    sources: list[SourceItem],
) -> StructuredRef:
    """Trouve la SourceItem qui matche cet article + code et reconstruit une StructuredRef."""
    target_num = _normalize_article_num(article_num)
    target_code = _norm(code_label)
    label = f"Article {article_num} du {code_label.strip()}"

    matched_index: int | None = None
    for i, s in enumerate(sources):
        s_num = (s.numero_article or "").strip().lower()
        s_citation = _norm(s.citation or "")
        if s_num and s_num == target_num and target_code and target_code.split()[0] in s_citation:
            matched_index = i
            break

    if matched_index is None:
        # Fallback : match sur le numéro seul (utile quand le code dans la citation
        # diffère légèrement du code dans le texte LLM).
        for i, s in enumerate(sources):
            s_num = (s.numero_article or "").strip().lower()
            if s_num and s_num == target_num:
                matched_index = i
                break

    if matched_index is not None:
        src = sources[matched_index]
        return StructuredRef(
            kind="article",
            label=label,
            article=article_num.strip(),
            code=code_label.strip(),
            slug=src.slug,
            url=src.url,
            source=src.source,
            source_index=matched_index,
        )

    return StructuredRef(
        kind="article",
        label=label,
        article=article_num.strip(),
        code=code_label.strip(),
    )


def _resolve_source_ref(reference: str, sources: list[SourceItem]) -> StructuredRef:
    target = _norm(reference)
    matched_index: int | None = None
    for i, s in enumerate(sources):
        if _norm(s.citation or "") == target or target in _norm(s.citation or ""):
            matched_index = i
            break

    if matched_index is not None:
        src = sources[matched_index]
        return StructuredRef(
            kind="source",
            label=reference.strip(),
            slug=src.slug,
            url=src.url,
            source=src.source,
            source_index=matched_index,
        )

    return StructuredRef(kind="source", label=reference.strip())


def _extract_refs_and_strip(
    paragraph_text: str,
    sources: list[SourceItem],
) -> tuple[str, list[StructuredRef]]:
    """Trouve les citations dans le paragraphe, les retire du texte, renvoie le texte nettoyé + refs.

    Les citations sont supprimées du texte parce que le front les affiche distinctement
    (la `label` de chaque StructuredRef contient déjà « Article 12 du Code du travail »).
    Les ponctuations résiduelles « , » ou « . » immédiatement à la place sont nettoyées.
    """
    refs: list[StructuredRef] = []
    seen_keys: set[str] = set()

    def consume_article(m: re.Match[str]) -> str:
        ref = _resolve_article_ref(m.group("num"), m.group("code"), sources)
        key = f"article::{(ref.article or '').lower()}::{_norm(ref.code or '')}"
        if key not in seen_keys:
            seen_keys.add(key)
            refs.append(ref)
        return ""  # supprime du texte ; le rendu UI réinjecte le lien

    def consume_source(m: re.Match[str]) -> str:
        ref = _resolve_source_ref(m.group("ref"), sources)
        key = f"source::{_norm(ref.label)}"
        if key not in seen_keys:
            seen_keys.add(key)
            refs.append(ref)
        return ""

    cleaned = _RE_ARTICLE_CITATION.sub(consume_article, paragraph_text)
    cleaned = _RE_SOURCE_CITATION.sub(consume_source, cleaned)

    # Nettoyer ponctuations orphelines créées par la suppression : « ... , . » ou doubles espaces
    cleaned = re.sub(r"\s+([,.;:!?])", r"\1", cleaned)
    cleaned = re.sub(r"([,.;:!?])\s*\1+", r"\1", cleaned)
    cleaned = re.sub(r"\(\s*\)", "", cleaned)
    cleaned = re.sub(r"\s{2,}", " ", cleaned)
    cleaned = cleaned.strip(" ,;\t")

    return cleaned, refs


def _split_paragraphs(text: str) -> list[str]:
    """Segmente en paragraphes sur double saut de ligne, ou ponctuation forte si une seule ligne."""
    if not text.strip():
        return []
    # Cas standard : double newline.
    parts = [p.strip() for p in re.split(r"\n{2,}", text) if p.strip()]
    if len(parts) > 1:
        return parts
    # Fallback : si tout est sur une ligne, garder tel quel (le LLM n'a pas paragraphé).
    return [text.strip()]


def parse_legal_note(raw_text: str, sources: list[SourceItem | dict[str, Any]]) -> StructuredAnswer:
    """Transforme la réponse LLM brute en StructuredAnswer.

    `sources` peut être déjà des SourceItem (Pydantic) ou des dicts (cas runtime
    où on les construit en chemin). On normalise.
    """
    src_items: list[SourceItem] = []
    for s in sources:
        if isinstance(s, SourceItem):
            src_items.append(s)
        elif isinstance(s, dict):
            try:
                src_items.append(SourceItem(**{k: v for k, v in s.items() if k in SourceItem.model_fields}))
            except Exception:
                continue

    text = (raw_text or "").strip()
    if not text:
        return StructuredAnswer(paragraphs=[])

    # Détection et extraction du disclaimer obligatoire (uniquement s'il est isolé sur
    # sa propre ligne, séparé du corps par un saut de ligne — sinon on le laisse au sein
    # du paragraphe pour ne pas tronquer la réponse).
    disclaimer: str | None = None
    lines = text.splitlines()
    if len(lines) >= 2:
        last = lines[-1].strip()
        if last and DISCLAIMER_MARKER_NORMALIZED in normalize_for_disclaimer_check(last):
            disclaimer = last
            text = "\n".join(lines[:-1]).rstrip()

    paragraphs_raw = _split_paragraphs(text)
    paragraphs: list[StructuredParagraph] = []
    for p in paragraphs_raw:
        cleaned, refs = _extract_refs_and_strip(p, src_items)
        # On garde le paragraphe même vide (refs présentes) au cas où il est purement
        # citationnel — le rendu UI affichera alors uniquement les refs.
        if not cleaned and not refs:
            continue
        paragraphs.append(StructuredParagraph(text=cleaned, refs=refs))

    if not paragraphs and disclaimer:
        # Texte vide après nettoyage mais disclaimer présent : on garde au moins un paragraphe vide.
        paragraphs.append(StructuredParagraph(text="", refs=[]))

    return StructuredAnswer(paragraphs=paragraphs, disclaimer=disclaimer)
