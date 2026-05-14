#!/usr/bin/env python3
"""Télécharge des pages / PDF listés dans corpus/sources.yaml (allowlist) et produit un JSONL pour ingest_chroma.

Usage :
  cd backend && export PYTHONPATH=. && python3 scripts/fetch_official_sources.py
"""
from __future__ import annotations

import argparse
import json
import logging
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

import httpx
import trafilatura
import yaml

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.rag.chunking import chunk_text, extract_pdf_text  # noqa: E402

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


def main() -> None:
    p = argparse.ArgumentParser(description="Fetch allowlist YAML → JSONL pour Chroma.")
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

            text_full = ""
            if kind == "pdf":
                text_full = extract_pdf_text(body)
            else:
                try:
                    html = body.decode(r.encoding or "utf-8", errors="replace")
                    text_full = trafilatura.extract(html, url=url) or ""
                except Exception as e:
                    logger.error("[%s] extraction HTML: %s", sid, e)
                    continue

            text_full = (text_full or "").strip()
            if not text_full:
                logger.warning("[%s] aucun texte extrait: %s", sid, url)
                continue

            chunks = chunk_text(text_full)
            for i, chunk in enumerate(chunks):
                citation = f"{label} — {url}"
                lines_out.append(
                    json.dumps(
                        {
                            "id": f"fetch:{sid}:{i}",
                            "citation": citation,
                            "text": chunk,
                            "fetch_source_id": sid,
                            "url": url,
                            "titre": label,
                        },
                        ensure_ascii=False,
                    )
                )
            logger.info("[%s] %s chunks (%s)", sid, len(chunks), kind)

    args.out.write_text("\n".join(lines_out) + ("\n" if lines_out else ""), encoding="utf-8")
    logger.info("wrote %s lines -> %s", len(lines_out), args.out)


if __name__ == "__main__":
    main()
