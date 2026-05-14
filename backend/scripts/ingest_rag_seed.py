#!/usr/bin/env python3
"""Régénère data/rag_seed.jsonl puis lance l’ingestion Chroma (un seul outil pour le dev).

Usage :
  cd backend && export PYTHONPATH=. && python scripts/ingest_rag_seed.py
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    build = ROOT / "scripts" / "build_rag_seed_jsonl.py"
    ingest = ROOT / "scripts" / "ingest_chroma.py"
    jsonl = ROOT / "data" / "rag_seed.jsonl"
    r1 = subprocess.run([sys.executable, str(build)], cwd=str(ROOT), check=False)
    if r1.returncode != 0:
        sys.exit(r1.returncode)
    r2 = subprocess.run(
        [sys.executable, str(ingest), "--jsonl", str(jsonl)],
        cwd=str(ROOT),
        check=False,
    )
    sys.exit(r2.returncode)


if __name__ == "__main__":
    main()
