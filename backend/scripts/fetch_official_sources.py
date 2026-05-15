#!/usr/bin/env python3
"""Télécharge les pages/PDF listés dans corpus/sources.yaml (allowlist) et produit un JSONL.

Différences clés par rapport à la version précédente :
- Chunking article-aware (split par « Article N ») via src.rag.chunking.build_chunks_from_text.
- Métadonnées riches conservées : numero_article, titre_section, code, reference.
- Pour les PDFs distants : passage par src.rag.pdf_parser.chunks_from_pdf (même pipeline que l'ingestion locale).

Usage : cd backend && PYTHONPATH=. python3 scripts/fetch_official_sources.py
"""
from __future__ import annotations

import argparse
import json
import logging
import sys
import time
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import httpx
import trafilatura
import yaml

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.rag.chunking import build_chunks_from_text  # noqa: E402
from src.rag.pdf_parser import chunks_from_pdf  # noqa: E402

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

DEFAULT_UA = "LexGabonCorpusBot/1.0 (+https://github.com/Francois-b-24/Lexgabon)"


def _normalize_host(host: str) -> str:
    h = (host or "").lower().strip()
    if h.startswith("www."):
        h = h[4:]
    return h


def _host_allowed(url: str, allowed_domains: list[str]) -> bool:
    raw = urlparse(url).hostname or ""
    hn = _normalize_host(raw)
    for d in allowed_domains:
        dn = _normalize_host(d)
        if not dn:
            continue
        if hn == dn or hn.endswith("." + dn):
            return True
    return False


def _citation_for(label: str, code: str | None, numero: str | None) -> str:
    base = (code or label or "Document indexé").strip()
    if numero:
        return f"{base} — Article {numero}"
    return base


def _emit_chunks(
    chunks: list[Any],  # list[Chunk]
    *,
    sid: str,
    url: str,
    label: str,
    code: str | None,
    reference: str | None,
    autorite: str | None,
    date: str | None,
) -> list[str]:
    out: list[str] = []
    for i, ch in enumerate(chunks):
        citation = _citation_for(label, code, ch.numero_article)
        if reference and reference not in citation:
            citation = f"{citation} ({reference})"
        record: dict[str, Any] = {
            "id": f"fetch:{sid}:{i}",
            "citation": citation,
            "text": ch.text,
            "fetch_source_id": sid,
            "url": url,
            "titre": label,
        }
        if ch.numero_article:
            record["numero_article"] = ch.numero_article
        if ch.titre_section:
            record["titre_section"] = ch.titre_section
        if code:
            record["code"] = code
        if reference:
            record["reference"] = reference
        if autorite:
            record["autorite"] = autorite
        if date:
            record["date"] = date
        out.append(json.dumps(record, ensure_ascii=False))
    return out


def main() -> None:
    p = argparse.ArgumentParser(description="Fetch allowlist YAML → JSONL article-aware.")
    p.add_argument("--config", type=Path, default=ROOT / "corpus" / "sources.yaml")
    p.add_argument("--out", type=Path, default=ROOT / "data" / "scraped_chunks.jsonl")
    p.add_argument("--delay", type=float, default=1.5, help="Pause entre requêtes (s)")
    p.add_argument("--timeout", type=float, default=45.0)
    p.add_argument("--max-bytes", type=int, default=15_000_000)
    args = p.parse_args()

    cfg_path = args.config.resolve()
    if not cfg_path.is_file():
        logger.error("fichier config introuvable: %s", cfg_path)
        sys.exit(1)

    raw = yaml.safe_load(cfg_path.read_text(encoding="utf-8")) or {}
    allowed = list(raw.get("allowed_domains") or [])
    sources = list(raw.get("sources") or [])
    if not allowed:
        logger.error("allowed_domains vide dans %s", cfg_path)
        sys.exit(1)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    lines_out: list[str] = []

    limits = httpx.Limits(max_keepalive_connections=5, max_connections=5)
    with httpx.Client(
        headers={"User-Agent": DEFAULT_UA},
        timeout=args.timeout,
        follow_redirects=True,
        limits=limits,
    ) as client:
        for idx, src in enumerate(sources):
            if not isinstance(src, dict):
                continue
            sid = str(src.get("id") or f"row-{idx}")
            url = str(src.get("url") or "").strip()
            label = str(src.get("label") or sid)
            kind = str(src.get("kind") or "html").lower().strip()
            code = (src.get("code") or "").strip() or None
            reference = (src.get("reference") or "").strip() or None
            autorite = (src.get("autorite") or "").strip() or None
            date = (src.get("date") or "").strip() or None

            if not url:
                logger.warning("[%s] url manquante", sid)
                continue
            if not _host_allowed(url, allowed):
                logger.error("[%s] domaine non allowlist: %s", sid, url)
                continue
            if idx > 0:
                time.sleep(max(0.0, args.delay))

            try:
                r = client.get(url)
                r.raise_for_status()
                body = r.content
                if len(body) > args.max_bytes:
                    logger.error("[%s] corps trop volumineux (%s octets)", sid, len(body))
                    continue
            except httpx.HTTPError as e:
                logger.error("[%s] HTTP %s: %s", sid, url, e)
                continue

            base_meta = {"fetch_source_id": sid}
            try:
                if kind == "pdf":
                    chunks = chunks_from_pdf(body, base_meta=base_meta)
                else:
                    try:
                        html = body.decode(r.encoding or "utf-8", errors="replace")
                    except Exception as e:
                        logger.error("[%s] décodage HTML: %s", sid, e)
                        continue
                    text_full = trafilatura.extract(html, url=url) or ""
                    if not text_full.strip():
                        logger.warning("[%s] aucun texte extrait: %s", sid, url)
                        continue
                    chunks = build_chunks_from_text(text_full, base_meta=base_meta)
            except Exception as e:
                logger.exception("[%s] parsing échoué: %s", sid, e)
                continue

            if not chunks:
                logger.warning("[%s] 0 chunk produit", sid)
                continue

            lines_out.extend(
                _emit_chunks(
                    chunks,
                    sid=sid,
                    url=url,
                    label=label,
                    code=code,
                    reference=reference,
                    autorite=autorite,
                    date=date,
                )
            )
            articles = len({c.numero_article for c in chunks if c.numero_article})
            logger.info("[%s] %d chunks · %d articles distincts (%s)", sid, len(chunks), articles, kind)

    args.out.write_text("\n".join(lines_out) + ("\n" if lines_out else ""), encoding="utf-8")
    logger.info("wrote %d lines -> %s", len(lines_out), args.out)


if __name__ == "__main__":
    main()
