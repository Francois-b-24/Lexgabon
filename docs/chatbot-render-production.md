# Checklist Render — chatbot fiable et réactif

Sans ces points, le chemin « rapide » (RAG + 1 LLM) peut encore subir des cold starts longs ou des OOM.

## Instance

- **Type** : au minimum une instance avec **RAM confortable** pour Python + `sentence-transformers` + Chroma (souvent **≥ 2 Go** selon corpus ; tester avec les logs).
- **Mise en veille** : désactiver la veille prolongée ou utiliser un plan **toujours actif** — sinon le premier `GET /health` ou `POST /api/chat` après silence peut dépasser les timeouts des proxies (Vercel).
- **Région** : choisir une région proche de vos utilisateurs et cohérente avec Vercel si possible.

## Build / start

- **Root directory** : `backend` si le dépôt est un monorepo.
- **Commande de démarrage** (exemple) :  
  `cd backend && PYTHONPATH=. uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Health check** Render : chemin **`/health`** (réponse JSON rapide une fois le service chaud).

## Variables d’environnement (backend)

- `ANTHROPIC_API_KEY` (obligatoire)
- `FRONTEND_ORIGINS` : inclure `https://<votre-domaine-vercel>.vercel.app` (sans slash final)
- `CHROMA_PATH` : aligné sur le volume persistant si vous utilisez un disque Render
- `WARM_RAG_ON_STARTUP` : `true` dès ~1 Go de RAM (préchauffe Chroma au boot, supprime la latence d'init sur la 1re requête) ; `false` sur petites instances (<1 Go) pour éviter les timeouts `/health` (voir [`backend/README.md`](../backend/README.md))

## Diagnostic

1. Pendant une question lente : **Logs** → repérer `OOM`, `Killed`, erreurs Anthropic, ou blocages Chroma.
2. `GET https://<service>.onrender.com/health` depuis le navigateur : doit répondre en quelques secondes une fois le service réveillé.
3. Vercel : `GET /api/chat/health` doit retourner `ok: true` lorsque Render est joignable.
