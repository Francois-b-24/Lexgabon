# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo layout

Two cooperating apps in the same repo:

- **Next.js 14 (App Router)** at the root — public site, authenticated app, and API routes that **proxy** to the backend.
- **FastAPI Python service** in `backend/` — chatbot engine (RAG + one Anthropic call), Chroma vector store, corpus ingestion scripts. Never expose this URL to the browser: the only way the front talks to it is via `LEGAL_AGENT_API_BASE_URL` consumed server-side in `app/api/chat/route.ts`.

Shared infra in `docker-compose.yml`: Postgres 16 (with pgvector), Meilisearch 1.11, the FastAPI backend.

## Commands

### Front (root)

```bash
npm install
cp .env.example .env.local        # set LEGAL_AGENT_API_BASE_URL=http://127.0.0.1:8000 etc.
npm run dev                       # localhost:3000, middleware redirects to /fr or /en
npm run lint
npm run build                     # production bundle; type-checks via Next
npx tsc --noEmit                  # standalone TS check
npx drizzle-kit generate          # produce migration from lib/db/schema.ts
npx drizzle-kit push              # apply schema to DATABASE_URL (requires direct Supabase connection, not pooler — see Supabase Dashboard → Settings → Database → Direct connection)
```

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY=...
PYTHONPATH=. uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Corpus ingestion (writes to ./data/chroma — same CHROMA_PATH as the API)
PYTHONPATH=. python3 scripts/ingest_pdfs.py --skip-duplicates   # PDFs in corpus/pdfs/ + manifest.yaml
PYTHONPATH=. python3 scripts/fetch_official_sources.py          # URLs in corpus/sources.yaml -> data/scraped_chunks.jsonl
PYTHONPATH=. python3 scripts/ingest_chroma.py --jsonl data/scraped_chunks.jsonl
PYTHONPATH=. python3 scripts/ingest_corpus.py [--verify]        # one-shot orchestrator
PYTHONPATH=. python3 scripts/verify_corpus.py                   # audit + sample query
```

Docker shortcut: `docker compose up backend` (postgres / meilisearch can be started the same way).

### Common npm scripts (root)

```bash
npm run test                   # vitest (one-shot). The harness is wired, but coverage is currently empty.
npm run test:watch             # vitest watch mode
npm run db:ingest-articles     # reads chunked corpus → upserts the `articles` table in Postgres
npm run db:seed-domaines       # populates the reference `domaines` rows
npm run db:seed-veille         # seed the veille table from OFFICIAL_VEILLE_FEED
npm run db:seed-text-versions  # seed `versions_textes` (used by /textes/[…]/comparer demo)
npm run search:index           # rebuilds the Meilisearch `articles` index from Postgres
```

These rely on `DATABASE_URL` / `MEILISEARCH_*` env vars being set. They are idempotent.

**Important**: `npm run` scripts do not load `.env.local` automatically. Pass vars explicitly:
```bash
DATABASE_URL="..." MEILISEARCH_HOST="..." MEILISEARCH_API_KEY="..." npm run search:index
```

There is no meaningful test coverage today. The vitest harness exists but is mostly empty — the hand-validated chunking invariants below are still the only de-facto regression suite.

## Chatbot pipeline (the most important architecture)

User question → `app/api/chat/route.ts` (rate-limit per IP + locale-agnostic) → FastAPI `POST /api/chat` (`backend/src/routes/chat.py`) → `backend/src/agent/chat_engine.run_chat`:

1. `src/rag/retriever.search` does a hybrid search (vectorial + lexical re-score, optional rerank) on the Chroma collection `droit_gabonais`. Default `RAG_TOP_K=12`. When `question_seeks_citations()` is true (heuristic on the prompt) the effective k is bumped.
2. `format_context_for_llm` serialises each extract with `[Extrait N]`, the citation line, and the `Article / disposition : N` header when present.
3. `SYSTEM_PROMPT_FAST` in `src/agent/prompts.py` is strict: refuse off-topic in one canonical sentence, force `[Article N, <Code>]` citations when an extract carries `numero_article`, mandatory final disclaimer.
4. `src/agent/llm.create_text_only` calls `ANTHROPIC_MODEL` (default `claude-sonnet-4-6`) with fallback to `ANTHROPIC_MODEL_FALLBACK` (`claude-haiku-4-5-20251001`).
5. `append_indexed_source_lines_if_needed` patches the answer if it has sources but missed the citation format. `Quality` flags (`has_citation`, `has_disclaimer`) and the source list are returned to the front.

There is **no multi-tool agent loop** and **no SSE streaming**. The mode-flag `use_full_agent_chat` and the upload-PDF/ingest-URL routes have all been removed. Do not reintroduce them without revisiting the system prompt.

## Article-aware chunking (corpus quality depends on it)

`src/rag/chunking.py` is hand-tuned for French legal PDFs that pypdf flattens into one massive line:

- `_ARTICLE_HEADER_RE` matches `Article N`, `Art. 12`, `Article 1er`, `Article 12 bis`, `Article 12-1`, even when the previous word is glued (page-number leak, section title without trailing punctuation).
- `_is_internal_reference()` filters out backward references (`l'article 12 ci-dessus`, `voir article`, `aux articles 12 et 13`) using a list of French prefixes.
- `_normalize_article_number()` collapses `1er`, `1 er`, `2ème`, etc.
- Articles longer than `max_chars` (1500) are split with `chunk_long_article` at sentence boundaries, keeping `Article N (suite) — ` as a prefix.
- `src/rag/pdf_parser.py` adds the pypdf extraction + soft-hyphen / NBSP / line-rejoin normalisation before splitting.

