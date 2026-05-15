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
    if not path.is_file():
        print(f"ingested_chunks=0 (fichier absent: {path})", file=sys.stderr)
        return

    raw_lines: list[dict] = []
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                raw_lines.append(json.loads(line))
            except json.JSONDecodeError as e:
                print(f"skip invalid json: {e}", file=sys.stderr)

    fetch_ids = {str(o["fetch_source_id"]) for o in raw_lines if o.get("fetch_source_id") is not None}
    for fid in sorted(fetch_ids):
        try:
            col.delete(where={"fetch_source_id": fid})
        except Exception as e:
            print(f"warn delete fetch_source_id={fid}: {e}", file=sys.stderr)

    ids: list[str] = []
    docs: list[str] = []
    metas: list[dict] = []
    n = 0
    for i, obj in enumerate(raw_lines):
        text = (obj.get("text") or "").strip()
        if not text:
            continue
        cit = str(obj.get("citation") or obj.get("titre") or f"doc-{i}")
        meta: dict[str, str | int | float | bool] = {"citation": cit}
        fid = obj.get("fetch_source_id")
        if fid is not None:
            meta["fetch_source_id"] = str(fid)
        # Métadonnées optionnelles (types scalaires acceptés par Chroma)
        for key in (
            "reference", "numero_article", "titre_section", "slug", "url",
            "titre", "source", "code", "autorite", "date",
        ):
            if key not in obj or obj[key] is None:
                continue
            val = obj[key]
            if isinstance(val, bool):
                meta[key] = val
            elif isinstance(val, int | float) and not isinstance(val, bool):
                meta[key] = val
            elif isinstance(val, str):
                lim = 4000 if key == "url" else 2000
                sval = val.strip()
                if sval:
                    meta[key] = sval[:lim]
        ids.append(str(obj.get("id") or f"ingest-{i}"))
        docs.append(text)
        metas.append(meta)
        n += 1
        if len(ids) >= args.batch:
            col.add(ids=ids, documents=docs, metadatas=metas)
            ids, docs, metas = [], [], []
    if ids:
        col.add(ids=ids, documents=docs, metadatas=metas)
    print(f"ingested_chunks={n} collection={s.chroma_collection}")


if __name__ == "__main__":
    main()
