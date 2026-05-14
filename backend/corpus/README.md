# Corpus RAG (PDF + sources officielles)

Ce répertoire sert à **alimenter la collection Chroma principale** (`droit_gabonais`), distincte des PDF téléversés par session (`uploads_session`).

## PDF (`pdfs/`)

- Déposez des fichiers **`.pdf`** (texte sélectionnable de préférence ; pas d’OCR dans le pipeline actuel).
- Par défaut, les PDF ne sont **pas versionnés** (voir `pdfs/.gitignore`) pour limiter la taille du dépôt. Retirez la règle `*.pdf` ou utilisez **Git LFS** si vous souhaitez les committer.
- Taille conseillée : raisonnable pour votre RAM au moment de l’ingestion (voir `MAX_UPLOAD_PDF_BYTES` côté API upload ; le script corpus n’a pas la même limite par défaut, restez modéré).

## Sources web (`sources.yaml`)

- Liste **allowlist** : seules les URLs dont le **domaine** figure dans `allowed_domains` sont récupérées.
- Chaque entrée : `id`, `url`, `label`, `kind` (`html` ou `pdf`).
- **Respect** des conditions d’usage des sites, délais entre requêtes, et rappel : **seul le document officiel publié fait foi** ; le contenu extrait sert au RAG à titre indicatif.

## Ingestion

Depuis `backend/` avec `PYTHONPATH=.` :

```bash
python3 scripts/ingest_corpus.py
```

Options : `--skip-seed`, `--skip-fetch`, `--skip-pdfs`, `--verify`. Contrôle post-ingestion : `python3 scripts/verify_chroma_index.py`. Détails : [`../README.md`](../README.md).

Les scripts utilisent le même **`CHROMA_PATH`** et **`CHROMA_EMBEDDING_MODEL`** que l’API (fichier `.env` ou variables d’environnement).
