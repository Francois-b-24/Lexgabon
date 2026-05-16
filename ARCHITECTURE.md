# Architecture LexGabon

Plateforme open-access de droit gabonais. Trois services qui parlent entre eux, plus trois bases de données. Le front ne s'adresse jamais directement au backend Python : tout passe par des routes proxy Next côté serveur.

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                  Navigateur utilisateur                     │
└─────────────┬───────────────────────────────────────────────┘
              │ HTTPS
              ▼
┌─────────────────────────────────────────────────────────────┐
│  Vercel — Next.js 14 (App Router, RSC + Server Actions)     │
│  - Pages SSR : /, /chatbot, /recherche, /textes/[s]/[slug], │
│    /textes/[s]/[slug]/comparer, /veille, /methodologie, …   │
│  - Routes proxy : /api/chat, /api/search, /api/articles,    │
│    /api/ingest/cron, /api/chat/health, /api/webhooks/…      │
│  - Sitemap dynamique, robots.txt, JSON-LD                   │
│                                                             │
│  Variables d'env (server-only sauf NEXT_PUBLIC_*) :         │
│    LEGAL_AGENT_API_BASE_URL, DATABASE_URL,                  │
│    MEILISEARCH_HOST, MEILISEARCH_API_KEY,                   │
│    CRON_SECRET, NEXT_PUBLIC_SITE_URL                        │
└────┬──────────────────────────────────────────────┬─────────┘
     │ Drizzle (postgres-js)                        │ fetch HTTPS
     │ Meili SDK                                    │ (server-only)
     ▼                                              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐
