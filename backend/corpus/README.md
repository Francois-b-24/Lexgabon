# Corpus RAG (PDF + sources officielles)

Alimente la collection Chroma principale **`droit_gabonais`**. Chunking **article-aware** : la regex détecte `Article N`, `Art. 12`, `Article 1er`, `Article 12 bis`, etc., et propage `numero_article` + `titre_section` aux métadonnées.

## PDF (`pdfs/`)

- Déposer des fichiers **`.pdf`** (texte sélectionnable ; pas d'OCR dans le pipeline).
- Déclarer leurs métadonnées dans `pdfs/manifest.yaml` (titre, code, autorité, date, reference, `duplicate_of`).
- Hash SHA256 par fichier : déduplication automatique même si vous renommez le fichier.
- Par défaut, les PDF ne sont **pas versionnés** (`pdfs/.gitignore`) — retirez la règle ou utilisez Git LFS si vous voulez les committer.

## Sources web (`sources.yaml`)

- **Allowlist** stricte : seuls les domaines listés dans `allowed_domains` sont fetchés.
- Chaque entrée : `id`, `url`, `label`, `kind` (`html` | `pdf`) ; champs optionnels : `code`, `reference`, `autorite`, `date` (recopiés en métadonnées).
- Respect des conditions d'usage : délai entre requêtes (`--delay 1.5s` par défaut). Le document officiel publié fait seul foi.

## Ingestion

Depuis `backend/` avec `PYTHONPATH=.` :

```bash
# Pipeline complet (seed + scraping + PDFs)
python3 scripts/ingest_corpus.py --verify

# OU étape par étape :
python3 scripts/ingest_pdfs.py --skip-duplicates
python3 scripts/fetch_official_sources.py
python3 scripts/ingest_chroma.py --jsonl data/scraped_chunks.jsonl
```

Audit du résultat : `python3 scripts/verify_corpus.py` (volume, articles distincts, top sources, alertes, requête test).

Les scripts utilisent le même `CHROMA_PATH` et `CHROMA_EMBEDDING_MODEL` que l'API (`.env` ou variables d'environnement).
