# Changelog

Toutes les modifications notables de LexGabon. Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [Phase 1 + 2 + dettes — mai 2026]

### Phase 1 — Quick wins juristes

#### T1.1 — Rendu Ama'IA en note juridique
- Backend : `response_parser.py` transforme la sortie LLM brute en `StructuredAnswer` (paragraphes courts + refs résolues + disclaimer isolé) via regex `[Article N, Code]` et `[Source : …]`.
- Front : nouveau composant `LegalNoteRenderer` qui rend chaque paragraphe + badges refs + disclaimer en HTML sémantique sans markdown.
- `SYSTEM_PROMPT_FAST` durci : interdit gras, puces markdown, titres ; force paragraphes 3-5 lignes et guillemets français pour les citations textuelles.
- Vitest setup minimal (jsdom + testing-library) + pytest (parser + chunking).

#### T1.2 — Recherche SSR avec filtres
- Page `/recherche` réécrite en server component pur (form HTML method=GET, zéro JS pour la base).
- `lib/search-service.ts` : `parseSearchFilters` (validation stricte sources/dates/domaines), `runSearch` (mode `fulltext` Meilisearch ou `semantic` proxy backend).
- Filtres : source, type, domaine, date_from, date_to, pagination, basculement mode.
- URL canoniques partageables, fallback gracieux sur `mockVeille` si index indisponible.

#### T1.3 — Pages texte SSR + table `articles`
- Nouvelle table Drizzle `articles` (numero, contenu, position, titre_section, refs_croisees jsonb) avec index unique `(texte_id, numero)`.
- Route `/textes/[source]/[slug]` SSR avec metadata Open Graph + JSON-LD `Legislation`, sidebar méta, table des matières avec ancres `#article-N`, bouton « Copier la citation ».
- Mapping `lib/sources.ts` : code DB (`JOG`, `OHADA`…) ↔ slug URL (`jo-ga`, `ohada`…).
- Pipeline ingestion : `ingest_pdfs.py` → JSONL → `db:ingest-articles` (upsert idempotent).
- Redirect 308 de `/textes/[slug]` legacy vers `/textes/jo-ga/[slug]`.

