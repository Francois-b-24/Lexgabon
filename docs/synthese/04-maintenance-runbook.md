# 04 — Runbook de maintenance

> Toutes les procédures manuelles à connaître pour faire vivre LexGabon. Chaque section est un mode d'emploi auto-suffisant, dans l'ordre où tu vas typiquement en avoir besoin.

## Prérequis : ce que tu dois avoir sous la main

- L'accès admin à **Vercel** (front), **Render** (backend), **Supabase** (DB), **Meilisearch Cloud** (recherche), **Cloudflare R2** (stockage temporaire de PDFs).
- Le repo cloné localement et `npm install` exécuté à la racine.
- `python3.11+` et `pip install -r backend/requirements.txt` dans `backend/`.
- Les variables d'env locales dans `.env.local` (racine) et `backend/.env`.

## 1) Ajouter un nouveau texte juridique (ex. nouveau code)

C'est l'opération la plus fréquente et la plus structurante. Cinq étapes : déposer le PDF, le décrire, l'ingérer dans les 3 bases, vérifier, déployer.

### Étape 1 — Déposer le PDF

Le `.gitignore` exclut les `*.pdf`. Pour l'ingestion locale, tu peux les poser dans `backend/corpus/pdfs/`. Pour Render, voir l'étape 3.

```bash
# Convention de nommage : kebab-case, identifiant + année si pertinent
cp ~/Téléchargements/code-civil-2020.pdf backend/corpus/pdfs/
```

### Étape 2 — Déclarer les métadonnées dans `manifest.yaml`

Ouvre `backend/corpus/pdfs/manifest.yaml` et ajoute une entrée :

```yaml
code-civil-2020.pdf:
  slug: "code-civil-2020"             # URL stable : /textes/jog/code-civil-2020
  source_code: "JOG"                   # JOG = Journal Officiel Gabonais (voir lib/sources.ts)
  type: "loi"
  domaine: "civil"                     # parmi SUPPORTED_DOMAINES
  titre: "Code civil de la République gabonaise"
  code: "Code civil"                   # forme courte utilisée par Ama'IA dans les citations
  autorite: "République gabonaise"
  date: "2020-03-15"
  reference: "Loi n° 010/2020 du 15 mars 2020"
  source: "https://journal-officiel.ga/…"
```

**Pièges à éviter** :
- `slug` doit être unique (sinon collision SQL).
- `domaine` doit faire partie de la liste `SUPPORTED_DOMAINES` dans `lib/search-service.ts` (sinon le filtre par domaine ne le verra pas).
- `code` est la chaîne utilisée dans la citation finale par Ama'IA (`[Article 12, Code civil]`). Garde-la courte.

### Étape 3 — Ingérer en local (à blanc) pour vérifier

```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. python3 scripts/ingest_pdfs.py --skip-duplicates
```

Le script :
1. Lit `manifest.yaml`.
2. Pour chaque PDF, calcule un `source_key = sha256(relpath)` → idempotent : ré-exécution sans risque.
3. Extrait le texte (pypdf), normalise (soft-hyphen, NBSP, line-rejoin).
4. Chunke en mode article-aware (regex `Article N`).
5. Calcule les embeddings (`multilingual-e5-small`).
6. Insère dans Chroma (collection `droit_gabonais`).

Tu dois voir une ligne par PDF avec un nombre de chunks. Pour le Code du travail : ~417 chunks attendus. Pour un texte plus court, c'est normal d'avoir 30-100.

### Étape 4 — Ingérer dans Postgres + Meilisearch

L'ingestion Python ne touche **que Chroma**. Les deux autres bases sont peuplées par des scripts TypeScript depuis la racine :

```bash
# Depuis la racine (front)
npm run db:ingest-articles    # lit le PDF chunké, écrit dans la table `articles` de Postgres
npm run search:index          # relit Postgres, indexe dans Meilisearch
```

**Sanity check rapide** :

```bash
# Postgres : nombre d'articles total
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM articles;"

# Postgres : nombre d'articles du nouveau code
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM articles WHERE texte_id IN (SELECT id FROM textes WHERE slug='code-civil-2020');"
```

### Étape 5 — Promouvoir en production

Deux chemins selon où ChromaDB tourne :

**Chemin A — Render dispose d'un volume persistant pour Chroma** (cas actuel).