│  Postgres    │  │  Meilisearch │  │  Render — FastAPI        │
│  (Supabase)  │  │  (Cloud)     │  │  Ama'IA + Chroma         │
│              │  │              │  │                          │
│  Tables :    │  │  Index :     │  │  Routes :                │
│  - sources   │  │  - articles  │  │  - POST /api/chat        │
│  - textes    │  │  (1 doc =    │  │  - POST /api/search-     │
│  - articles  │  │   1 article) │  │    semantic              │
│  - chunks    │  │              │  │  - GET  /api/corpus/     │
│  - text_     │  │              │  │    status                │
│    versions  │  │              │  │  - POST /api/veille/     │
│  - veille_   │  │              │  │    scrape                │
│    items     │  │              │  │  - GET  /health          │
│  - domaines  │  │              │  │                          │
│  - profils,  │  │              │  │  Données locales :       │
│    favoris,  │  │              │  │  - /data/chroma          │
│    alertes,  │  │              │  │    (disque persistant)   │
│    convers., │  │              │  │  - corpus/pdfs/*.pdf     │
│    messages, │  │              │  │  - corpus/sources.yaml   │
│    quotas    │  │              │  │                          │
└──────────────┘  └──────────────┘  └──────────────────────────┘
```

## Pipeline d'ingestion

```
backend/corpus/pdfs/*.pdf            ←── ajout manuel
        │
        ▼
backend/corpus/pdfs/manifest.yaml    ←── métadonnées (slug, source_code, code, reference…)
        │
        ▼
PYTHONPATH=. python3 scripts/ingest_pdfs.py --skip-duplicates
        │
        ├─► Chroma (backend/data/chroma/) : 1 embedding par article
        │   - métadonnées : text_id, article_id, source_code, type, domaine,
        │     numero_article, titre_section, citation, …
        │   - identifiant stable : corpus-pdf:<sha>:art:<numero>:p<position>
        │
        └─► backend/data/articles_ingest.jsonl
                │
                ▼
        npm run db:ingest-articles
                │
                └─► Postgres : tables sources / textes / articles
                        │
                        ▼
                npm run search:index
                        │
                        └─► Meilisearch index `articles` (1 doc = 1 article)
                                ID : <texte_id>__<numero_normalisé>
```

## Stack technique

| Couche | Technologie | Source de vérité |
|---|---|---|
| Frontend | Next.js 14 (App Router), TypeScript strict, Tailwind | `app/`, `components/`, `lib/` |
| Internationalisation | `next-intl` (FR défaut + EN) | `i18n/routing.ts`, `messages/{fr,en}.json` |
| Tests front | Vitest + Testing Library + jsdom (sur composants critiques) | `__tests__/` |
| ORM relationnel | Drizzle (postgres-js driver) | `lib/db/schema.ts` |
| Migrations | drizzle-kit | `drizzle/*.sql` (généré) |
| Recherche full-text | Meilisearch 1.11 | index `articles` (script `index-meilisearch.ts`) |
| Backend chat | FastAPI + Anthropic Claude | `backend/src/` |
| RAG vectoriel | ChromaDB + embeddings `multilingual-e5-small` | `backend/data/chroma/` |
| Tests backend | pytest | `backend/tests/` |
| Auth (futur) | Supabase magic link | `lib/supabase/{client,server}.ts` |
| Hébergement front | Vercel | — |
| Hébergement backend | Render (disque persistant pour Chroma) | — |
| Cron quotidien | Vercel Cron (`vercel.json` 03:00 UTC) | `app/api/ingest/cron/route.ts` |

## Choix d'architecture (et pourquoi)

### Pourquoi un backend Python séparé, et pas tout dans Next.js ?

- ChromaDB et sentence-transformers exigent Python + ~1 Go RAM en steady state. Inadapté aux fonctions serverless Vercel (15 min max, RAM limitée, cold starts longs).
- Le backend reste léger, scope unique (RAG + appel Claude). Pas de fuite des secrets Anthropic vers le navigateur.

### Pourquoi `MEILI_INDEX = "articles"` plutôt que par texte ?

Une recherche « préavis cadre » doit retomber sur l'article 82 du Code du travail, pas sur le texte global. On indexe le contenu de chaque article séparément avec un permalien `#article-N`. Le texte parent reste accessible via le clic sur la carte (qui mène à `/textes/<source>/<slug>#article-N`).

### Pourquoi un embedding par article entier (Chroma) et plus de chunking ?

T2.1. Pour un texte juridique, l'unité de sens est l'article. Subdiviser un article en sous-chunks dilue la précision sémantique : le retriever ramène des fragments sans structure, le LLM reçoit du contexte morcelé. Avec un embedding par article : citation atomique, fenêtre LLM plus claire, ID Chroma stable. Compromis : E5-small a une fenêtre de ~512 tokens, donc seuls les ~1500 premiers caractères d'un article long sont effectivement embeddés — mais Chroma stocke et retourne le document entier.

### Pourquoi du SSR partout côté front ?

- SEO : Google indexe sans exécution JS, donc les pages texte, recherche, veille, méthodologie sont indexables natives.
- Robustesse : les pages se rendent même si le navigateur a JS désactivé (sauf interactions client comme favoris, partage, popovers).
- URL canonique partageable : tous les filtres (recherche, veille) passent par query params, pas par state local.

### Pourquoi du Drizzle plutôt que Prisma ?

- ESM-first, TypeScript strict, pas de génération de code (le schéma est du TS).
- Moins de magie, plus facile à debugger.
- Les requêtes complexes (jointures `articles × textes × sources`) restent lisibles.

### Pourquoi la fonction pure `buildArticleCitation` dans `lib/article-citation.ts` et pas dans `components/textes/texte-actions.tsx` ?

Un fichier `"use client"` ne peut exposer que des composants React utilisables côté serveur. Une fonction pure exportée depuis un fichier client devient un proxy `undefined` quand un server component tente de l'appeler. Bug repéré en prod (cf. CHANGELOG « fix(textes) »). Toute fonction non-React doit vivre dans `lib/` (sans directive `use client`).

### Pourquoi un mapping `source_code ↔ slug URL` dans `lib/sources.ts` ?

La colonne SQL `sources.code` peut contenir n'importe quel libellé court (« JOG », « OHADA »). Le segment d'URL doit rester stable et lisible (`jo-ga`, `ohada`). Un mapping séparé permet de renommer un sans renommer l'autre, sans migration de données ni casse SEO.

### Pourquoi un mode dégradé partout ?

Si Postgres tombe : `lib/veille-service.ts` retombe sur `OFFICIAL_VEILLE_FEED` curé en code, la page reste utile. Si Meilisearch tombe : `lib/search-service.ts` retombe sur le même mock. Si le backend Render tombe : `lib/corpus-status.ts` retombe sur `lib/methodologie-data.ts`. Le site n'affiche jamais d'erreur 500 utilisateur, juste un bandeau « Index dégradé / Stats indisponibles ».

## Flux clé : une question à Ama'IA

```
1. Utilisateur tape une question dans /chatbot
   │
   ▼
2. ChatbotPanel (client) → fetch POST /api/chat
   body : { question, history, session_id, profile }
   │
   ▼
3. app/api/chat/route.ts (Next, rate-limit IP)
   → fetch POST {LEGAL_AGENT_API_BASE_URL}/api/chat
   │
   ▼
4. FastAPI backend/src/routes/chat.py
   │
   ├─► retriever.search(question)  ──► Chroma top-K hybride
   │   (vectoriel + lexical re-score)
   │
   ├─► build_system_prompt(profile)  ──► SYSTEM_PROMPT_FAST + adaptation
   │
   ├─► llm.create_text_only()        ──► Anthropic Claude Sonnet 4.6
   │   (fallback Haiku 4.5)
   │
   ├─► strip_markdown_heuristic()    ──► nettoie le texte
   │
   └─► response_parser.parse_legal_note()
       └─► StructuredAnswer { paragraphs[], disclaimer }
            chaque paragraphe contient ses StructuredRef
            (résolus contre les SourceItem matchés)
   │
   ▼
5. Next route renvoie ChatResponse { answer, structured, sources, ... }
   │
   ▼
6. ChatbotPanel rend LegalNoteRenderer
   │
   ▼
7. RefBadgeLink (client) :
   - Survol/clic → fetch /api/articles?slug=X&numero=Y
   - Popover : titre + extrait + lien vers /textes/<source>/<slug>#article-N
```

## Conventions

### Variables d'environnement

- **`NEXT_PUBLIC_*`** : exposées au navigateur. Réservé à l'URL publique du site et aux clés Supabase anon (cf. config Supabase RLS).
- **Tout le reste** : server-only. Ne **jamais** préfixer `MEILISEARCH_*`, `DATABASE_URL`, `CRON_SECRET`, `LEGAL_AGENT_API_BASE_URL` par `NEXT_PUBLIC_`.

### Scripts npm

```bash
# Développement
npm run dev                       # Next.js localhost:3000
npm run lint
npm run build
npm run test                      # Vitest

# Base de données (Postgres via Drizzle)
npm run db:generate               # nouvelle migration SQL depuis schema.ts
npm run db:push                   # applique le schéma à DATABASE_URL
npm run db:ingest-articles        # JSONL backend → table `articles`
npm run db:seed-veille            # peuple `veille_items` depuis OFFICIAL_VEILLE_FEED
npm run db:seed-text-versions     # texte démo « Loi de finances » + 2 versions
npm run db:seed-domaines          # 8 catégories de référence

# Meilisearch
npm run search:index              # remplace l'index `articles` complet
```

```bash
# Backend (depuis backend/, .venv activé, PYTHONPATH=.)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Ingestion corpus
python3 scripts/ingest_pdfs.py --skip-duplicates
python3 scripts/verify_corpus.py            # audit du corpus

# Tests
python3 -m pytest -q
```

### Migrations DB

Toute modification de `lib/db/schema.ts` exige :

```bash
npm run db:generate               # crée drizzle/XXXX_NAME.sql
git add drizzle/                  # versionner le SQL
npm run db:push                   # appliquer (interactif si conflits)
```

**Ne jamais éditer un fichier `drizzle/XXXX_NAME.sql` à la main** : re-générer.

## Ce qui n'est pas (encore) là

- **Authentification utilisateur active** : Supabase magic link est branché techniquement mais aucune route protégée. Les hooks `useUserProfile` fonctionnent sans login.
- **Indexation continue de la veille** : le cron Next appelle le scraper backend, mais les adapters CEMAC/COBAC/CIMA sont des stubs.
- **Vraie ingestion automatique des codes** : ajouter un code = drag&drop du PDF dans `backend/corpus/pdfs/`, déclarer dans `manifest.yaml`, relancer `ingest_pdfs.py` + `db:ingest-articles` + `search:index`. Pas de pipeline OCR/extraction automatique depuis un portail.
- **Email RGPD** : la veille a un RSS public, pas d'abonnement email (choisi explicitement en T2.4).
- **Analytics** : pas de Plausible/Umami installé.
- **Tests E2E** : pas de Playwright. Tests unitaires Vitest et pytest sur les chemins critiques uniquement.

## Documentation associée

- [README.md](README.md) — démarrage rapide.
- [CLAUDE.md](CLAUDE.md) — guide pour les futures sessions Claude Code (commandes, invariants, faiblesses connues).
- [CHANGELOG.md](CHANGELOG.md) — historique des tickets T1.1 → T2.5 + dettes D1-D7.
- [PROMPT-AMAIA.md](PROMPT-AMAIA.md) — prompt système final + variantes par profil + cas de refus.
- [docs/chatbot-render-production.md](docs/chatbot-render-production.md) — checklist production Render.
- [docs/deployment-vercel.md](docs/deployment-vercel.md) — checklist production Vercel.
