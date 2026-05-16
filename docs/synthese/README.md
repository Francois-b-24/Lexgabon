# Synthèses LexGabon — guide de lecture

Cinq documents complémentaires, conçus pour être lus à la suite (45-60 minutes au total) ou consultés à la demande.

| # | Document | Quand le lire |
|---|---|---|
| 01 | [Bilan du projet](./01-bilan-projet.md) | Première lecture, ou pour expliquer LexGabon à un tiers en 10 minutes. |
| 02 | [Architecture technique](./02-architecture-technique.md) | Avant de modifier du code structurel ou avant un debug profond. |
| 03 | [Pages et fonctionnalités](./03-pages-et-fonctionnalites.md) | Quand tu te demandes « où est la page X » ou « quelle route gère Y ». |
| 04 | [Runbook de maintenance](./04-maintenance-runbook.md) | Pour toute action manuelle : ajouter un PDF, déployer, débugger. |
| 05 | [Améliorations futures](./05-ameliorations-futures.md) | Quand tu reprends le projet après une pause et que tu veux choisir quoi faire. |

## Convertir en PDF

Aucune dépendance dans le repo. Trois options selon ton outil :

```bash
# Option 1 — pandoc (recommandé, fait de jolis PDF)
brew install pandoc basictex   # macOS
for f in docs/synthese/0*.md; do
  pandoc "$f" -o "${f%.md}.pdf" --pdf-engine=pdflatex
done
```

```bash
# Option 2 — VS Code : extension "Markdown PDF" → clic-droit → Export as PDF.
```

```bash
# Option 3 — Typora / Obsidian : ouvrir le fichier → Fichier → Exporter → PDF.
```

Les 5 PDF résultants tiennent chacun entre 5 et 15 pages.