1. Uploader le PDF sur Cloudflare R2 (drag & drop dans l'UI R2 → bucket public).
2. SSH sur Render → ouvrir le shell de l'instance backend → :
   ```bash
   cd /opt/render/project/src/backend  # adapte au chemin réel
   wget -O corpus/pdfs/code-civil-2020.pdf "https://<r2-public>/code-civil-2020.pdf"
   # Mets temporairement WARM_RAG_ON_STARTUP=false sinon OOM possible
   PYTHONPATH=. python3 scripts/ingest_pdfs.py --skip-duplicates
   # Rebascule WARM_RAG_ON_STARTUP=true
   ```
3. Côté Vercel → variable d'env DATABASE_URL → Postgres prod. Lance depuis ta machine (ou un job ponctuel) :
   ```bash
   DATABASE_URL=<prod> npm run db:ingest-articles
   DATABASE_URL=<prod> MEILISEARCH_HOST=<prod> npm run search:index
   ```

**Chemin B — On part de zéro sur une nouvelle instance Render.** Refais l'étape 3 sur l'instance après avoir mis tous les PDFs sur R2.

### Étape 6 — Vérification finale

```bash
cd backend
PYTHONPATH=. python3 scripts/verify_corpus.py
```

Sortie attendue : `total_chunks ≥ <ancien total + nouveaux chunks>`, `articles_distincts` augmenté en proportion, ≥ 80 % avec `numero_article`.

Et côté front :

- Navigue sur `/fr/textes/jog/code-civil-2020` → la page doit afficher tous les articles avec ancres.
- Tape « civil » dans `/fr/recherche` → tu dois voir des résultats.
- Pose une question d'Ama'IA citant un thème civil → la réponse doit contenir `[Article N, Code civil]`.

## 2) Mettre à jour la veille (cron + manuel)

Le cron Vercel tourne tout seul à 03:00 UTC chaque jour (`vercel.json`). Pour le **forcer manuellement** (ex. après un bug, ou pour tester) :

```bash
# Depuis ta machine, en local sur le backend qui tourne :
curl -X POST http://localhost:8000/api/veille/scrape \
  -H "Authorization: Bearer $CRON_SECRET"

# Ou en production, contre Vercel (qui forwarde au backend + écrit en DB) :
curl -X GET "https://lexgabon.ga/api/ingest/cron" \
  -H "Authorization: Bearer $CRON_SECRET"
```

La route renvoie un JSON résumé : `{ source: "scrape" | "fallback", items: N, … }`. Si `source === "fallback"`, le scraper backend n'a pas répondu — vérifier Render.

**Ajouter un nouveau portail à la veille** : éditer `backend/src/routes/veille_scrape.py`, créer un nouvel *adapter* (modèle des adapteurs OHADA et JO Gabon). Tester en local avant de pousser.

## 3) Re-déclencher l'indexation Meilisearch après changement

À chaque fois que tu modifies la table `articles` (ingestion d'un nouveau texte, mise à jour de métadonnées) :

```bash
npm run search:index
```

L'index `articles` est rebuilt depuis Postgres. Coût : quelques secondes, sans risque.

## 4) Mettre à jour les domaines juridiques

```bash
npm run db:seed-domaines
```

Idempotent. Édite `scripts/seed-domaines.ts` pour ajouter / renommer un domaine. Pense à mettre à jour `SUPPORTED_DOMAINES` dans `lib/search-service.ts` en parallèle.

## 5) Déployer le front (Vercel)

C'est automatique : tout push sur `main` déclenche un build et un déploiement.

```bash
# Vérifier le dernier commit déployé
git log origin/main -1
```

Pour forcer un redeploy sans nouveau commit : dans l'UI Vercel → Deployments → ⋯ → Redeploy.

**Variables d'env à connaître côté Vercel** :

| Variable | Visibilité | Rôle |
|---|---|---|
| `LEGAL_AGENT_API_BASE_URL` | server-only | URL du backend Render. **JAMAIS** préfixer `NEXT_PUBLIC_`. |
| `DATABASE_URL` | server-only | Postgres Supabase. |
| `MEILISEARCH_HOST` + `MEILISEARCH_API_KEY` | server-only | Recherche. |
| `CRON_SECRET` | server-only | Authentifie le cron Vercel. |
| `NEXT_PUBLIC_SITE_URL` | public | URL publique (canoniques, OG). |
| `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Auth Supabase côté client (ces clés sont publiques par nature). |
| `SUPABASE_WEBHOOK_SECRET` | server-only | Vérif signature webhook. |

## 6) Déployer le backend (Render)

Render redéploie automatiquement sur push `main` (si la branche est connectée). Sinon → Manual Deploy.

**À surveiller au déploiement** :

- Logs Render au boot : tu dois voir `Application startup complete.` sans warning Anthropic.
- `WARM_RAG_ON_STARTUP=true` n'est correct que si l'instance a **≥ 1 Go de RAM**. Sinon, le warmup race avec `/health` → premiers requests échouent → Render marque l'instance unhealthy.
- Si OOM pendant ingestion : passer temporairement `WARM_RAG_ON_STARTUP=false`, redéployer, refaire l'ingestion, rebasculer `true`.

**Vérifier la santé en prod** :

```bash
curl https://<vercel>/api/chat/health
# attendu : { status: "ok", backend: { reachable: true, latencyMs: <300 } }
```

## 7) Faire tourner Ama'IA en local pour debug

```bash
# Terminal A — backend
cd backend
source .venv/bin/activate
export ANTHROPIC_API_KEY=sk-ant-…
export CHROMA_PATH=./data/chroma
PYTHONPATH=. uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal B — front
npm run dev
# .env.local doit contenir : LEGAL_AGENT_API_BASE_URL=http://127.0.0.1:8000
```

Ouvre http://localhost:3000/fr/chatbot. Si tu changes le prompt système (`backend/src/agent/prompts.py`), le reload Uvicorn le prend en compte automatiquement.

## 8) Rotation des secrets

Annuellement (et en cas de fuite) :

1. **Anthropic API key** → console Anthropic → générer une nouvelle clé → l'appliquer dans Render → invalider l'ancienne.
2. **CRON_SECRET** → générer une chaîne (`openssl rand -hex 32`) → appliquer dans Vercel **et** Render → redéployer les deux.
3. **Meilisearch master key** → UI Meilisearch Cloud → roll → mettre à jour `MEILISEARCH_API_KEY` côté Vercel.
4. **Supabase service role** → si compromise, rotation depuis l'UI Supabase. Le webhook secret est séparé.

## 9) Sauvegardes

- **Postgres** : Supabase fait des snapshots automatiques (cf. plan Supabase).
- **Chroma** : monté sur un volume persistant Render. Pour un backup manuel, `tar -czf chroma-$(date +%F).tar.gz data/chroma` depuis le shell Render.
- **Meilisearch** : pas critique — peut être reconstruit en ~1 minute depuis Postgres (`npm run search:index`).
- **PDFs originaux** : garde une copie hors-repo (Drive, R2, NAS). Tout le reste est dérivable depuis le PDF + le manifest.

## 10) Débugger un cas concret

### « Ama'IA répond hors-sujet ou invente »

1. Demande-lui de citer ses sources (le prompt l'oblige déjà, mais teste).
2. Inspecte `qualityFlags` dans la réponse JSON (`has_citation`, `has_disclaimer`).
3. Si `has_citation === false` : soit le retrieval n'a rien remonté de pertinent (corpus mince sur ce thème), soit la question est hors-sujet.
4. Côté backend, logs Uvicorn : tu verras les extraits remontés par `retriever.search`.

### « Un article n'est pas trouvable »

1. Postgres : `SELECT * FROM articles WHERE numero='12' AND texte_id IN (SELECT id FROM textes WHERE slug='…')` → existe-t-il ?
2. Si non : ré-ingérer le texte (étape 1 ci-dessus).
3. Si oui : `npm run search:index` pour réindexer Meilisearch.

### « Le scraper veille est cassé »

1. `curl /api/chat/health` → backend OK ?
2. Logs Render → erreur HTTP sur un portail amont (site changé) → adapter à mettre à jour.
3. En attendant la fix, la veille **continue de marcher en fallback** sur `OFFICIAL_VEILLE_FEED`.

### « Le build Vercel échoue »

1. Lire le log Vercel : tu cherches une ligne `error TS…` ou `Module not found`.
2. Reproduire en local : `npm run build`. Si ça passe en local, c'est une variable d'env manquante côté Vercel.
3. `npx tsc --noEmit` pour un typecheck isolé sans build.
