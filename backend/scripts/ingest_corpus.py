#!/usr/bin/env python3
"""Orchestre la construction du corpus RAG : seed JSONL, fetch YAML, ingestion Chroma, PDF dossier.

Usage :
  cd backend && export PYTHONPATH=. && python3 scripts/ingest_corpus.py [--skip-seed] [--skip-fetch] [--skip-pdfs] [--verify]
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _run(py: str, argv: list[str]) -> None:
    env = {**os.environ, "PYTHONPATH": str(ROOT)}
    r = subprocess.run([py, *argv], cwd=str(ROOT), env=env, check=False)
    if r.returncode != 0:
        sys.exit(r.returncode)


def main() -> None:
    p = argparse.ArgumentParser(description="Ingestion corpus complète (seed + fetch + Chroma + PDF).")
    p.add_argument("--skip-seed", action="store_true", help="Ne pas régénérer data/rag_seed.jsonl")
    p.add_argument("--skip-fetch", action="store_true", help="Ne pas exécuter fetch_official_sources.py")
    p.add_argument("--skip-pdfs", action="store_true", help="Ne pas ingérer corpus/pdfs")
    p.add_argument(
        "--verify",
        action="store_true",
        help="Après ingestion, exécuter scripts/verify_chroma_index.py (compte + requête test)",
    )
    p.add_argument("--python", default=sys.executable, help="Interpréteur Python")
    args = p.parse_args()
    py = args.python

    if not args.skip_seed:
        _run(py, [str(ROOT / "scripts" / "build_rag_seed_jsonl.py")])
    if not args.skip_fetch:
        _run(py, [str(ROOT / "scripts" / "fetch_official_sources.py")])

    _run(py, [str(ROOT / "scripts" / "ingest_chroma.py"), "--jsonl", str(ROOT / "data" / "rag_seed.jsonl")])

    scraped = ROOT / "data" / "scraped_chunks.jsonl"
    if scraped.is_file():
        _run(py, [str(ROOT / "scripts" / "ingest_chroma.py"), "--jsonl", str(scraped)])
    else:
        print("(skip) pas de fichier", scraped, file=sys.stderr)

    if not args.skip_pdfs:
        _run(py, [str(ROOT / "scripts" / "ingest_pdf_folder.py")])

    if args.verify:
        _run(py, [str(ROOT / "scripts" / "verify_chroma_index.py")])


if __name__ == "__main__":
    main()
