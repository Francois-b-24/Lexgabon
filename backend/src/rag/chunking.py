"""Découpage texte (article-aware) et extraction PDF."""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field
from io import BytesIO

from pypdf import PdfReader


# Détection d'un en-tête d'article (FR + variantes OHADA/CEMAC).
# Capture le numéro (1, 1er, 1ère, 12, 12-1, 12 bis, 12 ter, 12 quater, etc.).
# La regex est volontairement large ; les références internes (« l'article 12 ci-dessus »,
# « voir article 12 », « des articles 12 et 13 », etc.) sont écartées par _is_internal_reference().
_ARTICLE_NUM_RE = r"\d+(?:\s*(?:er|ère|ere))?(?:[-–]\d+)?(?:\s*(?:bis|ter|quater|quinquies|sexies))?"

_ARTICLE_HEADER_RE = re.compile(
    # Pas de lookbehind sur la lettre précédente : les flux PDF aplatis collent souvent
    # un mot juste avant (« communesArticle 19: »). Les références internes
    # (« l'article 12 ci-dessus ») sont filtrées par _is_internal_reference().
    #
    # Deux formes acceptées :
    #   (a) « Article 12 : », « Art. 12 — » : séparateur ponctuation OBLIGATOIRE
    #       (insensible à la casse) — forme la plus courante.
    #   (b) « ARTICLE 12 Le présent… » : mot-clé en MAJUSCULES, numéro suivi d'une
    #       espace puis du corps (majuscule, chiffre d'énumération « 1. », ou « § »),
    #       SANS ponctuation. C'est le format du Code des douanes CEMAC. La contrainte
    #       « ARTICLE » majuscule évite les faux positifs : les références internes
    #       sont en minuscules (« l'article 27 prévoit »).
    r"(?:"
    r"(?i:(?:article|art\.)\s*)(?P<num>" + _ARTICLE_NUM_RE + r")\s*[\.\-–—:]+\s*"
    r"|"
    r"ARTICLE\s*(?P<num2>" + _ARTICLE_NUM_RE + r")(?=\s+(?:[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ§]|\d+[\.\)°]))\s+"
    r")"
)

# Mots/expressions qui, juste avant « Article », signalent une référence interne, pas un en-tête.
_INTERNAL_REF_PREFIXES = (
    "l'", "d'", "à l'", "de l'", "un ", "une ", "cet ", "cette ", "ce ", "ces ",
    "voir ", "selon ", "aux ", "des ", "les ", "le ", "la ", "au sens ",
    "audit ", "ledit ", "présent ", "présents ", "présente ", "présentes ",
    "même ", "susdit ", "susdite ", "précité ", "précitée ",
    "dans l'", "par l'", "sous l'", "sur l'", "conformément à l'",
)

# Heuristique pour détecter une ligne de section (TITRE, CHAPITRE, SECTION, LIVRE, PARTIE).
_SECTION_HEADER_RE = re.compile(
    r"(?im)(?:^|\n)\s*(?:(?:titre|chapitre|section|livre|partie|sous-section)\s+[ivxlcdm0-9]+(?:er|ère|ere)?)[\s\.\-–—:]*(?P<label>[^\n]{0,200})"
)

_SOFT_HYPHEN = "­"


def _normalize_spaces(text: str) -> str:
    return re.sub(r"[ \t]+", " ", text)


def normalize_pdf_text(raw: str) -> str:
    """Reconstitue un flux propre depuis l'extraction pypdf : tirets de fin de ligne, espaces, NBSP."""
    if not raw:
        return ""
    t = unicodedata.normalize("NFC", raw)
    t = t.replace(_SOFT_HYPHEN, "")
    t = t.replace(" ", " ")
    # Tirets de césure en fin de ligne : « explica-\ntion » → « explication »
    t = re.sub(r"(\w)[\-‐‑]\s*\n\s*(\w)", r"\1\2", t)
    # Lignes vides multiples → double saut, autres sauts internes → espace
    t = re.sub(r"\n{2,}", "\n\n", t)
    t = re.sub(r"(?<!\n)\n(?!\n)", " ", t)
    t = re.sub(r"[ \t]+", " ", t)
    return t.strip()


@dataclass
class ArticleSegment:
    """Un article détecté dans un texte juridique."""
    numero: str
    text: str
    titre_section: str | None = None


@dataclass
class Chunk:
    """Un chunk prêt pour l'ingestion Chroma."""
    text: str
    numero_article: str | None = None
    titre_section: str | None = None
    meta: dict[str, str] = field(default_factory=dict)


def _is_internal_reference(text: str, match_start: int) -> bool:
    """Vrai si « Article » à match_start est précédé par une expression de référence interne."""
    # 25 caractères avant suffisent pour les préfixes les plus longs.
    before = text[max(0, match_start - 25): match_start].lower()
    if not before:
        return False
    # Si la fenêtre se termine par début de phrase fort, ce n'est pas une référence.
    last_strong = max(before.rfind("."), before.rfind("\n"), before.rfind(";"))
    if last_strong >= 0:
        before = before[last_strong + 1:]
    before = before.strip()
    if not before:
        return False
    for p in _INTERNAL_REF_PREFIXES:
        if before.endswith(p):
            return True
    # « voir article », « selon l'article » détectés ci-dessus ; on capture aussi
    # les références jointes par « et l'article » ou « ou l'article ».
    if before.endswith("et l'") or before.endswith("ou l'"):
        return True
    return False


