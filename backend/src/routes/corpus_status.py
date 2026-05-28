"""Route /api/corpus/status — état du corpus indexé (D6).

Lit Chroma + corpus/pdfs/manifest.yaml + corpus/sources.yaml et retourne :
- total_chunks : nombre total de chunks dans la collection principale.
- articles_distincts : nombre de numéros d'articles uniques (informatif).
- sources : liste des sources suivies avec leur statut (indexed | partial | monitored).
- last_updated : date ISO de dernière modification du dossier Chroma (proxy de la
  dernière ingestion).

Consommé par la page /methodologie côté Next pour afficher des stats vraies
plutôt qu'une date en dur.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from src.config import get_settings

logger = logging.getLogger(__name__)

router = APIRouter()

# Racine backend = parents[2] depuis ce fichier (routes/corpus_status.py → src → backend)
BACKEND_ROOT = Path(__file__).resolve().parents[2]
PDFS_MANIFEST = BACKEND_ROOT / "corpus" / "pdfs" / "manifest.yaml"
SOURCES_YAML = BACKEND_ROOT / "corpus" / "sources.yaml"


class SourceStatus(BaseModel):
    code: str  # source_code (JOG, OHADA, ...) ou identifiant URL
    label: str
    portal_url: str | None = None
    status: str  # "indexed" | "partial" | "monitored"
    texts: list[str] = Field(default_factory=list)


class CorpusStatusResponse(BaseModel):
    total_chunks: int
    articles_distincts: int
    sources: list[SourceStatus]
    last_updated: str | None  # ISO 8601 ou null si Chroma inexistant


def _read_yaml(path: Path) -> dict[str, Any]:
    if not path.is_file():
        return {}
    try:
        return yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except Exception as e:
        logger.warning("yaml read failed for %s: %s", path, e)
        return {}


def _chroma_stats() -> tuple[int, int, str | None]:
    """Compte les chunks et les articles distincts dans Chroma. Retourne aussi
    la date de modif du dossier comme proxy de la dernière ingestion."""
    s = get_settings()
    chroma_path = Path(s.chroma_path)
    if not chroma_path.exists():
        return 0, 0, None

    # Date de dernière modif du dossier (proxy ingestion).
    mtime = chroma_path.stat().st_mtime
    last_updated_iso = datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat()

    try:
        import chromadb

        from src.rag.embedding import make_embedding_function

        ef = make_embedding_function(s.chroma_embedding_model)
        client = chromadb.PersistentClient(path=s.chroma_path)
        col = client.get_or_create_collection(
            name=s.chroma_collection,
            embedding_function=ef,
            metadata={"hnsw:space": "cosine"},
        )
        total = col.count()
        if total == 0:
            return 0, 0, last_updated_iso

        # Articles distincts (numero_article) : on parcourt par lots de 500.
        articles: set[str] = set()
        offset = 0
        BATCH = 500
        while offset < total:
            page = col.get(limit=BATCH, offset=offset, include=["metadatas"])
            for m in page.get("metadatas") or []:
                if not m:
                    continue
                num = m.get("numero_article")
                src = m.get("source_code") or m.get("titre") or ""
                if isinstance(num, str | int | float) and str(num).strip():
                    articles.add(f"{src}:{str(num).strip()}")
            offset += BATCH

        return total, len(articles), last_updated_iso
    except Exception as e:
        logger.warning("chroma stats failed: %s", e)
        return 0, 0, last_updated_iso


def _sources_summary() -> list[SourceStatus]:
    """Construit la liste des sources suivies depuis manifest.yaml + sources.yaml."""
    manifest = _read_yaml(PDFS_MANIFEST)
    sources_cfg = _read_yaml(SOURCES_YAML)
    files = manifest.get("files") or {}

    # Regroupe par source_code.
    by_code: dict[str, dict[str, Any]] = {}

    # 1. Sources qui ont au moins un PDF dans le manifest = indexed ou partial.
    for filename, meta in files.items():
        if not isinstance(meta, dict):
            continue
        if meta.get("duplicate_of"):
            continue  # ignore les doublons
        code = (meta.get("source_code") or "JOG").upper()
        info = by_code.setdefault(code, {"code": code, "texts": [], "status": "indexed"})
        titre = meta.get("titre") or filename
        ref = meta.get("reference")
        label = f"{titre} ({ref})" if ref else titre
        info["texts"].append(label)

    # 2. Sources listées dans sources.yaml mais sans PDF correspondant = monitored.
    for src in (sources_cfg.get("sources") or []):
        if not isinstance(src, dict):
            continue
        code = (src.get("source_code") or "").upper()
        if not code:
            # Fallback : devine depuis l'URL.
            url = (src.get("url") or "").lower()
            if "journal-officiel.ga" in url:
                code = "JOG"
            elif "ohada.org" in url:
                code = "OHADA"
            elif "beac.int" in url or "cobac" in url:
                code = "COBAC"
            elif "cemac.int" in url:
                code = "CEMAC"
            elif "cima-afrique.org" in url:
                code = "CIMA"
            else:
                continue
        info = by_code.setdefault(code, {"code": code, "texts": [], "status": "monitored"})
        label = src.get("label") or src.get("id") or src.get("url", "?")
        if label not in info["texts"]:
            info["texts"].append(label)
        # Si la source a déjà un PDF dans le manifest, le statut reste "indexed".
        # Sinon, on bascule en "partial" si des URLs sont déclarées en plus.
        if info["status"] == "indexed":
            info["status"] = "partial"

    # 3. Métadonnées d'affichage par code (portal_url + label long).
    DISPLAY = {
        "JOG": ("Journal officiel de la République gabonaise", "https://journal-officiel.ga/"),
        "OHADA": ("Organisation pour l'Harmonisation en Afrique du Droit des Affaires", "https://www.ohada.org/"),
        "CEMAC": ("Communauté Économique et Monétaire de l'Afrique Centrale", "https://cemac.int/"),
        "COBAC": ("Commission Bancaire de l'Afrique Centrale", "https://www.beac.int/supervision-bancaire/reglements-de-cobac"),
        "CIMA": ("Conférence Interafricaine des Marchés d'Assurances", "https://cima-afrique.org/"),
    }

    out: list[SourceStatus] = []
    # On parcourt dans l'ordre DISPLAY pour la stabilité d'affichage.
    for code, (label, portal) in DISPLAY.items():
        info = by_code.get(code)
        if not info:
            # Aucune référence en config — on déclare la source comme monitored vide.
            out.append(
                SourceStatus(code=code, label=label, portal_url=portal, status="monitored", texts=[])
            )
            continue
        out.append(
            SourceStatus(
                code=code,
                label=label,
                portal_url=portal,
                status=info["status"],
                texts=info["texts"][:5],
            )
        )
    return out


@router.get("/api/corpus/status")
def corpus_status():
    try:
        total, articles, last_updated = _chroma_stats()
        sources = _sources_summary()
        return CorpusStatusResponse(
            total_chunks=total,
            articles_distincts=articles,
            sources=sources,
            last_updated=last_updated,
        )
    except Exception as e:
        logger.exception("corpus_status failed")
        return JSONResponse(
            {"detail": str(e), "total_chunks": 0, "articles_distincts": 0, "sources": [], "last_updated": None},
            status_code=200,
        )
