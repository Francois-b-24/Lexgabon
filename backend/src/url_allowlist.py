"""Domaines autorisés pour le fetch HTTP (ingest URL session) — aligné sur corpus/sources.yaml."""
from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path
from urllib.parse import urlparse

import yaml

from src.config import get_settings

logger = logging.getLogger(__name__)


def _normalize_host(host: str) -> str:
    h = (host or "").lower().strip()
    if h.startswith("www."):
        h = h[4:]
    return h


@lru_cache
def get_allowed_domains() -> tuple[str, ...]:
    s = get_settings()
    p = Path(s.corpus_sources_yaml)
    if not p.is_file():
        backend_root = Path(__file__).resolve().parents[1]
        p = backend_root / "corpus" / "sources.yaml"
    if not p.is_file():
        logger.warning("corpus_sources_yaml introuvable: %s", p)
        return ()
    try:
        raw = yaml.safe_load(p.read_text(encoding="utf-8")) or {}
        allowed = raw.get("allowed_domains") or []
        out = sorted({_normalize_host(str(d)) for d in allowed if str(d).strip()})
        return tuple(out)
    except Exception as e:
        logger.warning("lecture allowlist yaml: %s", e)
        return ()


def is_url_host_allowed(url: str) -> bool:
    raw = urlparse(url.strip()).hostname or ""
    hn = _normalize_host(raw)
    if not hn:
        return False
    for d in get_allowed_domains():
        if not d:
            continue
        if hn == d or hn.endswith("." + d):
            return True
    return False
