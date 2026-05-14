#!/usr/bin/env python3
"""Vérifie que la collection Chroma principale est peuplée et que les requêtes vectorielles répondent.

Usage :
  cd backend && export PYTHONPATH=. && python3 scripts/verify_chroma_index.py [--min-chunks 1] [--query "..."]
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import chromadb  # noqa: E402
from chromadb.utils import embedding_functions  # noqa: E402

from src.config import get_settings  # noqa: E402
from src.rag.retriever import search_main  # noqa: E402


def main() -> None:
    p = argparse.ArgumentParser(description="Contrôle rapide index Chroma (droit_gabonais).")
    p.add_argument("--min-chunks", type=int, default=1, help="Nombre minimum de documents attendus")
    p.add_argument(
        "--query",
        default="droit du travail Gabon",
        help="Requête de test pour search_main (doit retourner au moins un résultat)",
    )
    p.add_argument("-q", "--quiet", action="store_true", help="Moins de sortie")
    args = p.parse_args()

    s = get_settings()
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=s.chroma_embedding_model)
    client = chromadb.PersistentClient(path=s.chroma_path)

    try:
        col = client.get_collection(name=s.chroma_collection, embedding_function=ef)
        n = col.count()
    except Exception as e:
        print(f"FAIL: collection {s.chroma_collection!r} inaccessible: {e}", file=sys.stderr)
        sys.exit(2)

    if not args.quiet:
        print(f"chroma_path={s.chroma_path!r} collection={s.chroma_collection!r} count={n}")

    if n < args.min_chunks:
        print(
            f"FAIL: count={n} < min_chunks={args.min_chunks}",
            file=sys.stderr,
        )
        sys.exit(1)

    rows = search_main(args.query, k=5)
    if not rows:
        print(
            f"FAIL: recherche vide pour query={args.query!r} (index ou embeddings défaillants ?)",
            file=sys.stderr,
        )
        sys.exit(1)

    if not args.quiet:
        for i, r in enumerate(rows[:3], 1):
            cit = (r.get("citation") or "")[:120]
            sc = r.get("score", 0)
            print(f"  hit{i}: score={sc:.3f} citation={cit!r}")

    print("OK: indexation et requête vectorielle fonctionnelles.")
    sys.exit(0)


if __name__ == "__main__":
    main()
