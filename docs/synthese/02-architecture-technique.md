# 02 — Architecture technique

> Pour un Data Scientist qui veut comprendre comment le tout tient en équilibre. J'utilise volontairement des analogies (FAISS, SQLAlchemy, scikit-learn) pour réduire la friction de découverte.

## Le schéma le plus simple possible

```
        Navigateur
            │
            ▼
   ┌─────────────────┐
   │  Vercel (Next)  │  ←──── Tu écris ici 90 % du temps
   └────────┬────────┘
            │
   ┌────────┼─────────────────┐
   │        │                 │
   ▼        ▼                 ▼
Postgres  Meili        Render (FastAPI)
(SQL)    (full-text)         │
                             ▼
                          ChromaDB
                       (embeddings)
                             │
                             ▼
                       API Anthropic
                       (le LLM Claude)
```

Quatre principes structurants :

1. **Le navigateur ne parle qu'à Vercel.** Jamais à Render, jamais à Supabase, jamais à Meili. Toutes les requêtes passent par une *route API* Next qui agit en proxy côté serveur. Conséquence : un seul endroit où sécuriser les clés.
2. **Trois bases de données complémentaires, pas concurrentes.** Postgres pour les données structurées (textes, articles, veille, utilisateurs), Meilisearch pour la recherche full-text rapide (équivalent d'un index lexical type Elasticsearch en simplifié), ChromaDB pour la recherche sémantique (équivalent FAISS persisté sur disque).
3. **Le chatbot fait du RAG « pauvre » volontairement.** Pas d'agent multi-tool, pas de streaming SSE : une seule requête → un seul appel LLM → une seule réponse. Plus prévisible, moins cher, plus simple à débugger.
4. **L'ingestion est offline.** Aucun PDF n'est traité « à la demande » dans le navigateur. Les scripts d'ingestion tournent à la main (sur ta machine ou sur le shell Render) et écrivent dans les 3 bases.

## Stack — vue par couche

### Front-end (Vercel)

| Brique | Rôle | Équivalent DS |
|---|---|---|
| **Next.js 14 App Router** | Framework React qui fait du SSR (Server-Side Rendering) + RSC (React Server Components) | Comme Streamlit ou Gradio, sauf que le serveur rend du HTML statique optimisé puis « hydrate » côté navigateur. |
| **TypeScript strict** | Typage statique JS | Comme `pyright` strict en Python. |
| **Tailwind CSS** | Classes utilitaires pour styler le HTML | Équivalent : utiliser Bootstrap sans écrire de CSS soi-même. |
| **next-intl** | i18n (FR / EN) | `gettext` pour Python web. |
| **Drizzle ORM** | Accès Postgres | `SQLAlchemy` mais en TypeScript. Le schéma SQL est défini dans `lib/db/schema.ts`. |
| **Meilisearch JS SDK** | Client full-text | Comme `elasticsearch-py`. |

### Back-end (Render)

| Brique | Rôle | Équivalent DS |
|---|---|---|
| **FastAPI** | Framework HTTP Python | Que tu connais déjà. |
| **ChromaDB** | Vector store persistant sur disque | FAISS + sqlite combinés. Une « collection » = un index FAISS. |
| **sentence-transformers** | Calcul d'embeddings | Comme `from sentence_transformers import SentenceTransformer`. |
| **`multilingual-e5-small`** | Modèle d'embeddings multilingue (FR + EN) | Plus petit que `e5-base`, suffisant pour notre corpus actuel. Changement de modèle = ré-ingestion totale. |
| **Anthropic SDK** | Appel LLM | `openai` SDK mais pour Claude. |
| **pypdf** | Extraction texte des PDFs | `PyPDF2` que tu as déjà croisé. |

### Stockage

| Brique | Hébergeur | Usage | Comment c'est branché |
|---|---|---|---|
| Postgres + pgvector | Supabase | `articles`, `textes`, `versions_textes`, `veille_items`, `domaines`, `users` | Drizzle (front) + Drizzle (scripts d'ingestion). |
| Meilisearch | Meilisearch Cloud | Index `articles` (1 doc par article) | `scripts/index-meilisearch.ts` réindexe à partir de Postgres. |
| ChromaDB | Volume monté sur Render | Collection `droit_gabonais` (1 doc = 1 chunk d'article) | Scripts Python `backend/scripts/ingest_*.py`. |
| Cloudflare R2 | Cloudflare | Bucket public temporaire pour amener les PDFs sur Render | `wget` depuis le shell Render. Tu peux supprimer après ingestion. |

## Le pipeline d'ingestion (le plus important à comprendre)

Tu pars d'un PDF officiel. À la fin, le contenu de ce PDF est cherchable et citable de **trois manières** :

```
PDF
 │
 ├──► (1) Extraction texte (pypdf + normalisation)
 │            │
 │            ▼
 │       Chunks article-aware (regex sur "Article N")
 │            │
 │            ├──► (a) Insertion Postgres : table `articles`
 │            │       (colonnes : numero, contenu, texteId, …)
 │            │
 │            ├──► (b) Indexation Meilisearch (full-text)
 │            │       (1 doc par article, ID = `<texteId>__<numero>`)
 │            │
 │            └──► (c) Embeddings + Chroma (sémantique)
 │                    (1 vecteur par chunk d'article)
 │
 └──► (2) Métadonnées (manifest.yaml) :
            slug, code, autorite, date, reference
            → recopiées dans chaque ligne / doc / chunk
```

**Pourquoi trois bases ?** Parce qu'elles répondent à trois questions différentes :

- *"Donne-moi l'article 54 du Code du travail"* → Postgres (clé primaire).
- *"Cherche le mot 'préavis' dans les textes"* → Meilisearch (full-text instantané, gère les fautes de frappe).
- *"Réponds à une question juridique en t'appuyant sur les textes pertinents"* → Chroma (top-K embeddings cosine, puis passage au LLM).

C'est exactement le pattern *poly-store* qu'on rencontre en data science : on choisit l'index selon la requête.

### L'étape critique : le chunking article-aware

C'est le truc le plus délicat du projet, et c'est entièrement fait à la main parce que les bibliothèques de chunking génériques **détruisent** la structure d'un texte juridique.

`backend/src/rag/chunking.py` contient :

- `_ARTICLE_HEADER_RE` — la regex qui détecte un en-tête d'article. Elle gère `Article N`, `Art. 12`, `Article 1er`, `Article 12 bis`, `Article 12-1`, et même les cas dégénérés où pypdf colle le numéro de page juste avant.
- `_is_internal_reference()` — filtre les références **internes** au texte (`l'article 12 ci-dessus`, `voir article`, `aux articles 12 et 13`) pour ne pas créer un faux article.
- `_normalize_article_number()` — collapse `1er` / `1 er` / `2ème` vers une forme canonique.
- `chunk_long_article()` — coupe à la phrase si un article dépasse `max_chars = 1500`.

Tests de référence (validés à la main, à figer un jour) :

| Entrée | Sortie attendue |
|---|---|
| `Article 1: Foo. Article 2 — Bar.` | 2 chunks |
| `Article 54: La. Dans l'article 54 ci-dessus, voir.` | 1 chunk |
| `aux articles 12 et 13 du code` | 0 chunk |
| `Cet article 12 vise. Article 13: New.` | 1 chunk (le second) |

Sur `code-travail-2021.pdf` : **417 segments / 415 numéros uniques / 2 doublons légitimes** (les annexes redémarrent à `Article 1`).

## Le pipeline d'une question Ama'IA (le RAG)

Le flux d'une question utilisateur, de bout en bout :

```
1. Utilisateur saisit "Quelle est la durée du préavis en cas de licenciement ?"
   │
2. POST /api/chat (Next, côté Vercel) — rate-limit par IP
   │   • on lit le profil (cookie)
   │   • on choisit la variante de prompt
   │
3. POST {LEGAL_AGENT_API_BASE_URL}/api/chat (Render, côté FastAPI)
   │
4. retriever.search() — hybride :
   │   • requête vectorielle Chroma (top-K = 12)
   │   • re-score lexical (recouvrement de tokens)
   │   • si la question demande explicitement des citations : K bumpé
   │
5. format_context_for_llm() — sérialise les extraits :
   │   [Extrait 1] Article 54, Code du travail …
   │   [Extrait 2] Article 73, Code du travail …
   │
6. anthropic.messages.create(model="claude-sonnet-4-6", …)
   │   • SYSTEM_PROMPT_FAST : refus si off-topic, citations [Article N, Code]
   │     obligatoires, disclaimer obligatoire
   │   • fallback claude-haiku-4-5 si le modèle principal échoue
   │
7. append_indexed_source_lines_if_needed() — si le LLM a oublié
   │   le format de citation, on patche la réponse.
   │
8. Réponse JSON renvoyée à Vercel, puis au navigateur.
```

**Ce qu'on ne fait pas (sciemment)** :

- **Pas d'agent multi-tool.** Une seule passe LLM. C'est moins « impressionnant » mais beaucoup plus prévisible et bon marché.
- **Pas de streaming SSE.** L'utilisateur attend la réponse complète. Permet de patcher la sortie avant affichage (citations, disclaimer).
- **Pas d'upload PDF côté utilisateur.** Volontaire — le RAG n'est utile que si le corpus est curé.

## Choix d'architecture importants à connaître

### Pourquoi Next.js et pas un simple React + API ?

- **SSR**, donc les pages de textes sont **indexables par Google** dès le premier rendu — capital pour une plateforme d'accès au droit.
- **Server Actions / Server Components** réduisent fortement la quantité de code défensif côté navigateur.

### Pourquoi 3 bases au lieu d'une seule (par exemple Postgres + pgvector partout) ?

- Meilisearch surclasse pgvector / Postgres FTS sur le full-text typo-tolérant.
- ChromaDB est beaucoup plus simple à warmup et à monitorer que pgvector côté RAG.
- Postgres reste la source de vérité « relationnelle » : si une base lâche, on peut **régénérer** Meili et Chroma à partir d'elle.

### Pourquoi un sélecteur de profil sans authentification ?

- L'auth utilisateur ralentit l'adoption. Le profil est un *modificateur de prompt*, pas une identité.
- Stockage : cookie (lu par le serveur pour le SSR) + `localStorage` (cohérence client). Pas de PII.

### Pourquoi pas de tests automatisés ?

- Pas de couverture utile pour le moment : la logique métier la plus délicate (chunking) est une regex testée à la main contre un PDF de référence. Les autres parties sont du CRUD.
- C'est un manque assumé qui figure dans `05-ameliorations-futures.md`.

## Conventions de code à connaître

- **Jamais de markdown dans les réponses Ama'IA.** Le prompt l'interdit ; le composant `LegalNoteRenderer` parse le texte et reconstruit du HTML sûr (paragraphes, listes, citations, disclaimer).
- **Une fonction pure ≠ un fichier `"use client"`.** Si tu veux qu'un Server Component appelle une fonction, mets-la dans un fichier *sans* la directive `"use client"`. Sinon : `TypeError: h is not a function` au SSR.
- **Tout secret est server-only.** Si une variable d'env commence par `NEXT_PUBLIC_`, elle finit dans le bundle JS du navigateur — donc lisible par tout le monde. À éviter sauf si la valeur est *vraiment* publique.
- **Les traductions doivent exister dans les deux fichiers.** `messages/fr.json` et `messages/en.json` ont des clés strictement parallèles. Sinon `next-intl` jette à l'exécution.
- **Un commit = un changement nommable.** Les messages suivent un préfixe `feat/fix/docs/chore/refactor` + scope (`feat(veille): …`).
