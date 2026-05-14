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

Vérifier : `answer`, `sources`, `quality`, `session_id`, `tools_used`.

## UI

1. Ouvrir **`/fr/chatbot`** (ou `/en/chatbot`).
2. Vérifier le bandeau d’état (backend joignable).
3. Poser une question (≥ 3 caractères) ; la réponse doit s’afficher en texte brut avec sources et indicateurs de qualité.

## Effacer la session

```bash
curl -sS -X POST "http://localhost:3000/api/session/clear" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"VOTRE_SESSION_ID"}' | jq .
```
