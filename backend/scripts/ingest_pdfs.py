#!/usr/bin/env python3
"""Ingère les PDF de corpus/pdfs/ dans Chroma (collection principale) en mode article-aware.

Pipeline par fichier :
  1. Lecture bytes ; hash SHA256 pour dédupliquer même si le fichier est renommé.
  2. Lecture des métadonnées dans corpus/pdfs/manifest.yaml (clé = nom de fichier).
  3. Extraction pypdf + reconstitution du flux texte + split par « Article N ».
  4. Chunks ≤ 1500 caractères, citation reconstruite « Code du travail — Article 12 ».
  5. Suppression idempotente des anciens chunks de la même source (source_key).

Usage : cd backend && PYTHONPATH=. python3 scripts/ingest_pdfs.py
"""
from __future__ import annotations

import argparse
import hashlib
import logging
import sys
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import chromadb  # noqa: E402
import json  # noqa: E402
from chromadb.utils import embedding_functions  # noqa: E402

from src.config import get_settings  # noqa: E402
from src.rag.pdf_parser import chunks_from_pdf, parse_pdf_articles  # noqa: E402

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")


def _file_hash(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(65536), b""):
            h.update(block)
    return h.hexdigest()


def _source_key(rel_posix: str) -> str:
    return hashlib.sha256(rel_posix.encode("utf-8")).hexdigest()[:32]


def _load_manifest(base: Path) -> dict[str, dict[str, Any]]:
    path = base / "manifest.yaml"
    if not path.is_file():
        return {}
    raw = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    files = raw.get("files") if isinstance(raw, dict) else None
    if not isinstance(files, dict):
        return {}
    return {str(k): (v if isinstance(v, dict) else {}) for k, v in files.items()}


def _citation_for(meta: dict[str, Any], numero: str | None, default_label: str) -> str:
    code = (meta.get("code") or meta.get("titre") or default_label).strip()
    ref = (meta.get("reference") or "").strip()
    if numero:
        base = f"{code} — Article {numero}"
    else:
        base = code
    if ref and ref not in base:
        base = f"{base} ({ref})"
    return base


