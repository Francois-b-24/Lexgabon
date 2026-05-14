# LexGabon

Application [Next.js](https://nextjs.org) (App Router, `next-intl`) pour la plateforme juridique LexGabon — landing, veille, recherche, textes, et assistant **Ama’IA** (`/chatbot`) : proxy Next vers un **backend FastAPI** (agent juridique, Chroma, Anthropic), conforme au cahier des charges fonctionnel.

## Démarrage local

```bash
npm install
cp .env.example .env.local   # LEGAL_AGENT_API_BASE_URL=http://127.0.0.1:8000 si le backend tourne en local
# Terminal 2 : démarrer le backend (Docker ou uvicorn) — voir backend/README.md
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) : la locale par défaut est gérée par le middleware (`/fr`, `/en`).

## Qualité

```bash
npm run lint
npm run build
```

## Déploiement et variables

| Document | Contenu |
|----------|---------|
| [`.env.example`](.env.example) | Liste des variables d’environnement |
| [`docs/deployment-vercel.md`](docs/deployment-vercel.md) | **GitHub**, Vercel, domaine, cron, checklist prod |
| [`docs/supabase-production.md`](docs/supabase-production.md) | Supabase (URLs, redirections) |
| [`docs/chatbot-smoke-test.md`](docs/chatbot-smoke-test.md) | Tests proxy `/api/chat` + page `/chatbot` |
| [`docs/chatbot-env-parity.md`](docs/chatbot-env-parity.md) | Variables CDC ↔ LexGabon (backend, embeddings) |

## Licence

Projet privé (`private: true` dans `package.json`).