#### T1.4 — Page Méthodologie
- Route `/methodologie` (groupe marketing, SSR statique).
- Sections : principe directeur (« Le JO fait foi »), collecte (5 étapes), vérification, fréquence, engagements (pas d'IA générative, pas de paywall, pas de tracking), limites, sources primaires suivies, contact.
- JSON-LD `AboutPage`.

#### T1.5 — Fondations SEO
- `app/sitemap.ts` dynamique (locales × pages statiques + textes ingérés en DB).
- `app/robots.ts` (disallow `/api/`, `/_next/`).
- `lib/seo.ts` : `getSiteUrl`, `getOrgJsonLd` (Organization ALIN), `getWebsiteJsonLd` (SearchAction).
- `app/[locale]/layout.tsx` : `generateMetadata` global + JSON-LD Organization + WebSite injectés.

#### T1.6 — Sélecteur de profil
- `lib/user-profile.ts` + `hooks/use-user-profile.ts` : cookie + localStorage isomorphes (aucun lien Supabase).
- `ProfileSwitcher` dans le header (3 profils : avocat, juriste, étudiant).
- Backend `build_system_prompt(profile)` : préfixe le prompt système avec un bloc d'adaptation de ton. Règles dures (citations, périmètre, disclaimer) inchangées.

### Phase 2 — Différenciation juridique

#### T2.1 — Un embedding par article
- `chunking.py` / `pdf_parser.py` : paramètre `one_per_article=True` → un Chunk Chroma = un article complet (415 articles pour le Code du travail).
- Métadonnées Chroma enrichies : `text_id`, `article_id`, `source_code`, `type`, `domaine`.
- Citation copiable normalisée côté front (« Art. N de <Code> (<reference>) ») via `lib/article-citation.ts`.
- Nouvelle colonne `textes.domaineSlug`.

#### T2.2 — Suggestions par domaine et profil
- `lib/amaia-suggestions.ts` : 10 suggestions typées sur 8 domaines, helper `getSuggestionsForProfile`.
- `QuestionSuggestions` : grille responsive 1/2/3 colonnes affichée avant la première question, filtrée par profil actif.

#### T2.3 — Sources cliquables + popover
- `app/api/articles/route.ts` : nouvelle route `GET /api/articles?slug=X&numero=Y` (rate-limit 60/min).
- `RefBadgeLink` (nouveau client component) remplace les badges statiques : Link interne + popover lazy (fetch au survol après 220 ms ou au clic). Position responsive, ESC + click-outside.
- `LegalNoteRenderer` devient client (encapsule `RefBadgeLink`).

#### T2.4 — Veille dynamique
- Table Drizzle `veille_items` + index `(source, date_publication)`.
- Page `/veille` SSR (form GET pour la recherche, filtres en `<Link>` SSR, `VeilleGrid` client pour favoris localStorage + partage Web Share).
- Route RSS `/<locale>/veille/rss.xml` (RSS 2.0 conforme, cache CDN 15 min).
- Cron `/api/ingest/cron` sync `OFFICIAL_VEILLE_FEED → veille_items` (idempotent par slug).

#### T2.5 — Comparaison de versions de textes
- Table Drizzle `text_versions` (snapshot complet via `contenu_json` JSONB).
- `lib/text-diff.ts` : algorithme LCS pur, zéro dépendance, diff intra-article phrase-par-phrase.
- Page `/textes/[source]/[slug]/comparer` : sélecteur de version × 2, diff visuel WCAG AA (couleurs + préfixes `+`/`−`/`~` + balises `<ins>`/`<del>` sémantiques).
- Seed `db:seed-text-versions` : texte fictif « Loi de finances 2024 » avec 2 versions pour démonstration.

### Dettes techniques traitées

#### D1 — Indexation Meilisearch enrichie
- L'index `articles` (au lieu de `textes`) contient désormais 1 document = 1 article, avec le contenu complet en searchableAttribute.
- Une recherche « préavis » remonte directement les articles 82, 67, 75 du Code du travail avec lien `#article-N`.
- IDs Meili composites `<texteId>__<numero>` (Meili impose `[a-zA-Z0-9-_]`).

#### D3 — Mentions légales et CGU
- Tous les `[À compléter : …]` retirés. Textes neutres institutionnels (ALIN, contact@alin-africa.com, hébergement Vercel + Render, droits RGPD).
- Détail à compléter par un avocat (raison sociale, juridiction compétente, politique de confidentialité).

#### D5 — Table `domaines` peuplée
- 8 catégories (civil, pénal, commercial, travail, administratif, fiscal, famille, social) avec libellés FR/EN.
- Textes existants automatiquement liés via `textes.domaines[]` à partir de `domaineSlug`.

#### D6 — Endpoint `/api/corpus/status` dynamique
- Route FastAPI qui lit Chroma + manifest.yaml + sources.yaml et expose `total_chunks`, `articles_distincts`, `sources[]`, `last_updated`.
- Page Méthodologie consomme cet endpoint en SSR avec `revalidate: 3600`, fallback gracieux sur les données statiques.

#### D7 — Scraper veille intelligent
- Route FastAPI `POST /api/veille/scrape` (protégée par `CRON_SECRET`).
- Adapter OHADA opérationnel (parse l'index actes-uniformes-en-vigueur).
- Adapter JO Gabon opérationnel (liens internes `/{id}-{ref}/` de la home).
- Squelettes CEMAC / COBAC / CIMA à enrichir au cas par cas.
- Cron Next mis à jour : appelle d'abord le scraper backend, fallback sur `OFFICIAL_VEILLE_FEED` si injoignable.

### Bugfixes notables
- `fix(textes): extraire buildArticleCitation hors d'un fichier "use client"` — corrige une `TypeError: h is not a function` en SSR provoquée par l'import d'une fonction pure depuis un composant client.
- `fix(ui): header mobile compact` — supprime la superposition logo/profil/burger sur les petits écrans (profile pill → icône seule en mobile).

### Nettoyage
- Suppression de `app/api/textes/[slug]/route.ts` (route jamais appelée).
- Suppression de `mockTexteDetail` + helpers associés (~45 lignes mortes).
- Suppression de l'import inutilisé `textes` dans `seed-domaines.ts`.

### Stats finales
- **50 tests Vitest** + **29 tests Pytest** verts.
- **415 articles** ingérés (Code du travail), accessibles via recherche full-text + recherche sémantique.
- TypeScript strict, ESLint 0 erreur, build Next propre, fonctions Vercel sous 200 kB First Load JS.
