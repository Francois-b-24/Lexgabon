# Parité variables CDC ↔ LexGabon (chatbot)

Le cahier des charges CDC peut mentionner une URL de backend exposée côté front sous un nom générique (parfois `NEXT_PUBLIC_API_BASE_URL` ou équivalent). **Sur LexGabon, l’URL du service FastAPI ne doit pas être exposée au navigateur** : seul le serveur Next.js appelle le backend.

| Contexte CDC (exemples) | LexGabon (Next.js serveur) |
|-------------------------|----------------------------|
| URL publique ou « API base » pointant vers le service Python depuis le front | **Interdit** pour le secret / coûts ; utiliser des routes proxy sous `/api/…` |
| Variable serveur pour le proxy chat | `LEGAL_AGENT_API_BASE_URL` (sans slash final), ex. `https://agent.votredomaine.ga` |
| Appels depuis le navigateur | `POST /api/chat`, `POST /api/session/clear`, `POST /api/upload-pdf`, `GET /api/chat/health` (même origine que le site) |

**Backend FastAPI** : variables décrites dans `backend/README.md` et `backend/src/config.py` (`ANTHROPIC_API_KEY`, `CHROMA_*`, `FRONTEND_ORIGINS`, etc.).

**Embeddings Chroma** : le défaut du code est `intfloat/multilingual-e5-small`. Pour activer **`intfloat/multilingual-e5-base`** (meilleure qualité, plus lourd), définir `CHROMA_EMBEDDING_MODEL` côté backend — **réingestion obligatoire** si vous changez de modèle (dimensions / index différents).

**Flags RAG** : `USE_HYBRID_RAG` et `USE_RERANK` sont à `false` par défaut ; les activer modifie le classement des résultats (hybride léger = re-score lexical sur les candidats vectoriels).
