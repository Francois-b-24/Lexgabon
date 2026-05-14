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

Script : `scripts/ingest_chroma.py`. Chaque ligne du fichier JSONL est un JSON avec au minimum `"text"` ; `"citation"` ou `"titre"` est recommandé ; `"id"` optionnel (sinon `ingest-<ligne>`).

```bash
cd backend
export PYTHONPATH=.
python scripts/ingest_chroma.py --jsonl ./chemin/vers/fichier.jsonl
```

## Variables principales

- **`USE_FULL_AGENT_CHAT`** : `false` par défaut — chemin **rapide** (une passe RAG + un appel LLM, sans boucle outils). Mettre `true` pour le **mode CDC complet** (plus lent).
- Voir `src/config.py` et la racine `.env.example` (`LEGAL_AGENT_API_BASE_URL` côté Next). Côté backend utiles : `CHROMA_PATH`, `CHROMA_COLLECTION`, `CHROMA_UPLOADS_COLLECTION`, `CHROMA_EMBEDDING_MODEL`, `USE_HYBRID_RAG`, `USE_RERANK`, `RAG_STRUCTURED_CITATIONS`, `MAX_UPLOAD_PDF_BYTES`.

Parité CDC / noms de variables : [`../docs/chatbot-env-parity.md`](../docs/chatbot-env-parity.md). Checklist Render : [`../docs/chatbot-render-production.md`](../docs/chatbot-render-production.md). RAG externe (cible) : [`../docs/chat-rag-external.md`](../docs/chat-rag-external.md).
