# 05 — Améliorations futures (backlog priorisé)

> Pas un calendrier — un menu. Chaque item a une **valeur**, un **effort estimé** (S/M/L) et un **prérequis**. À chaque reprise du projet, choisis 1 à 3 items selon ton temps et tes priorités.

## P0 — Sans cela, le projet ne tient pas la promesse

### Ingérer le reste du corpus juridique

- **Pourquoi P0** : aujourd'hui, seul le Code du travail est ingéré. Toute question hors droit du travail tombe en *fallback* : Ama'IA répond avec « index incomplet » et compte sur sa connaissance générale, ce qui contredit l'identité du projet (« réponses fondées sur le corpus indexé »).
- **Effort** : L (gros). Pas technique — fastidieux. Chaque PDF prend 10-30 min de setup (manifest + ingestion + vérif).
- **Périmètre minimum souhaitable** : Code civil, Code pénal, Code de commerce, Constitution, 4-5 actes uniformes OHADA majeurs (sociétés, sûretés, procédures collectives, droit commercial général).
- **Prérequis** : récupérer les PDFs officiels (Journal officiel Gabon + ohada.org).
- **Comment commencer** : voir `04-maintenance-runbook.md` section 1.

### Geler les tests de chunking

- **Pourquoi P0** : la regex de détection d'articles est le cœur fragile du projet. Tout changement peut casser silencieusement (un PDF qui passe de 415 à 380 chunks ne se voit pas tout de suite). Aujourd'hui ces invariants sont validés à la main.
- **Effort** : S. Créer un `backend/tests/test_chunking.py` avec `pytest` + 8-10 cas synthétiques (déjà listés dans `CLAUDE.md`).
- **Cas à figer** :
  - `Article 1: Foo. Article 2 — Bar.` → 2
  - `Article 54: La. Dans l'article 54 ci-dessus, voir.` → 1
  - `aux articles 12 et 13 du code` → 0
  - `Cet article 12 vise. Article 13: New.` → 1
  - Un test bout-en-bout sur `code-travail-2021.pdf` qui vérifie `len(chunks) == 417`.

## P1 — Améliore l'expérience sans révolution

### Streaming SSE pour Ama'IA

- **Valeur** : sur les réponses longues (1500+ tokens), l'utilisateur attend 10-15 secondes face à un écran figé. Le streaming donne l'illusion de l'instantanéité.
- **Effort** : M. Nécessite de modifier le contrat `/api/chat` (Edge runtime ou ReadableStream), le backend (SSE FastAPI), et la patch post-réponse (`append_indexed_source_lines_if_needed` doit devenir compatible streaming ou s'appliquer à la fin).
- **Trade-off** : le patch des citations est plus délicat — on ne peut plus modifier la réponse une fois affichée.

### Recherche sémantique grand public

- **Valeur** : la bascule sémantique existe mais elle est cachée. La mettre en avant (« Cherche par sens, pas par mot ») peut être un argument différenciant face aux moteurs juridiques classiques.
- **Effort** : S. Refondre l'UX de `/recherche` pour rendre la bascule visible et expliquer ce qu'elle fait.

### Activer l'authentification + favoris + alertes

- **Valeur** : permet de fidéliser. Aujourd'hui, l'utilisateur ferme l'onglet et perd tout.
- **Effort** : M. Supabase auth est branché — il faut câbler `/compte/favoris`, `/compte/alertes`, `/compte/historique` (les tables existent ou sont triviales à créer).
- **Pré-condition** : avoir une page `/methodologie` et des CGU qui couvrent le stockage des données utilisateurs.

### Mode comparaison de versions avec données réelles

- **Valeur** : la fonctionnalité existe (T2.5) mais elle attend que la table `versions_textes` soit peuplée pour de vrai. Aujourd'hui, c'est du mock pour démontrer l'UI.
- **Effort** : M. Définir une heuristique pour détecter qu'un nouveau PDF est une nouvelle *version* d'un texte existant (même `slug` racine + date plus récente), et lancer le diff à l'ingestion.

## P2 — Robustesse et observabilité

### Monitoring d'erreur (Sentry ou équivalent)

- **Valeur** : aujourd'hui, une erreur côté Vercel n'apparaît que si tu vas la chercher dans les logs. Sentry capture les exceptions automatiquement avec stack trace et contexte utilisateur.
- **Effort** : S. Installation + DSN + sample rate. Couvre Next + FastAPI.

### Métriques d'usage du chatbot

- **Valeur** : savoir combien de questions sont posées, combien tombent en `has_citation: false`, quelles thématiques sont les plus demandées. Pilote les décisions d'extension de corpus.
- **Effort** : M. Simple table `chat_logs` (question hashée, profil, qualityFlags, latence) + petite dashboard Supabase ou Metabase.
- **Attention RGPD** : ne pas stocker les questions en clair, ou seulement avec consentement explicite.

### Tests d'intégration end-to-end

- **Valeur** : aujourd'hui, on découvre les régressions en prod (cf. bug `TypeError: h is not a function`). Une suite Playwright minimaliste (5-10 scénarios : landing, recherche, ouverture d'un texte, question chatbot) attraperait 90 % des régressions critiques.
- **Effort** : M. Playwright + GitHub Actions.

