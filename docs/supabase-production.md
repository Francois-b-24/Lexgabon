# Supabase en production (LexGabon)

## Cohérence avec `NEXT_PUBLIC_SITE_URL`

1. Dans le dashboard Supabase → **Authentication** → **URL configuration** :
   - **Site URL** : même valeur que `NEXT_PUBLIC_SITE_URL` (ex. `https://www.votredomaine.ga`).
   - **Redirect URLs** : ajouter explicitement :
     - `https://www.votredomaine.ga/**`
     - `https://www.votredomaine.ga/fr/**` et `https://www.votredomaine.ga/en/**` si vous utilisez des chemins localisés pour la redirection post-login.
     - Les URL **Preview** Vercel si vous testez l’auth sur les déploiements preview (ex. `https://*.vercel.app/**` avec prudence).

2. Dans le code, le magic link utilise `emailRedirectTo: window.location.origin` ([`app/[locale]/(auth)/connexion/page.tsx`](../app/[locale]/(auth)/connexion/page.tsx)) : l’origine doit être autorisée dans Supabase.

3. Sur **Vercel**, définir `NEXT_PUBLIC_SITE_URL` sur l’URL publique finale pour que [`app/layout.tsx`](../app/layout.tsx) (`metadataBase`) et les métadonnées Open Graph restent corrects.

## Webhook

Si vous configurez un webhook vers `/api/webhooks/supabase`, définir `SUPABASE_WEBHOOK_SECRET` et envoyer la même valeur dans l’en-tête `x-supabase-signature` (configurer le secret côté Supabase / Edge Function selon votre flux).
