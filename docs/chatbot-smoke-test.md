# Smoke test — Chatbot (proxy Next + FastAPI)

## Prérequis

1. Backend Python démarré (port **8000** par défaut), avec **`ANTHROPIC_API_KEY`** défini.
2. Next.js avec **`LEGAL_AGENT_API_BASE_URL`** pointant vers ce backend (ex. `http://127.0.0.1:8000` en local).

Docker : `docker compose up backend` puis `LEGAL_AGENT_API_BASE_URL=http://127.0.0.1:8000 npm run dev`.

## Santé

```bash
curl -sS "http://localhost:3000/api/chat/health" | jq .
```

Attendu : `{ "ok": true, "backend": { "status": "ok" } }` si le proxy atteint FastAPI.

## Conversation JSON

```bash
curl -sS -X POST "http://localhost:3000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"question":"Qu est-ce que le droit OHADA au Gabon ?","history":[{"role":"assistant","content":"Bonjour."}],"session_id":null}' | jq .
```

Vérifier : `answer`, `sources`, `quality`, `session_id`, `tools_used` (en mode rapide par défaut, `tools_used` contient souvent `["fast_rag"]`).

## Flux SSE (proxy Next → backend)

L’interface utilise **`POST /api/chat/stream`** via le proxy [`app/api/chat/stream/route.ts`](../app/api/chat/stream/route.ts).

```bash
curl -sS -N -X POST "http://localhost:3000/api/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"question":"Qu est-ce que l OHADA ?","history":[],"session_id":null}' | head -c 2000
```

Attendu : lignes `data: {"type":"token",...}` puis un événement `data: {"type":"done",...}`.

## UI

1. Ouvrir **`/fr/chatbot`** (ou `/en/chatbot`).
2. Vérifier le bandeau d’état (backend joignable).
3. Poser une question (≥ 3 caractères) ; le texte de la réponse doit apparaître **au fil de l’eau** (SSE), puis sources et indicateurs de qualité une fois le flux terminé.

## Effacer la session

```bash
curl -sS -X POST "http://localhost:3000/api/session/clear" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"VOTRE_SESSION_ID"}' | jq .
```