### Health checks plus fins

- **Valeur** : `/api/chat/health` aujourd'hui dit juste « backend joignable ». Étendre pour vérifier que Chroma a au moins N chunks, que le modèle Anthropic répond, etc.
- **Effort** : S.

## P3 — Améliorations qualitatives

### Améliorer le ranking RAG

- **Valeur** : on peut passer du `multilingual-e5-small` à `e5-base` (qualité ↑, RAM ↑). Ou ajouter un *reranker* dédié (`bge-reranker-multilingual`).
- **Effort** : M. **Ré-ingestion totale obligatoire** si on change le modèle d'embeddings.

### Cache des réponses chatbot

- **Valeur** : un cache LRU sur (profile, question_normalized) éviterait les appels Anthropic redondants. Économique sur les questions FAQ.
- **Effort** : S si on accepte un TTL agressif. Plus délicat si on veut invalider lors d'une ré-ingestion.

### Améliorations SEO

- **Valeur** : les pages de textes sont indexables mais la stratégie SEO peut être affinée (titres optimisés, meta-descriptions par article, sitemap par domaine).
- **Effort** : S à M.

### Internationalisation au-delà du FR/EN

- **Effort** : faible techniquement, élevé éditorialement. Si on veut viser CEMAC anglophone (Cameroun anglophone, Guinée Équatoriale), l'EN est déjà là. Pour PT (Guinée Équatoriale), tout est à traduire.

### PWA / offline

- **Valeur** : un avocat dans un tribunal sans 4G qui veut consulter un article.
- **Effort** : M. Service worker + cache des textes consultés récemment.

## P4 — Nouveautés à explorer

### Annotations communautaires

- **Idée** : permettre aux juristes de **commenter** un article (jurisprudence, doctrine, retours d'expérience). Modération nécessaire.
- **Effort** : L (CRUD + modération + UX).
- **Risque** : coût humain de modération.

### Génération de modèles de documents

- **Idée** : Ama'IA aide à pré-rédiger une mise en demeure, un contrat de travail, etc., en se basant sur le corpus.
- **Effort** : L. Nouveau pipeline LLM, sortie structurée, mécanique de templates.

### API publique

- **Idée** : exposer l'API d'Ama'IA à des partenaires (cabinets, universités). Plan de monétisation possible.
- **Effort** : M technique, L côté juridique/contrats.

### Comparateur multi-codes

- **Idée** : « En droit du travail, comment le Gabon traite-t-il X par rapport au Cameroun ? ». Requiert d'ingérer les corpus de plusieurs pays — gros chantier.

## Dette technique à surveiller

Ce ne sont pas des features, mais des points de vigilance.

| Item | Sévérité | Symptôme à surveiller |
|---|---|---|
| Pas de tests automatisés | Élevée | Régressions silencieuses (cf. P0 ci-dessus). |
| Profil utilisateur en cookie/localStorage | Moyenne | Bascule délicate si on active l'auth — il faudra migrer le cookie. |
| `manifest.yaml` à la main | Moyenne | Source d'erreurs humaines (slug en double, domaine non listé). Un script de validation aiderait. |
| Chroma sur un disque Render | Moyenne | Si l'instance Render est recréée et le volume mal monté, le corpus disparaît. Procédure de restore documentée. |
| Pas de monitoring sur le cron | Moyenne | Si le cron tombe en panne, la veille n'est plus rafraîchie sans alerte. Cf. P2 monitoring. |
| `OFFICIAL_VEILLE_FEED` codé en dur | Faible | Pas grave tant qu'il sert de fallback. À retirer un jour quand le scraper est mature. |

## Pour la prochaine session de travail — checklist

Si tu reviens dans 3 mois et que tu veux maximiser l'impact en 1 journée :

1. **Mâtin** — Ingérer 1 ou 2 nouveaux codes (Code civil, Code pénal). Refait l'exercice « bout-en-bout » et te remet en jambes.
2. **Après-midi** — Écrire `backend/tests/test_chunking.py` avec pytest. Figer les 8 cas listés ci-dessus. Brancher un GitHub Actions pour les exécuter à chaque PR.
3. **Soir** — Installer Sentry sur le front (10 minutes). Tu verras à la prochaine erreur prod ce qui s'est passé.

C'est le combo qui rapporte le plus pour le moins d'effort.