If you change the regex or boundary rules, run `chunks_from_pdf` on `corpus/pdfs/code-travail-2021.pdf` and check the result stays around **417 segments / 415 unique numbers / 2 expected duplicates** (the duplicates are legitimate — the file's annexes restart numbering at `Article 1`). Synthetic regressions to keep passing: `Article 1: Foo. Article 2 — Bar.` → 2 ; `Article 54: La. Dans l'article 54 ci-dessus, voir.` → 1 ; `aux articles 12 et 13 du code` → 0 ; `Cet article 12 vise. Article 13: New.` → 1. **These tests live nowhere** — they were validated by hand. If you touch chunking heavily, consider freezing them in a `tests/` directory.

## Corpus and metadata invariants

Every chunk in Chroma carries: `citation` (rebuilt as `<Code> — Article N (<reference>)`), `source_key` (sha256 of relpath, used for idempotent re-ingestion), `kind` (`corpus_pdf` or `fetch`), and when available `numero_article`, `titre_section`, `code`, `reference`, `autorite`, `date`, `slug`, `url`, `fetch_source_id`. The `SourceItem` Pydantic shape and the `SourceList` React component both rely on these names — keep them aligned.

For PDFs, declare metadata in `backend/corpus/pdfs/manifest.yaml` (`titre`, `code`, `autorite`, `date`, `reference`, optional `duplicate_of`). For scraped URLs, the same keys live in `backend/corpus/sources.yaml` alongside the `allowed_domains` allowlist — only those hosts are fetched.

`verify_corpus.py` targets: **≥ 5000 chunks, ≥ 80 % with `numero_article`**. Below those, the audit raises explicit alerts.

**Current corpus reality**: 7 codes indexed (~3 277 chunks) — Code du travail, Code général des impôts, Code de la santé publique, Code des douanes (CEMAC), Code des hydrocarbures, Code du marché public, Code de la communication. Codes civil, pénal, OHADA uniform acts, Constitution, CEMAC/COBAC regulations are still missing. RAG outside these 7 codes will fall back to model knowledge with the "Sources indexées : index incomplet" disclaimer.

## Front routing and i18n

- Locales `fr` (default) and `en` declared in `i18n/routing.ts`; `middleware.ts` enforces the `/fr` and `/en` prefixes.
- `i18n/navigation.ts` exports a `Link` wrapper that auto-prefixes the locale — **use `<a>` for external URLs** (e.g. landing hero CTA to `alin-africa.com`).
- Page groups under `app/[locale]/`: `(app)` for authenticated chatbot / veille / recherche / textes / compte, `(auth)` for Supabase magic-link, `(marketing)` for landing & legal.
- Translations in `messages/fr.json` + `messages/en.json` — every key referenced via `useTranslations("Namespace")` must exist in **both** files or `next-intl` throws at runtime.

## Data layer

- Drizzle schema in `lib/db/schema.ts` (Postgres + pgvector for the `chunks` table). `drizzle.config.ts` reads `DATABASE_URL`.
- Supabase used only for auth (magic link) + webhooks. Browser side: `lib/supabase/client.ts`. Server side: `lib/supabase/server.ts`.
- Meilisearch backs `/api/search` and the `/recherche` page for full-text. The index is named **`articles`** and is **1 document per article** (not per text). Document IDs follow the shape `<texteId>__<numero>` with `__` as separator (Meili rejects `:`, spaces in numbers become `-`). Rebuild from Postgres with `npm run search:index`. The live article count is exposed via `getIndexedArticlesCount()` in `lib/search-service.ts` and displayed on the landing and search pages.
- Filter checkboxes on `/recherche` auto-submit on change via `components/recherche/filter-form-client.tsx` (a `"use client"` component that holds its own `<form>` with a `formRef.current?.requestSubmit()` on each checkbox `onChange`).
- The chatbot does **not** read from Meilisearch — it queries Chroma directly via the backend.

## Frontend gotchas (subtle, will bite you)

- **Never export a pure function from a `"use client"` file** if you want a Server Component to import it. The build succeeds; SSR explodes with `TypeError: h is not a function` because the server receives a client-component proxy instead of the function. Pure helpers live in plain modules (e.g. `lib/article-citation.ts`); `"use client"` is reserved for files that need a React hook or browser API.
- **Use `<a href="…">` for external URLs.** `i18n/navigation.ts` exports a `Link` wrapper that auto-prefixes the active locale — fine for internal routes, wrong for anything off-domain (landing CTA to `alin-africa.com`, ohada.org links, etc.).
- **Translations must be parallel.** Every key referenced via `useTranslations("Namespace")` must exist in both `messages/fr.json` and `messages/en.json` — `next-intl` throws at request time if a locale is missing a key.
- **No markdown in Ama'IA answers.** The prompt forbids it and `LegalNoteRenderer` parses the plain-text response into safe HTML (paragraphs, lists, citations, disclaimer). Reintroducing markdown means reworking the renderer.

## Deployment notes

- Front on **Vercel** — `LEGAL_AGENT_API_BASE_URL` is a *server-only* env var (do not prefix with `NEXT_PUBLIC_`). `/api/chat` has `maxDuration = 300`.
- Backend on **Render** — set `WARM_RAG_ON_STARTUP=true` on instances ≥ ~1 GB RAM (otherwise the embedding model load races the `/health` check). Mount a persistent volume for `CHROMA_PATH`. Re-ingest the corpus on first deploy: `PYTHONPATH=. python3 scripts/ingest_pdfs.py --skip-duplicates` from the running instance.
- **Health endpoints** — FastAPI exposes `GET /health` (`backend/src/app.py:62`, returns `{status: ok}` lazily without warming Chroma). The Next proxy `app/api/chat/health/route.ts` is the user-facing entry: it returns a JSON envelope with diagnostic hints when the backend is unreachable, timed out (~4 min 40), or replied non-200. Useful for Vercel + Render smoke tests.
- **Daily cron** — `vercel.json` triggers `GET /api/ingest/cron` every day at 03:00 UTC. Authenticated via `CRON_SECRET` (Bearer header). The Next route calls the backend scraper `POST /api/veille/scrape` (also `CRON_SECRET`-gated) and **falls back** to the static `OFFICIAL_VEILLE_FEED` if the backend is unreachable. The response envelope carries `source: "scrape" | "fallback"` — useful to confirm which path ran.
- **Dynamic corpus status** — backend exposes `GET /api/corpus/status` (total chunks, distinct articles, sources, last_updated). The Next side reads it from `lib/corpus-status.ts` with `revalidate: 3600`; if the backend is down, the landing falls back to static counts from `OFFICIAL_VEILLE_FEED`.
- Operational docs live in `docs/`:
  - Step-by-step deployment / debugging / runbook: `docs/synthese/04-maintenance-runbook.md` (start here when reviving the project).
  - Big-picture architecture and rationale: `docs/synthese/02-architecture-technique.md`.
  - Page-by-page tour: `docs/synthese/03-pages-et-fonctionnalites.md`.
  - Render specifics: `docs/chatbot-render-production.md` and `docs/deployment-vercel.md`.
