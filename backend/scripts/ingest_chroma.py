#!/usr/bin/env python3
"""Ingestion minimale JSONL → collection Chroma principale (voir backend/README.md)."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Racine backend sur PYTHONPATH
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import chromadb  # noqa: E402
from chromadb.utils import embedding_functions  # noqa: E402

from src.config import get_settings  # noqa: E402


def main() -> None:
    p = argparse.ArgumentParser(description="Ingère des lignes JSONL dans Chroma (collection principale).")
    p.add_argument("--jsonl", required=True, help="Fichier JSONL : chaque ligne = objet JSON avec clés text, citation (optionnel).")
    p.add_argument("--batch", type=int, default=64, help="Taille de lot pour collection.add")
    args = p.parse_args()
    s = get_settings()
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=s.chroma_embedding_model)
    client = chromadb.PersistentClient(path=s.chroma_path)
    col = client.get_or_create_collection(
        name=s.chroma_collection,
        embedding_function=ef,
        metadata={"hnsw:space": "cosine"},
    )
    path = Path(args.jsonl)
    ids: list[str] = []
    docs: list[str] = []
    metas: list[dict] = []
    n = 0
    with path.open(encoding="utf-8") as f:
        for i, line in enumerate(f):
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            text = (obj.get("text") or "").strip()
            if not text:
                continue
            cit = str(obj.get("citation") or obj.get("titre") or f"doc-{i}")
            ids.append(str(obj.get("id") or f"ingest-{i}"))
            docs.append(text)
            metas.append({"citation": cit})
            n += 1
            if len(ids) >= args.batch:
                col.add(ids=ids, documents=docs, metadatas=metas)
                ids, docs, metas = [], [], []
    if ids:
        col.add(ids=ids, documents=docs, metadatas=metas)
    print(f"ingested_chunks={n} collection={s.chroma_collection}")


if __name__ == "__main__":
    main()