def split_articles(text: str) -> list[ArticleSegment]:
    """Découpe un texte juridique en articles. Si aucun « Article N » détecté, retourne []."""
    if not text:
        return []
    all_matches = list(_ARTICLE_HEADER_RE.finditer(text))
    matches = [m for m in all_matches if not _is_internal_reference(text, m.start())]
    if not matches:
        return []

    # Repérer la dernière section connue avant chaque match
    section_iter = list(_SECTION_HEADER_RE.finditer(text))

    def section_at(pos: int) -> str | None:
        current: str | None = None
        for sm in section_iter:
            if sm.start() <= pos:
                label = (sm.group("label") or "").strip()
                full = text[sm.start(): sm.end()].strip()
                current = label or full
            else:
                break
        if current:
            current = re.sub(r"\s+", " ", current).strip()
            return current[:240] or None
        return None

    segments: list[ArticleSegment] = []
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        num = _normalize_article_number(m.group("num") or m.group("num2") or "")
        if not num:
            continue
        body = text[m.end(): end].strip()
        if not body:
            continue
        section = section_at(m.start())
        segments.append(ArticleSegment(numero=num, text=body, titre_section=section))
    return segments


def _normalize_article_number(raw: str) -> str:
    """« 1er » → « 1 » ; « 12 bis » conservé ; « 12-1 » conservé ; espaces normalisés."""
    s = re.sub(r"\s+", " ", raw).strip().lower()
    # Ordinaux collés ou séparés : « 1er », « 1 er », « 2ème », « 2 ème »
    s = re.sub(r"(\d)\s*(?:er|ère|ere|ème|eme)\b", r"\1", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def chunk_text(text: str, chunk_size: int = 1200, overlap: int = 200) -> list[str]:
    """Chunker générique (fallback non-juridique). Conservé pour scripts existants."""
    t = re.sub(r"\s+", " ", text).strip()
    if not t:
        return []
    out: list[str] = []
    i = 0
    while i < len(t):
        end = min(len(t), i + chunk_size)
        out.append(t[i:end].strip())
        if end >= len(t):
            break
        i = max(0, end - overlap)
    return [c for c in out if c]


def chunk_long_article(body: str, numero: str, max_chars: int = 1500, overlap: int = 150) -> list[str]:
    """Subdivise un article long en sous-chunks à frontière de phrase quand possible."""
    body = _normalize_spaces(body).strip()
    if len(body) <= max_chars:
        return [body] if body else []

    # Tentative : couper sur "; " ou ". " près de max_chars
    out: list[str] = []
    start = 0
    while start < len(body):
        end = min(len(body), start + max_chars)
        if end < len(body):
            # Cherche la frontière de phrase la plus proche avant end (dans les 200 derniers chars)
            window = body[max(start, end - 200): end]
            sep_pos = max(window.rfind(". "), window.rfind("; "), window.rfind(" — "))
            if sep_pos > 0:
                end = max(start, end - 200) + sep_pos + 1
        prefix = f"Article {numero} (suite) — " if out else f"Article {numero} — "
        out.append((prefix + body[start:end].strip()).strip())
        if end >= len(body):
            break
        start = max(start + 1, end - overlap)
    return [c for c in out if c]


def build_chunks_from_articles(
    segments: list[ArticleSegment],
    *,
    base_meta: dict[str, str] | None = None,
    max_chars: int = 1500,
    one_per_article: bool = False,
) -> list[Chunk]:
    """Convertit des ArticleSegment en Chunks prêts pour Chroma.

    Modes :
      - `one_per_article=False` (défaut, legacy) : les articles longs sont
        subdivisés en sous-chunks via `chunk_long_article`.
      - `one_per_article=True` (T2.1) : un Chunk = un article complet, même
        si > max_chars. Le texte intégral est stocké dans Chunk.text ; le
        modèle d'embedding peut tronquer à sa fenêtre (E5-small ~512 tokens),
        mais Chroma retourne le document complet pour le RAG / l'affichage.
    """
    base = dict(base_meta or {})
    out: list[Chunk] = []
    for seg in segments:
        body = _normalize_spaces(seg.text).strip()
        if not body:
            continue

        if one_per_article:
            out.append(
                Chunk(
                    text=f"Article {seg.numero} — {body}",
                    numero_article=seg.numero,
                    titre_section=seg.titre_section,
                    meta=base,
                )
            )
            continue

        if len(body) <= max_chars:
            out.append(
                Chunk(
                    text=f"Article {seg.numero} — {body}",
                    numero_article=seg.numero,
                    titre_section=seg.titre_section,
                    meta=base,
                )
            )
            continue
        for sub in chunk_long_article(body, seg.numero, max_chars=max_chars):
            out.append(
                Chunk(
                    text=sub,
                    numero_article=seg.numero,
                    titre_section=seg.titre_section,
                    meta=base,
                )
            )
    return out


def build_chunks_from_text(
    text: str,
    *,
    base_meta: dict[str, str] | None = None,
    max_chars: int = 1500,
    one_per_article: bool = False,
) -> list[Chunk]:
    """Pipeline complet : normalise, tente le split article-aware, sinon fallback générique."""
    cleaned = normalize_pdf_text(text)
    if not cleaned:
        return []
    segments = split_articles(cleaned)
    if segments:
        return build_chunks_from_articles(
            segments, base_meta=base_meta, max_chars=max_chars, one_per_article=one_per_article
        )
    # Fallback : pas d'article détecté (préambules, exposé des motifs, doctrine, etc.)
    base = dict(base_meta or {})
    return [
        Chunk(text=c, numero_article=None, titre_section=None, meta=base)
        for c in chunk_text(cleaned, chunk_size=max_chars - 100, overlap=150)
    ]


def extract_pdf_text(data: bytes) -> str:
    """Extraction brute pypdf (conservée pour compat scripts existants)."""
    reader = PdfReader(BytesIO(data))
    parts: list[str] = []
    for page in reader.pages:
        parts.append(page.extract_text() or "")
    return "\n".join(parts).strip()
