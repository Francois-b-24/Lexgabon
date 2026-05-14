# Backend agent juridique (FastAPI)

Service conforme au cahier des charges : `POST /api/chat`, `POST /api/chat/stream`, `POST /api/session/clear`, `POST /api/upload-pdf`.

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

Sur **Render** ou toute instance avec **peu de RAM**, laisser `WARM_RAG_ON_STARTUP` désactivé (défaut) : un préchauffage Chroma au démarrage peut monopoliser CPU/RAM et faire **timeout** sur `GET /health` depuis les proxies (Vercel).

## Ingestion Chroma (JSONL)

Script : `scripts/ingest_chroma.py`. Chaque ligne du fichier JSONL est un JSON avec au minimum `"text"` ; `"citation"` ou `"titre"` est recommandé ; `"id"` optionnel (sinon `ingest-<ligne>`). Métadonnées optionnelles recopiées vers Chroma si présentes : `reference`, `numero_article`, `slug`, `url`, `titre`, `source` (scalaires uniquement). Si le JSON contient **`fetch_source_id`**, les anciens chunks portant cette valeur sont **supprimés** avant réinsertion (réingestion idempotente du fichier `scraped_chunks.jsonl`).

**Jeu de données initial (RAG)** : `scripts/build_rag_seed_jsonl.py` régénère `data/rag_seed.jsonl` (veille institutionnelle alignée sur `lib/veille/official-feed.ts`, fiche démo code électoral, fiche indicative droit du travail Gabon). Pour tout faire en une commande (rebuild JSONL + ingestion) :

```bash
cd backend
export PYTHONPATH=.
python3 scripts/ingest_rag_seed.py
```

Ingestion d’un fichier JSONL arbitraire :

```bash
cd backend
export PYTHONPATH=.
python3 scripts/ingest_chroma.py --jsonl ./chemin/vers/fichier.jsonl
```

## Corpus (PDF + sites officiels)

- Dossier **[`corpus/pdfs/`](corpus/pdfs/)** : y déposer les PDF à indexer dans **`droit_gabonais`** (voir [`corpus/README.md`](corpus/README.md)). Par défaut les `*.pdf` ne sont pas versionnés (`corpus/pdfs/.gitignore`).
- Fichier **[`corpus/sources.yaml`](corpus/sources.yaml)** : allowlist de domaines + URLs (`kind: html` ou `pdf`) pour `scripts/fetch_official_sources.py` → `data/scraped_chunks.jsonl` (fichier régénéré, ignoré par Git). Une nouvelle ingestion du JSONL généré **remplace** les chunks précédents ayant le même `fetch_source_id`.

**Pipeline complet** (seed veille + fetch YAML + ingestion JSONL + PDF dossier) :

```bash
cd backend
export PYTHONPATH=.
python3 scripts/ingest_corpus.py
```

Options : `--skip-seed`, `--skip-fetch`, `--skip-pdfs`, **`--verify`** (lance la vérification ci-dessous à la fin).

Même **`CHROMA_PATH`** et **`CHROMA_EMBEDDING_MODEL`** que l’API (`.env`). Sur **Render** / volume persistant : exécuter ce script **une fois** (ou job manuel) après déploiement, sur l’instance qui monte le disque Chroma.

### Vérifier l’indexation

Après une ingestion (ou à tout moment sur la même machine que l’API / le même `CHROMA_PATH`) :

```bash
cd backend
export PYTHONPATH=.
python3 scripts/verify_chroma_index.py
```

Le script contrôle que la collection **`droit_gabonais`** contient au moins un document (par défaut) et qu’une **requête vectorielle** (`search_main`) renvoie des résultats. Options : `--min-chunks N`, `--query "…"`, `-q`. Code de sortie **0** si OK, **1** si collection vide ou recherche vide, **2** si la collection est introuvable.

## Variables principales

- **`USE_FULL_AGENT_CHAT`** : `false` par défaut — chemin **rapide** (une passe RAG + un appel LLM, sans boucle outils). Mettre `true` pour le **mode CDC complet** (plus lent).
- Voir `src/config.py` et la racine `.env.example` (`LEGAL_AGENT_API_BASE_URL` côté Next). Côté backend utiles : `CHROMA_PATH`, `CHROMA_COLLECTION`, `CHROMA_UPLOADS_COLLECTION`, `CHROMA_EMBEDDING_MODEL`, `USE_HYBRID_RAG` (par défaut **true** : re-fetch élargi + léger re-score lexical), `USE_RERANK`, `RAG_STRUCTURED_CITATIONS`, `MAX_UPLOAD_PDF_BYTES`.

Parité CDC / noms de variables : [`../docs/chatbot-env-parity.md`](../docs/chatbot-env-parity.md). Checklist Render : [`../docs/chatbot-render-production.md`](../docs/chatbot-render-production.md). RAG externe (cible) : [`../docs/chat-rag-external.md`](../docs/chat-rag-external.md).
