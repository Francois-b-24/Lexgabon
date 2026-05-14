# LexGabon

Application [Next.js](https://nextjs.org) (App Router, `next-intl`) pour la plateforme juridique LexGabon — landing, veille, recherche, textes, et assistant **Ama’IA** (droit gabonais, contexte indexé + fetch sur liste blanche d’institutions).

## Démarrage local

```bash
npm install
cp .env.example .env.local   # puis renseigner les variables
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
| [`docs/amaia-smoke-test.md`](docs/amaia-smoke-test.md) | Tests manuels `/api/amaia` |

## Licence

Projet privé (`private: true` dans `package.json`).
