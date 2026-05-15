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
  -d '{"question":"Quel est le délai de préavis d un cadre au Gabon ?","history":[],"session_id":null}' | jq .
```

Vérifier dans la réponse :

- `answer` non vide, contenant au moins une citation au format `[Article N, …]` ou `[Source : …]` et l'avertissement final obligatoire ;
- `sources` : liste de 0–12 extraits avec `citation`, `numero_article`, éventuel `slug` ;
- `quality.has_citation` = `true` et `quality.has_disclaimer` = `true` ;
- `session_id` retourné (à réutiliser pour l'historique).

## Test off-topic (périmètre strict)

```bash
curl -sS -X POST "http://localhost:3000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"question":"Quelle est la recette du poulet nyembwe ?","history":[],"session_id":null}' | jq .answer
```

Attendu : refus poli « Cette question dépasse le périmètre du droit gabonais. […] » suivi de l'avertissement final. Aucune source.

## UI

1. Ouvrir **`/fr/chatbot`** (ou `/en/chatbot`).
2. Poser une question juridique ; la réponse doit s'afficher avec, en dessous, jusqu'à 5 sources compactes (badge `Article N` + lien vers la fiche texte si `slug` disponible).
3. Cliquer « Nouvelle conversation » pour repartir d'un message d'accueil sobre.
