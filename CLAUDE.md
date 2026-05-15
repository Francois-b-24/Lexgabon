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
npx drizzle-kit push              # apply schema to DATABASE_URL
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

There is **no test suite** in either stack.

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

If you change the regex or boundary rules, run the embedded sanity test in `chunks_from_pdf` on `corpus/pdfs/code-travail-2021.pdf` and check the article count stays around **417 with ≤ 2 duplicates** and that the synthetic regression cases in past sessions still pass (`Article 1: Foo. Article 2 — Bar.` → 2 ; `aux articles 12 et 13 du code` → 0 ; etc.).

## Corpus and metadata invariants

Every chunk in Chroma carries: `citation` (rebuilt as `<Code> — Article N (<reference>)`), `source_key` (sha256 of relpath, used for idempotent re-ingestion), `kind` (`corpus_pdf` or `fetch`), and when available `numero_article`, `titre_section`, `code`, `reference`, `autorite`, `date`, `slug`, `url`, `fetch_source_id`. The `SourceItem` Pydantic shape and the `SourceList` React component both rely on these names — keep them aligned.

For PDFs, declare metadata in `backend/corpus/pdfs/manifest.yaml` (`titre`, `code`, `autorite`, `date`, `reference`, optional `duplicate_of`). For scraped URLs, the same keys live in `backend/corpus/sources.yaml` alongside the `allowed_domains` allowlist — only those hosts are fetched.

`verify_corpus.py` targets: **≥ 5000 chunks, ≥ 80 % with `numero_article`**. Below those, the audit raises explicit alerts.

## Front routing and i18n

- Locales `fr` (default) and `en` declared in `i18n/routing.ts`; `middleware.ts` enforces the `/fr` and `/en` prefixes.
- `i18n/navigation.ts` exports a `Link` wrapper that auto-prefixes the locale — **use `<a>` for external URLs** (e.g. landing hero CTA to `alin-africa.com`).
- Page groups under `app/[locale]/`: `(app)` for authenticated chatbot / veille / recherche / textes / compte, `(auth)` for Supabase magic-link, `(marketing)` for landing & legal.
- Translations in `messages/fr.json` + `messages/en.json` — every key referenced via `useTranslations("Namespace")` must exist in **both** files or `next-intl` throws at runtime.

## Data layer

- Drizzle schema in `lib/db/schema.ts` (Postgres + pgvector for the `chunks` table). `drizzle.config.ts` reads `DATABASE_URL`.
- Supabase used only for auth (magic link) + webhooks. Browser side: `lib/supabase/client.ts`. Server side: `lib/supabase/server.ts`.
- Meilisearch backs `/api/search` for full-text. The chatbot does **not** read from Meilisearch — it queries Chroma directly via the backend.

## Deployment notes

- Front on **Vercel** — `LEGAL_AGENT_API_BASE_URL` is a *server-only* env var (do not prefix with `NEXT_PUBLIC_`). `/api/chat` has `maxDuration = 300`.
- Backend on **Render** — set `WARM_RAG_ON_STARTUP=true` on instances ≥ ~1 GB RAM (otherwise the embedding model load races the `/health` check). Mount a persistent volume for `CHROMA_PATH`. Re-ingest the corpus on first deploy: `PYTHONPATH=. python3 scripts/ingest_pdfs.py --skip-duplicates` from the running instance.
- Operational docs live in `docs/` — read `docs/chatbot-render-production.md` and `docs/deployment-vercel.md` before touching deployment config.
