# 01 — Bilan du projet LexGabon

> Destinataire : toi (Data Scientist, pas développeur web de métier) ; tout proprio / partenaire à qui tu dois rendre compte. Lisible sans connaître Next.js.

## En une phrase

LexGabon est une plateforme web qui rend consultable le droit applicable au Gabon (lois gabonaises + actes OHADA + textes CEMAC) et y branche un **assistant IA juridique (Ama'IA)** qui ne répond qu'à partir d'extraits réellement présents dans le corpus indexé.

## Ce qu'on a livré

Le projet a été conduit en deux phases (T1 et T2) puis nettoyé via une série de « dettes techniques » (D1-D7). Au final :

- **Un site complet en production** déployé sur Vercel : pages publiques (landing, méthodologie, mentions, CGU), application authentifiée (recherche, textes, veille, chatbot, compte).
- **Un backend Python sur Render** qui héberge l'index vectoriel (ChromaDB) et l'appel au modèle Anthropic. Il n'est **jamais exposé au navigateur** ; le front lui parle uniquement via une route Next côté serveur (`/api/chat`).
- **Un corpus initial ingéré et exploitable** : le Code du travail gabonais 2021 (415 articles indexés, chacun étant à la fois une entrée dans Postgres, un document dans Meilisearch, et un embedding dans Chroma).
- **Un assistant Ama'IA contraint** : refus poli des questions hors droit gabonais, citations obligatoires au format `[Article N, Code …]`, disclaimer systématique.
- **Une veille juridique dynamique** alimentée par un scraper multi-portails (Journal officiel Gabon + OHADA fonctionnels, CEMAC/COBAC/CIMA stubs) avec **fallback automatique** vers un flux d'URLs curatées si la base est inaccessible.
- **Une recherche full-text + sémantique** : Meilisearch pour le full-text instantané ; ChromaDB pour la recherche sémantique côté chatbot.

### Phase 1 — Fondations

| Ticket | Livré |
|---|---|
| T1.1 | Composant `LegalNoteRenderer` (rend les réponses Ama'IA en HTML sûr, sans markdown). Le prompt LLM a été ajusté pour ne pas générer de markdown du tout. |
| T1.2 | Page `/recherche` en SSR avec filtres (full-text vs sémantique, par domaine, par autorité). |
| T1.3 | Pages texte SSR `/textes/[source]/[slug]` (un acte de loi = une page lisible avec table des matières d'articles). |
| T1.4 | Page `/methodologie` — explique d'où viennent les données et comment elles sont structurées. |
| T1.5 | Fondations SEO : `sitemap.xml`, `robots.txt`, Open Graph, JSON-LD (Organization, WebSite, Legislation). |
| T1.6 | Sélecteur de profil utilisateur (avocat / juriste / étudiant). Pas d'auth — c'est un cookie + localStorage qui module les variantes de prompt envoyées au LLM. |

### Phase 2 — Profondeur

| Ticket | Livré |
|---|---|
| T2.1 | Table SQL `articles` créée et peuplée. Chaque article a son propre embedding dans Chroma (granularité fine pour le RAG). |
| T2.2 | Modèles de questions pré-rédigées par domaine et par profil (affichées dans la page Ama'IA). |
| T2.3 | Sources cliquables dans les réponses d'Ama'IA, avec popover d'aperçu sur l'extrait cité. |
| T2.4 | Veille **dynamique** : table en DB + script de scraping + cron quotidien + flux RSS public. |
| T2.5 | Comparaison de versions de textes en *diff* côte à côte (algorithme LCS écrit à la main, zéro dépendance). |

### Dettes techniques résolues (D1-D7)

| Dette | Sujet | Résolution |
|---|---|---|
| D1 | Recherche ne trouvait pas un article par son numéro | Index Meilisearch refait au niveau **article** (1 doc/article au lieu d'1 doc/texte). |
| D3 | Mentions légales / CGU étaient des placeholders | Textes neutres et professionnels écrits, sans engagement juridique anticipé. |
| D5 | La table `domaines` était vide | Script `seed-domaines.ts` qui insère 8 domaines de référence (civil, pénal, commercial, travail, etc.). |
| D6 | La landing affichait des chiffres en dur | Endpoint backend `/api/corpus/status` qui retourne l'état réel (total chunks, articles distincts, sources) ; lu côté Next avec un `revalidate: 3600` pour mettre à jour la landing une fois par heure. |
| D7 | Veille dépendait d'URLs codées en dur | Scraper backend `POST /api/veille/scrape` protégé par `CRON_SECRET`, avec adapteurs Journal officiel Gabon et OHADA fonctionnels. |

### Bugs corrigés en passant

- **`TypeError: h is not a function` sur le rendu SSR de `/textes`** — une fonction pure était exportée depuis un fichier `"use client"`, donc le serveur recevait un proxy `undefined`. Déplacée dans `lib/article-citation.ts`. Pattern documenté dans `ARCHITECTURE.md`.
- **Violation de clé unique à l'ingestion** — le PDF du Code du travail redémarre la numérotation des articles dans ses annexes (annexes commencent par `Article 1`). Déduplication défensive ajoutée dans `scripts/ingest-articles.ts`.
- **Meilisearch rejetait les IDs `<uuid>:N`** — il accepte seulement `[a-zA-Z0-9-_]`. Remplacé `:` par `__`.
- **OOM Render à l'ingestion** — sur l'instance gratuite, Uvicorn + script d'ingestion + warmup Chroma dépassaient 2 Go. Procédure documentée : poser `WARM_RAG_ON_STARTUP=false` le temps de l'ingestion, puis le remettre à `true`.
- **PDFs absents sur Render** (le `.gitignore` exclut les `*.pdf`) → on upload sur Cloudflare R2 puis `wget` sur l'instance Render avant l'ingestion.
- **Page d'accueil : superposition mobile** — le pill « profil » faisait déborder le header. Refonte en *icône seule* sur mobile, *pill* sur desktop.

## Setup de déploiement

| Brique | Hébergeur | Rôle | Notes |
|---|---|---|---|
| Front (Next.js) | **Vercel** | Site public, SSR, routes API proxy | Variable serveur `LEGAL_AGENT_API_BASE_URL` pointe vers Render. |
| Backend (FastAPI) | **Render** | RAG + appel Anthropic | Volume persistant monté sur `CHROMA_PATH`. `WARM_RAG_ON_STARTUP=true` dès ≥ 1 Go RAM. |
| Postgres + pgvector | **Supabase** | Tables `articles`, `textes`, `versions_textes`, `veille_items`, `domaines`, auth | Activation manuelle de l'extension `vector` dans l'UI Supabase. |
| Meilisearch | **Meilisearch Cloud** | Index `articles` pour la recherche full-text | Index plat (clé `id` au format `<texteId>__<numero>`). |
| Storage PDFs | **Cloudflare R2** | Bucket public pour amener les PDFs sur Render | Évite de committer les PDFs (gitignored). |
| Cron | **Vercel Cron** | Refresh veille quotidien | `vercel.json` : `0 3 * * *` → `GET /api/ingest/cron` avec `Bearer ${CRON_SECRET}`. |

Les variables d'environnement sont documentées dans `.env.example` (front) et `backend/.env.example` (backend). Tous les secrets sont **server-only** sauf ce qui commence par `NEXT_PUBLIC_`.

## Ce qui est volontairement non livré

- **Authentification utilisateur réelle** — Supabase magic link est configuré mais pas branché en obligation d'accès. Le « profil » est un cookie + localStorage, donc pas une identité.
- **Compte / favoris / alertes / historique** — pages présentes (`/compte/*`), modèles SQL prêts, mais l'expérience est partielle. Volontaire : pas de promesse aux utilisateurs tant que le corpus est si mince.
- **Ingestion automatique de nouveaux PDFs** — l'ajout d'un texte au corpus est aujourd'hui une procédure manuelle (voir `04-maintenance-runbook.md`).
- **Tests automatisés** — il n'y a pas de suite de tests front ni back. Plusieurs invariants de chunking sont validés à la main, listés dans `CLAUDE.md` ; ils gagneraient à être figés dans un `tests/`.
- **Corpus complet** — seul le Code du travail est ingéré aujourd'hui (~450 chunks). Tous les autres codes (civil, pénal, commerce, OHADA, Constitution, CEMAC) sont à ingérer. Voir `05-ameliorations-futures.md`.

## Stats finales (à la date du livrable)

- **415 articles** indexés (Code du travail 2021).
- **3 bases de données** distinctes synchronisées (Postgres + Meilisearch + Chroma).
- **5 routes API** côté Next (`/api/chat`, `/api/chat/health`, `/api/search`, `/api/articles`, `/api/ingest/cron`).
- **2 langues** : FR (défaut) + EN, traductions strictement parallèles dans `messages/fr.json` et `messages/en.json`.
- **0 dépendance ajoutée** pour le diff de versions (LCS écrit à la main).
