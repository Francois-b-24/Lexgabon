# RAG « externe » (cible moyen terme)

Aujourd'hui, le moteur unique (`chat_engine.run_chat`) interroge **Chroma + embeddings** dans le **même processus** que FastAPI. Pour réduire encore la latence et la charge RAM par requête, la cible suivante est :

## Principe

1. **Ingestion** (hors requête utilisateur) : indexer les textes dans un moteur de recherche ou une base vectorielle managée (embeddings calculés en batch ou sur un worker dédié).
2. **Requête chat** : une seule requête HTTP vers ce service (ex. **Meilisearch** déjà utilisé côté app Next pour `/api/search`) pour récupérer les extraits pertinents, puis **un** appel Anthropic avec ces extraits dans le prompt.

## Variables envisageables (backend)

À terme, le backend pourrait lire par exemple :

- `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`, `MEILISEARCH_INDEX` — recherche plein texte + filtres, sans charger `sentence-transformers` par question.
- Ou un endpoint **vectoriel managé** (Pinecone, Qdrant Cloud, etc.) avec clé API.

## État actuel du dépôt

- Le **chemin par défaut** implémenté utilise toujours **Chroma** local (`retriever.search`), mais avec **une seule** passe RAG + **un** appel LLM (`SYSTEM_PROMPT_FAST`), ce qui réduit fortement le wall-clock par rapport à la boucle agent complète.
- La migration vers Meilisearch / service externe reste un **chantier** : duplication des métadonnées de citation, alignement avec l’ingestion existante (`scripts/ingest_chroma.py`), et tests de qualité RAG.
