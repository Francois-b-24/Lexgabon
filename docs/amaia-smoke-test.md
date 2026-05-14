# Smoke test Ama'IA (pré-publication)

## 1. Vérifier la configuration sur Vercel

Dans **Project → Settings → Environment Variables** (Production) :

- `ANTHROPIC_API_KEY` : obligatoire pour que le chatbot réponde.
- `ANTHROPIC_MODEL` : optionnel ; sinon le défaut du code est utilisé (`claude-sonnet-4-20250514`).

## 2. Point de contrôle HTTP (sans envoyer de message)

Après déploiement :

```bash
curl -sS "https://VOTRE_DOMAINE/api/amaia" | jq .
```

Réponse attendue :

- `anthropicConfigured: true` si la clé est présente sur l’instance.
- `model` : identifiant du modèle utilisé (ou `null` si non configuré).

Réponse `anthropicConfigured: false` : le bandeau sur `/fr/amaia` affichera « Clé API non configurée » ; les requêtes `POST` renverront **503** avec un message explicite.

## 3. Test manuel dans le navigateur

1. Ouvrir **`/fr/amaia`** (ou `/en/amaia`).
2. Vérifier que le bandeau d’état passe de « Vérification… » à **« Assistant configuré »** (ou équivalent EN) si la clé est définie.
3. Poser une question courte (ex. « Qu’est-ce que l’OHADA ? »).
4. Vérifier que la réponse **s’affiche en flux** (texte qui s’allonge) jusqu’à la fin.
5. (Optionnel) Sur un environnement **sans** `ANTHROPIC_API_KEY` : envoyer un message et vérifier un message d’erreur **lisible** (pas d’erreur brute du navigateur).

## 4. Contexte documentaire (qualitatif)

Si `DATABASE_URL` et des **chunks** sont peuplés, ou si **Meilisearch** est configuré avec l’index `textes`, les réponses peuvent s’appuyer sur le retrieval. Sans base ni index, le modèle répond quand même avec un contexte vide (comportement attendu au MVP).
