# Backend Ama'IA (FastAPI)

Chatbot juridique gabonais : **un seul endpoint `POST /api/chat`** (RAG + un appel Claude), pas de boucle outils, pas d'upload session.

## Développement local

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env   # ou définir les variables
export ANTHROPIC_API_KEY=...
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Avec Docker : `docker compose up backend` depuis la racine du monorepo.

Sur une instance ≥ ~1 Go de RAM : activer `WARM_RAG_ON_STARTUP=true` (Chroma et embeddings préchargés au boot, plus de latence sur la première requête après un cold start). Sur petite instance (< 1 Go), laisser à `false` pour éviter les timeouts `GET /health` depuis les proxies.

## Ingestion du corpus

Tout passe par la collection Chroma principale `droit_gabonais`. Le **chunking est article-aware** : la regex détecte `Article N`, `Art. 12`, `Article 1er`, `Article 12 bis`, `Article 12-1`, etc., et propage `numero_article` + `titre_section` en métadonnées.

### PDFs locaux (priorité corpus juridique sérieux)

Déposer les PDFs dans `corpus/pdfs/`, déclarer leurs métadonnées dans `corpus/pdfs/manifest.yaml` (titre, code, autorité, date, reference, éventuel `duplicate_of`), puis :

```bash
PYTHONPATH=. python3 scripts/ingest_pdfs.py --skip-duplicates
```

- Hash SHA256 par fichier : déduplication même en cas de renommage.
- `--skip-duplicates` saute les PDFs marqués `duplicate_of:` dans le manifest.
- Réingestion idempotente : les anciens chunks du fichier (clé `source_key`) sont supprimés avant réinsertion.

### Scraping officiel (URLs allowlist)

`corpus/sources.yaml` liste les domaines autorisés et les URLs à fetch (`kind: html | pdf`, plus métadonnées `code`, `reference`, `autorite`, `date`). Le script produit un JSONL ingérable :

```bash
PYTHONPATH=. python3 scripts/fetch_official_sources.py
PYTHONPATH=. python3 scripts/ingest_chroma.py --jsonl data/scraped_chunks.jsonl
```

Réingestion idempotente : tout chunk portant le même `fetch_source_id` est remplacé.

### Pipeline complet

```bash
PYTHONPATH=. python3 scripts/ingest_corpus.py [--verify]
```

Lance, dans l'ordre : `build_rag_seed_jsonl.py` → `fetch_official_sources.py` → `ingest_chroma.py` (seed) → `ingest_chroma.py` (scraped) → `ingest_pdfs.py --skip-duplicates`. Avec `--verify` : audit final.

### Audit / vérification

```bash
PYTHONPATH=. python3 scripts/verify_corpus.py
```

Affiche le total de chunks, le pourcentage avec `numero_article`, le top des sources, des alertes (volume trop faible, chunking dégradé). Effectue aussi une requête test pour valider que le retriever renvoie des extraits cohérents.

## Variables principales

- `ANTHROPIC_API_KEY` (obligatoire) — `ANTHROPIC_MODEL` par défaut `claude-sonnet-4-6`, `ANTHROPIC_MODEL_FALLBACK` `claude-haiku-4-5-20251001`.
- `CHROMA_PATH` (défaut `./data/chroma`), `CHROMA_COLLECTION` (`droit_gabonais`), `CHROMA_EMBEDDING_MODEL` (`intfloat/multilingual-e5-small`).
- `USE_HYBRID_RAG` (défaut `true`) : élargit le fetch puis re-score lexical léger.
- `USE_RERANK` (défaut `true`) : tri additionnel par recouvrement lexical sur top-k.
- `RAG_TOP_K` (défaut `12`) ; `RAG_STRUCTURED_CITATIONS` (défaut `false`).
- `FRONTEND_ORIGINS` : origines CORS séparées par virgule.
- `WARM_RAG_ON_STARTUP` : `true` recommandé dès ~1 Go RAM (voir plus haut).

Toutes les variables sont listées dans `src/config.py`. Checklist Render : [`../docs/chatbot-render-production.md`](../docs/chatbot-render-production.md).
