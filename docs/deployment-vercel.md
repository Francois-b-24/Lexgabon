# Déploiement Vercel (LexGabon)

Référence : [`.env.example`](../.env.example) pour la liste des variables.

## Première publication : GitHub puis Vercel

### Étape 1 — Compte GitHub et dépôt

1. Créez un compte sur [https://github.com](https://github.com) si besoin.
2. **Option A (interface)** : GitHub → **New repository** → nom (ex. `Lexgabon`) → visibilité **Private** ou **Public** → ne cochez pas « Add a README » si le code existe déjà localement.
3. **Option B (CLI)** : installez [GitHub CLI](https://cli.github.com) (`brew install gh`), puis `gh auth login`. Depuis la racine du projet, après le premier commit (étape 2) :  
   `gh repo create VOTRE_ORG/lexgabon --private --source=. --remote=origin --push`  
   (adaptez le nom et `--public` si vous préférez un dépôt public.)

### Étape 2 — Premier commit local

Dans le dossier du projet :

```bash
git status
git add -A
git commit -m "Initial commit: LexGabon Next.js app"
```

Si le dépôt distant a été créé sur GitHub **sans** CLI :

```bash
git remote add origin https://github.com/VOTRE_USER/lexgabon.git
git push -u origin main
```

(Utilisez SSH `git@github.com:...` si vos clés SSH sont configurées.)

### Étape 3 — Projet Vercel

1. Compte sur [https://vercel.com](https://vercel.com) (connexion **Continue with GitHub** recommandée).
2. **Add New…** → **Project** → **Import** le dépôt `lexgabon`.
3. Framework **Next.js** détecté automatiquement ; **Root Directory** : `.` ; **Build Command** : `npm run build` ; **Output** : défaut Next.
4. Avant le premier déploiement, ajoutez les **Environment Variables** (voir checklist ci-dessous), au minimum `NEXT_PUBLIC_SITE_URL` une fois l’URL Vercel connue (ex. `https://lexgabon.vercel.app`), puis **Deploy**.

### Étape 4 — URL publique et domaine

- Après le build, Vercel fournit une URL `*.vercel.app` : testez `/fr` et `/en`.
- Pour un domaine perso : Vercel → **Project** → **Settings** → **Domains** → ajoutez le domaine et suivez les instructions DNS (chez votre registrar). Mettez à jour `NEXT_PUBLIC_SITE_URL` et la config Supabase ([supabase-production.md](./supabase-production.md)).

### Étape 5 — Vérifications post-déploiement

- Page d’accueil et navigation.
- `GET https://VOTRE_URL/api/amaia` → JSON avec `anthropicConfigured` (voir [amaia-smoke-test.md](./amaia-smoke-test.md)).
- Si vous utilisez le cron : variable `CRON_SECRET` définie sur Vercel (voir section Cron ci-dessous).

---

## Checklist avant mise en production

1. **Variables d’environnement** (Vercel → Project → Settings → Environment Variables), pour **Production** (et **Preview** si besoin) :
   - `NEXT_PUBLIC_SITE_URL` : URL canonique du site (sans `/` final).
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` : projet Supabase production.
   - `ANTHROPIC_API_KEY` : obligatoire pour Ama'IA ; `ANTHROPIC_MODEL` si vous ne voulez pas le défaut du code.
   - `DATABASE_URL` : si base Postgres utilisée (textes, retrieval).
   - `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY` : si index « textes » utilisé.
   - `AMAIA_FETCH_ALLOWLIST` (optionnel) : hôtes supplémentaires pour le fetch HTML Ama’IA, séparés par des virgules (sans `https://`).
   - `CRON_SECRET` : secret pour `POST /api/ingest/cron` (`Authorization: Bearer <CRON_SECRET>`).
   - `SUPABASE_WEBHOOK_SECRET` : si vous appelez `/api/webhooks/supabase` (voir [supabase-production.md](./supabase-production.md)).

2. **Build** : `npm run build` et `npm run lint` doivent passer en CI ou localement avant déploiement.

3. **Domaine** : attacher le domaine personnalisé dans Vercel ; aligner **Supabase** (URLs de redirection) et `NEXT_PUBLIC_SITE_URL` sur ce domaine.

4. **Cron** : le fichier [`vercel.json`](../vercel.json) déclenche un **GET** quotidien (`0 3 * * *`, UTC) sur `/api/ingest/cron`. Vercel envoie l’en-tête `Authorization: Bearer <CRON_SECRET>` lorsque la variable **`CRON_SECRET`** est définie sur le projet. Tant que le secret n’est pas défini, le cron recevra **401** : définissez `CRON_SECRET` avant la mise en prod, ou retirez temporairement la clé `crons` de `vercel.json` si vous ne voulez pas d’appels planifiés.

5. **Observabilité** : activer **Vercel Analytics** dans le dashboard (le package `@vercel/analytics` est intégré au layout racine).

6. **Ama'IA** : checklist et tests manuels dans [`docs/amaia-smoke-test.md`](./amaia-smoke-test.md) ; état de configuration via `GET /api/amaia` (`anthropicConfigured`, `model`).

## Rate limiting (MVP)

Les limites dans `lib/rate-limit.ts` sont **en mémoire** par instance serverless : elles ne sont pas partagées entre les instances Vercel. Suffisant pour un lancement contrôlé ; prévoir Redis / Upstash si le trafic augmente.
