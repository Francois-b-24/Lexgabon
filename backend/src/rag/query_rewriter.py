"""Reformulation de requête juridique via Claude Haiku (étape 5).

Génère 2 variantes de la question originale adaptées au droit gabonais,
pour diversifier la couverture vectorielle avant fusion RRF.

Cache LRU 500 entrées sur la question normalisée (clé = strip + lower).
Si l'API est indisponible ou trop lente, retourne une liste vide — le
pipeline se replie sur la question originale seule.
"""
from __future__ import annotations

import logging
import re
import unicodedata
from functools import lru_cache

logger = logging.getLogger(__name__)

_REWRITE_PROMPT = """Tu es un assistant de recherche juridique spécialisé en droit gabonais.
Reformule la question suivante en exactement 2 variantes différentes, adaptées à une recherche dans un corpus de textes juridiques gabonais (codes, lois, ordonnances).
Chaque variante doit utiliser un vocabulaire juridique précis différent de la question originale.
Réponds UNIQUEMENT avec les 2 variantes, une par ligne, sans numérotation ni ponctuation supplémentaire."""


def _normalize_key(question: str) -> str:
    """Clé de cache : lowercase + accents retirés + espaces normalisés."""
    n = unicodedata.normalize("NFD", question.lower())
    n = "".join(c for c in n if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", n).strip()


@lru_cache(maxsize=500)
def _rewrite_cached(key: str, question: str) -> tuple[str, ...]:
    """Appel Haiku mis en cache. Retourne un tuple (vide si échec)."""
    try:
        import anthropic
        from src.config import get_settings
        s = get_settings()
        if not s.anthropic_api_key:
            return ()
        client = anthropic.Anthropic(api_key=s.anthropic_api_key)
        msg = client.messages.create(
            model=s.anthropic_model_fallback,  # Haiku — rapide et peu coûteux
            max_tokens=120,
            temperature=0,
            messages=[{"role": "user", "content": f"{_REWRITE_PROMPT}\n\nQuestion : {question}"}],
        )
        raw = msg.content[0].text if msg.content else ""
        lines = [l.strip() for l in raw.strip().splitlines() if l.strip()][:2]
        return tuple(lines)
    except Exception as e:
        logger.warning("query_rewriter failed (%s) — bypassing", e)
        return ()


def rewrite(question: str) -> list[str]:
    """Retourne jusqu'à 2 variantes reformulées, ou [] si indisponible/échoué."""
    q = (question or "").strip()
    if not q:
        return []
    key = _normalize_key(q)
    variants = _rewrite_cached(key, q)
    # Filtrer les variantes identiques à l'original (normalisé).
    key_orig = key
    return [v for v in variants if _normalize_key(v) != key_orig]