def _meta_payload(file_meta: dict[str, Any], chunk_meta: dict[str, Any], *, source_key: str, source_filename: str) -> dict[str, Any]:
    out: dict[str, Any] = {
        "source_key": source_key,
        "source_filename": source_filename,
        "kind": "corpus_pdf",
    }
    for key in ("titre", "code", "autorite", "date", "reference", "source"):
        v = file_meta.get(key)
        if isinstance(v, str) and v.strip():
            out[key] = v.strip()[:500]
    num = chunk_meta.get("numero_article")
    if isinstance(num, str) and num.strip():
        out["numero_article"] = num.strip()[:32]
    section = chunk_meta.get("titre_section")
    if isinstance(section, str) and section.strip():
        out["titre_section"] = section.strip()[:240]
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingère les PDF du corpus dans Chroma (article-aware).")
    parser.add_argument("--dir", type=Path, default=ROOT / "corpus" / "pdfs", help="Dossier racine des PDF (récursif)")
    parser.add_argument("--max-chars", type=int, default=1500, help="Taille max d'un chunk avant subdivision")
    parser.add_argument("--skip-duplicates", action="store_true", help="Sauter les PDFs marqués duplicate_of dans le manifest")
    parser.add_argument(
        "--articles-jsonl",
        type=Path,
        default=ROOT / "data" / "articles_ingest.jsonl",
        help="Fichier JSONL produit en parallèle pour peupler la table SQL `articles` (consommé par scripts/ingest-articles.ts)",
    )
    args = parser.parse_args()

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

    manifest = _load_manifest(base)
    pdfs = sorted(base.rglob("*.pdf"))
    if not pdfs:
        logger.info("aucun PDF sous %s", base)
        return

    seen_hashes: dict[str, str] = {}  # sha256 -> premier relpath rencontré
    total_chunks = 0
    skipped = 0
    article_rows: list[dict[str, Any]] = []

    for pdf_path in pdfs:
        rel = pdf_path.relative_to(base).as_posix()
        file_meta = manifest.get(rel, {}) or manifest.get(pdf_path.name, {}) or {}

        if args.skip_duplicates and file_meta.get("duplicate_of"):
            logger.info("skip duplicate_of=%s : %s", file_meta["duplicate_of"], rel)
            skipped += 1
            continue

        digest = _file_hash(pdf_path)
        if digest in seen_hashes:
            logger.info("skip doublon binaire (sha256 identique à %s) : %s", seen_hashes[digest], rel)
            skipped += 1
            continue
        seen_hashes[digest] = rel

        try:
            data = pdf_path.read_bytes()
        except OSError as e:
            logger.warning("lecture impossible %s: %s", pdf_path, e)
            continue

        try:
            chunks = chunks_from_pdf(data, max_chars=args.max_chars)
        except Exception as e:
            logger.warning("parsing PDF échoué %s: %s", rel, e)
            continue

        if not chunks:
            logger.warning("pas de texte exploitable: %s", rel)
            continue

        skey = _source_key(rel)
        try:
            col.delete(where={"source_key": skey})
        except Exception as e:
            logger.warning("delete Chroma (source_key=%s): %s", skey, e)

        default_label = file_meta.get("code") or file_meta.get("titre") or pdf_path.stem
        ids: list[str] = []
        docs: list[str] = []
        metas: list[dict[str, Any]] = []
        for i, ch in enumerate(chunks):
            citation = _citation_for(file_meta, ch.numero_article, str(default_label))
            meta = _meta_payload(
                file_meta,
                {"numero_article": ch.numero_article, "titre_section": ch.titre_section},
                source_key=skey,
                source_filename=pdf_path.name,
            )
            meta["citation"] = citation
            meta["sha256"] = digest[:16]
            ids.append(f"corpus-pdf:{skey}:{i}")
            docs.append(ch.text)
            metas.append(meta)

        col.add(ids=ids, documents=docs, metadatas=metas)
        articles = len({m["numero_article"] for m in metas if m.get("numero_article")})
        total_chunks += len(chunks)
        logger.info("ingéré %s : %d chunks · %d articles distincts", rel, len(chunks), articles)

        # Génération du JSONL d'articles entiers pour la table SQL `articles`.
        # On re-parse via parse_pdf_articles pour obtenir un ArticleSegment par article complet,
        # indépendamment du sous-chunking utilisé pour le RAG.
        try:
            article_segments = parse_pdf_articles(data)
        except Exception as e:
            logger.warning("parse_pdf_articles échoué pour %s: %s", rel, e)
            article_segments = []
        for position, seg in enumerate(article_segments):
            article_rows.append(
                {
                    "texte_slug": file_meta.get("slug") or pdf_path.stem,
                    "source_code": file_meta.get("source_code"),
                    "source_filename": pdf_path.name,
                    "source_key": skey,
                    "type": file_meta.get("type") or "loi",
                    "code": file_meta.get("code"),
                    "reference": file_meta.get("reference"),
                    "titre_texte": file_meta.get("titre"),
                    "autorite": file_meta.get("autorite"),
                    "date_publication": file_meta.get("date"),
                    "url_source": file_meta.get("source"),
                    "numero": seg.numero,
                    "contenu": seg.text,
                    "position": position,
                    "titre_section": seg.titre_section,
                }
            )

    # Écrit le JSONL d'articles (vide si rien) ; le consommateur Node fera l'upsert SQL.
    if article_rows or args.articles_jsonl.exists():
        args.articles_jsonl.parent.mkdir(parents=True, exist_ok=True)
        with args.articles_jsonl.open("w", encoding="utf-8") as f:
            for row in article_rows:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")
        logger.info("articles JSONL écrit : %d lignes → %s", len(article_rows), args.articles_jsonl)

    logger.info(
        "TOTAL : chunks=%d · articles=%d · fichiers=%d (skipped=%d) · collection=%s",
        total_chunks, len(article_rows), len(seen_hashes), skipped, s.chroma_collection,
    )


if __name__ == "__main__":
    main()
