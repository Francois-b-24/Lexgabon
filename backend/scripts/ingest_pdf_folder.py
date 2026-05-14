#!/usr/bin/env python3
"""Ingère les PDF d’un dossier dans la collection Chroma principale (droit_gabonais).

Supprime les anciens chunks du même fichier (clé stable par chemin relatif) puis réinsère.

Usage :
  cd backend && export PYTHONPATH=. && python3 scripts/ingest_pdf_folder.py [--dir corpus/pdfs]
"""
from __future__ import annotations

import argparse
import hashlib
import logging
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import chromadb  # noqa: E402
from chromadb.utils import embedding_functions  # noqa: E402

from src.config import get_settings  # noqa: E402
from src.rag.chunking import chunk_text, extract_pdf_text  # noqa: E402

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")


def _source_key(rel_posix: str) -> str:
    return hashlib.sha256(rel_posix.encode("utf-8")).hexdigest()[:32]


def main() -> None:
    p = argparse.ArgumentParser(description="Ingère les PDF du dossier corpus vers Chroma (collection principale).")
    p.add_argument(
        "--dir",
        type=Path,
        default=ROOT / "corpus" / "pdfs",
        help="Dossier racine des PDF (récursif)",
    )
    args = p.parse_args()
    base: Path = args.dir.resolve()
    if not base.is_dir():
        logger.error("dossier introuvable: %s", base)
        sys.exit(1)

    s = get_settings()
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=s.chroma_embedding_model)
    client = chromadb.PersistentClient(path=s.chroma_path)
    col = client.get_or_create_collection(
        name=s.chroma_collection,
        embedding_function=ef,
        metadata={"hnsw:space": "cosine"},
    )

    pdfs = sorted(base.rglob("*.pdf"))
    if not pdfs:
        logger.info("aucun PDF sous %s", base)
        return

    total_chunks = 0
    for pdf_path in pdfs:
        rel = pdf_path.relative_to(base).as_posix()
        skey = _source_key(rel)
        try:
            data = pdf_path.read_bytes()
        except OSError as e:
            logger.warning("lecture impossible %s: %s", pdf_path, e)
            continue
        text = extract_pdf_text(data)
        chunks = chunk_text(text)
        if not chunks:
            logger.warning("pas de texte exploitable: %s", rel)
            continue
        try:
            col.delete(where={"source_key": skey})
        except Exception as e:
            logger.warning("delete chroma (source_key=%s): %s", skey, e)

        ids = [f"corpus-pdf:{skey}:{i}" for i in range(len(chunks))]
        citation = f"PDF — {rel}"
        metas = [
            {
                "source_key": skey,
                "source_filename": pdf_path.name,
                "source_relpath": rel,
                "citation": citation,
                "kind": "corpus_pdf",
            }
            for _ in chunks
        ]
        col.add(ids=ids, documents=chunks, metadatas=metas)
        total_chunks += len(chunks)
        logger.info("ingéré %s (%s chunks)", rel, len(chunks))

    logger.info("total_chunks=%s collection=%s", total_chunks, s.chroma_collection)


if __name__ == "__main__":
    main()
