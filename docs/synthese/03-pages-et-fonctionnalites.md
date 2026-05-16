# 03 — Pages et fonctionnalités

> Inventaire des pages visibles par l'utilisateur, ce qu'elles font, et où aller dans le code pour les modifier. Toutes les pages sont multilingues (`/fr/...` et `/en/...`) — le middleware redirige vers `/fr` par défaut.

## Pages publiques (sans login)

### `/` — Landing

- **Objectif** : présenter LexGabon en une page, expliquer en 3 phrases ce que c'est, donner accès à l'app et à Ama'IA.
- **Contenu** : hero (titre + sous-titre + CTA « Découvrir ALIN »), bandeau de statistiques (textes indexés, sources, accès), carte du Gabon stylisée, citation finale.
- **Données affichées** : volume corpus et nombre de sources tirés de `/api/corpus/status` (avec `revalidate: 3600` → MAJ toutes les heures). Si l'endpoint backend ne répond pas, fallback sur les compteurs statiques de `OFFICIAL_VEILLE_FEED`.
- **Fichiers clés** :
  - `app/[locale]/(marketing)/page.tsx` — composition de la page.
  - `lib/corpus-status.ts` — appel backend.
  - `messages/{fr,en}.json` — clés `Landing.*` (hero, CTA, stats, citation).

### `/methodologie`

- **Objectif** : transparence sur la méthode (d'où viennent les textes, comment ils sont structurés, ce que Ama'IA peut et ne peut pas faire).
- **À mettre à jour** quand le corpus s'étoffe ou quand la méthode change.
- **Fichiers** : `app/[locale]/(marketing)/methodologie/page.tsx` + clés `Methodologie.*`.

### `/mentions-legales` et `/cgu`

- **Objectif** : conformité juridique de base. Aujourd'hui en mode « institutionnel neutre » : pas d'engagement de l'éditeur tant que la structure éditrice n'est pas finalisée.
- **Fichiers** : `app/[locale]/(marketing)/mentions-legales/page.tsx`, `app/[locale]/(marketing)/cgu/page.tsx`. Le contenu lui-même est intégralement dans `messages/{fr,en}.json` (clés `Legal.mentionsBody`, `Legal.cguBody`).

## Application — corpus et recherche

### `/textes` — Index des textes

- **Objectif** : lister tous les textes ingérés, regroupés par source (Journal officiel, OHADA, …).
- **Données** : lit la table `textes` (Drizzle). Affiche aussi la veille (`/api/veille`) en complément si la DB est vide.
- **Fichiers** : `app/[locale]/(app)/textes/page.tsx` + `lib/textes-service.ts`.

### `/textes/[source]/[slug]` — Page d'un texte

- **Objectif** : afficher un acte de loi article par article, avec table des matières latérale.
- **Données** : `articles` filtrés par `texteId`, triés par numéro normalisé.
- **Fonctionnalités** :
  - Ancres `#article-N` pour partager un article précis.
  - Bouton « Citer cet article » qui copie une citation conforme (`Art. 54 du Code du travail (Loi n° 022/2021…)`).
  - Lien vers `/textes/[source]/[slug]/comparer?versionA=…&versionB=…` quand plusieurs versions existent.
- **Fichiers** :
  - `app/[locale]/(app)/textes/[source]/[slug]/page.tsx`.
  - `components/textes/texte-actions.tsx` (UI client, bouton citer/copier).
  - `lib/article-citation.ts` — **fonction pure** qui construit la chaîne de citation (extraite hors `"use client"` pour rester appelable depuis le SSR).

### `/textes/[source]/[slug]/comparer` — Diff de versions

- **Objectif** : voir ce qui a changé entre deux versions d'un texte (ex. réforme du Code du travail).
- **Implémentation** : LCS (Longest Common Subsequence) écrit à la main dans `lib/text-diff.ts` — aucune dépendance externe.
- **Affichage** : deux colonnes, paragraphes alignés, surlignage AA des ajouts/suppressions.
- **Fichiers** : `app/[locale]/(app)/textes/[source]/[slug]/comparer/page.tsx`.

### `/recherche`

- **Objectif** : recherche full-text (Meilisearch) avec filtres par domaine et par autorité.
- **Variantes** : on a une bascule sémantique (vectorielle) qui appelle directement Chroma via `/api/search?mode=semantic` — utile pour des questions formulées en langage naturel.
- **Fichiers** :
  - `app/[locale]/(app)/recherche/page.tsx`.
  - `app/api/search/route.ts` — route proxy qui parle à Meili (ou au backend pour le mode sémantique).
  - `lib/search-service.ts` — logique métier (filtres, format de résultat).

## Application — assistant Ama'IA

### `/chatbot` (alias `/amaia`)

