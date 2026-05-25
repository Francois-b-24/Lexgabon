# Guide — Ajouter des PDF au corpus Lexgabon

Procédure complète pour ingérer un nouveau texte juridique (PDF) dans la base
vectorielle Chroma utilisée par le chatbot. À garder à portée de main : c'est
la seule opération « régulière » sur le corpus.

> Tout se passe dans `backend/`. Le front (Next.js) ne touche jamais directement
> à Chroma — il interroge la FastAPI via `LEGAL_AGENT_API_BASE_URL`.

---

## 1. Pré-requis (une seule fois)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...        # nécessaire pour les tests post-ingestion
```

Vérifier que `CHROMA_PATH` (défini dans `backend/src/config.py` ou via `.env`)
pointe bien sur `./data/chroma` (ou le volume persistant en prod).

---

## 2. Déposer le PDF

1. Copier le fichier dans `backend/corpus/pdfs/`.
   - Nom court, en kebab-case, sans accents : `code-civil-1972.pdf`,
     `acte-uniforme-societes-commerciales.pdf`.
   - Si le PDF est un scan image (non sélectionnable au copier-coller), il
     faut d'abord l'OCRiser (ex. `ocrmypdf input.pdf output.pdf`).
     Pypdf n'extrait rien d'un PDF image.

2. Vérifier rapidement la qualité de l'extraction :
   ```bash
   cd backend
   PYTHONPATH=. python3 -c "from src.rag.pdf_parser import parse_pdf_articles; \
     import pathlib; print(len(parse_pdf_articles(pathlib.Path('corpus/pdfs/MON-FICHIER.pdf'))))"
   ```
   Un Code complet doit retourner plusieurs centaines d'articles. Si tu obtiens
   `0` ou `1`, le PDF est probablement un scan ou le texte est encodé bizarrement
   → OCR obligatoire.

---

## 3. Déclarer les métadonnées dans le manifest

Éditer `backend/corpus/pdfs/manifest.yaml` et ajouter une entrée :

```yaml
files:
  code-civil-1972.pdf:
    slug: "code-civil-1972"              # unique, kebab-case, utilisé dans les URLs /textes/
    source_code: "JOG"                   # JOG (Journal Officiel Gabon), OHADA, CEMAC, COBAC…
    type: "loi"                          # loi | ordonnance | décret | acte uniforme | constitution
    domaine: "civil"                     # civil | penal | commercial | travail | administratif
                                         # | fiscal | famille | social
    titre: "Code civil de la République gabonaise"
    code: "Code civil"                   # libellé court utilisé dans la citation LLM
    autorite: "République gabonaise"
    date: "1972-07-29"                   # ISO YYYY-MM-DD (ou YYYY si la date exacte est inconnue)
    reference: "Loi n° 15/72 du 29 juillet 1972"
    source: "https://journal-officiel.ga/..."   # facultatif
```

**Doublons** : si tu réimportes le même PDF sous un autre nom, ajoute
`duplicate_of: "code-civil-1972.pdf"` — il sera ingéré sous le même slug et
ne polluera pas la base.

Domaines valides : voir `SUPPORTED_DOMAINES` dans `lib/search-service.ts` côté
front. Si tu introduis un nouveau domaine, il faut le déclarer là-bas aussi.

---

## 4. Ingérer

```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. python3 scripts/ingest_pdfs.py --skip-duplicates
```

Le script est **idempotent** : il supprime les anciens chunks de la même
`source_key` avant de réinsérer. Tu peux le relancer autant que tu veux.

Logs attendus :
```
INFO Ingestion code-civil-1972.pdf → 412 chunks (412 articles, 0 doublons)
INFO Total collection: 829 chunks
```

Si tu vois `WARN  manifest manquant pour XXX.pdf`, c'est que l'étape 3 a été
oubliée — l'ingestion continue avec des métadonnées par défaut (déconseillé).

---

## 5. Vérifier

```bash
PYTHONPATH=. python3 scripts/verify_corpus.py
```

Cibles santé :
- **≥ 5000 chunks** au total (le corpus complet ; actuellement on est très en dessous).
- **≥ 80 %** des chunks avec un `numero_article`.

Le script affiche aussi un échantillon de requêtes — utile pour confirmer que
le nouveau texte est bien retrouvé.

Test manuel via l'API locale :
```bash
PYTHONPATH=. uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
curl -s http://127.0.0.1:8000/api/chat -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"Que dit le Code civil sur la nullité d un contrat ?"}]}' \
  | jq '.sources[0:3]'