- **Objectif** : conversation avec Ama'IA. Une bulle utilisateur, une bulle assistant, citations cliquables (popover sur l'extrait source), historique conservé en session.
- **Profil utilisateur** : sélecteur dans le header (icône au mobile, pill au desktop). Le choix module la variante de prompt envoyée au LLM mais n'authentifie personne.
- **Modèles de questions** : encarts pré-rédigés par domaine (`messages/{fr,en}.json` → `Amaia.questionTemplates.*`) — utile pour onboarder un nouvel utilisateur.
- **Fichiers** :
  - `app/[locale]/(app)/chatbot/page.tsx` (et alias `amaia/page.tsx`).
  - `components/chatbot/chat-message.tsx`, `chat-citations.tsx`, etc.
  - `app/api/chat/route.ts` (proxy vers FastAPI).
  - `backend/src/agent/prompts.py` (le prompt système, à respecter scrupuleusement — voir `PROMPT-AMAIA.md`).

## Application — veille juridique

### `/veille`

- **Objectif** : flux d'actualité juridique gabonaise (nouveaux textes publiés, communiqués, etc.).
- **Source** : table `veille_items` peuplée par le scraper backend ou, en fallback, par `OFFICIAL_VEILLE_FEED` (liens curatés vers les portails officiels).
- **Fichiers** :
  - `app/[locale]/(app)/veille/page.tsx`.
  - `lib/veille-service.ts` (lecture DB + fallback).
  - `app/[locale]/(app)/veille/rss.xml/route.ts` — flux RSS public.

## Application — compte utilisateur

> Aujourd'hui partiel — Supabase auth est branché mais l'expérience n'est pas mise en avant. Les pages existent comme « ossature » pour ne pas avoir à refaire le routing plus tard.

| Route | État | Fonction |
|---|---|---|
| `/compte` | Stub | Vue d'ensemble (placeholder). |
| `/compte/favoris` | Stub | Articles enregistrés (à implémenter). |
| `/compte/alertes` | Stub | Abonnements veille par domaine (à implémenter). |
| `/compte/historique` | Stub | Historique des questions Ama'IA (à implémenter). |
| `/compte/parametres` | Stub | Profil + préférences. |

## Routes API (côté Vercel)

| Route | Méthode | Auth | Rôle |
|---|---|---|---|
| `/api/chat` | POST | Rate-limit IP | Proxy vers FastAPI `/api/chat`. `maxDuration = 300` (timeout long). |
| `/api/chat/health` | GET | — | Sonde de vie : appelle `{base}/health` côté backend, retourne une enveloppe JSON avec diagnostic. |
| `/api/search` | GET | — | Recherche full-text Meili (ou sémantique via backend si `mode=semantic`). |
| `/api/articles` | GET | — | Récupère un article (par ID ou slug+numero). Utilisé par le popover Ama'IA. |
| `/api/ingest/cron` | GET | Bearer `CRON_SECRET` | Cron Vercel quotidien (03:00 UTC). Appelle le scraper backend puis fallback sur `OFFICIAL_VEILLE_FEED`. |
| `/api/webhooks/supabase` | POST | header `x-supabase-signature == SUPABASE_WEBHOOK_SECRET` | Webhook Supabase (event auth). |

## Routes backend (côté Render — non exposées au navigateur)

| Route | Rôle |
|---|---|
| `GET /health` | Sonde de vie, ne charge pas Chroma. |
| `POST /api/chat` | Cœur du chatbot (retrieval + LLM). |
| `GET /api/corpus/status` | Inventaire dynamique du corpus (D6). |
| `POST /api/veille/scrape` | Lancement du scraper veille (protégé `CRON_SECRET`). |

## i18n — comment gérer les textes

- **Tout texte affiché à l'utilisateur passe par `useTranslations()`**. Pas de chaîne hard-codée dans un composant.
- Les deux fichiers `messages/fr.json` et `messages/en.json` ont la **même arborescence**. Si tu ajoutes une clé en FR sans l'ajouter en EN, l'app crashe à l'exécution sur la version EN.
- Pour ajouter une langue : éditer `i18n/routing.ts` + créer `messages/<locale>.json`.

## Layout et navigation

- `app/[locale]/(app)/layout.tsx` — header de l'app, sélecteur de profil, navigation principale.
- `app/[locale]/(marketing)/layout.tsx` — header marketing (landing & legal).
- `components/layout/site-header.tsx` — header partagé. **3-zone layout** (logo / nav / actions) pour éviter le superposition mobile.
- `components/layout/profile-switcher.tsx` — sélecteur de profil. Icône au mobile, pill au desktop, popover `max-w-[calc(100vw-1.5rem)]` pour ne jamais déborder.
- `i18n/navigation.ts` — `Link` qui auto-préfixe la locale. Pour les **liens externes**, utilise `<a href="…">` standard (ex. `https://alin-africa.com` dans le hero).