```

Tu dois voir des extraits du nouveau code dans `sources[]`, avec
`citation = "Code civil — Article N (Loi n° ...)"`.

---

## 6. (Optionnel) Synchroniser Postgres + Meilisearch

Le chatbot n'a besoin que de Chroma. Mais si tu veux que le texte apparaisse
dans la recherche full-text (`/recherche`) et dans les pages `/textes/...` :

```bash
# Depuis la racine du repo (front)
npm run db:ingest-articles    # upsert dans la table `articles` (Postgres)
npm run search:index          # reconstruit l'index Meilisearch `articles`
```

Ces deux scripts lisent depuis le même corpus chunké, donc l'ordre est :
1. PDF déposé + manifest mis à jour
2. `ingest_pdfs.py` (Chroma)
3. `npm run db:ingest-articles` (Postgres)
4. `npm run search:index` (Meilisearch)

---

## 7. Déployer en production

En prod (Render), le volume persistant `CHROMA_PATH` survit aux redéploiements
mais **ne contient pas** le nouveau PDF tant que tu ne réingères pas. Deux options :

**A. Ré-ingestion sur l'instance Render** (recommandé)
1. Commit + push du PDF et du manifest sur `main`.
2. Render redéploie automatiquement.
3. Ouvrir un shell sur l'instance (`Render → Shell`) et lancer :
   ```bash
   cd /app/backend
   PYTHONPATH=. python3 scripts/ingest_pdfs.py --skip-duplicates
   ```

**B. Ré-ingestion locale + sync du volume** — possible mais plus fragile,
préférer A.

Côté Vercel (front), rien à faire : le proxy `/api/chat` ne dépend pas du
contenu du corpus, juste de l'URL backend.

---

## 8. Pièges fréquents

- **PDF scanné non OCRisé** → 0 articles extraits, à OCRiser avant tout.
- **Slug non unique** → deux textes différents avec le même `slug` se marchent
  dessus dans Postgres. Toujours vérifier qu'il est unique dans le manifest.
- **Chunking cassé** (numérotation bizarre, articles découpés au mauvais endroit)
  → c'est presque toujours un PDF avec une mise en page exotique. Comparer le
  texte extrait (`parse_pdf_articles`) au PDF source et, si besoin, ajuster
  `_ARTICLE_HEADER_RE` dans `src/rag/chunking.py` (touche risquée — voir
  les invariants documentés dans `CLAUDE.md`).
- **`citation` vide ou mal formatée dans le front** → champ `code` manquant
  dans le manifest. Le LLM ne saura pas citer correctement.
- **Domaine inconnu côté front** → le filtre par domaine ignorera le texte.
  Ajouter le domaine dans `SUPPORTED_DOMAINES` (`lib/search-service.ts`) et
  dans `messages/fr.json` + `messages/en.json` si tu veux l'afficher.

---

## 9. Référence rapide

| Action | Commande |
|---|---|
| Ingestion locale | `PYTHONPATH=. python3 scripts/ingest_pdfs.py --skip-duplicates` |
| Audit corpus | `PYTHONPATH=. python3 scripts/verify_corpus.py` |
| Test une requête | `curl -s localhost:8000/api/chat -d '{"messages":[{"role":"user","content":"..."}]}'` |
| Sync Postgres | `npm run db:ingest-articles` |
| Sync Meilisearch | `npm run search:index` |
| Reset corpus complet | `rm -rf backend/data/chroma && relancer ingest_pdfs.py` |

---

## 10. Checklist à coller dans la PR

- [ ] PDF déposé dans `backend/corpus/pdfs/`, nom kebab-case
- [ ] Entrée ajoutée dans `manifest.yaml` (slug unique, domaine valide)
- [ ] `ingest_pdfs.py` exécuté sans erreur, chunks > 0
- [ ] `verify_corpus.py` passe (ou seuils dégradés justifiés)
- [ ] Test manuel sur `/api/chat` : le nouveau code apparaît dans `sources[]`
- [ ] (Si recherche/textes) `db:ingest-articles` + `search:index` lancés
- [ ] Ré-ingestion planifiée sur Render après merge
