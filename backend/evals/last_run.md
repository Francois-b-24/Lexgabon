## Étape 3 — E5-base production — 2026-05-28 20:36 UTC

Gold set : 40 questions  |  seuil rag_min_score : appliqué

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.00 | 0.00 | 0.08 | 0.00 | ✗ | 21, 90, 140, 305, 206 |
| travail-conges-payes | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 223, 224, 90, 222, 227 |
| travail-preavis-rupture | travail | easy | 0.00 | 0.50 | 0.14 | 0.20 | ✗ | 81, 82, 86, 61, 21 |
| travail-conge-maternite | travail | medium | 1.00 | 1.00 | 1.00 | 0.92 | ✓ | 210, 223, 207, 208, 209 |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 21, 90, 95, 64, 20 |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 21, 20, 95, 64, 140 |
| travail-delegates-personnel | travail | easy | 0.33 | 0.33 | 1.00 | 0.47 | ✓ | 64, 330, 331, 31, 95 |
| travail-salaire-minimum | travail | medium | 0.67 | 0.67 | 1.00 | 0.70 | ✓ | 179, 90, 178, 305, 110 |
| fiscal-is-benefice | impots | medium | 0.00 | 0.33 | 0.17 | 0.17 | ✗ | 12, 116 bis, 14, 13, 23 |
| fiscal-tva-regime | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 90, 116 bis, 216, 165, 206 |
| fiscal-retenue-salaires | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 74, 161, 109, 119, 90 |
| fiscal-amortissements | impots | medium | 0.00 | 0.50 | 0.10 | 0.18 | ✗ | 196, 9, 26, 16, 42 |
| fiscal-prescription | impots | hard | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 166, 374, 656, 196, 3 bis |
| hydro-partage-production | hydrocarbures | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 7, 61, 66, 39, 1 |
| hydro-redevance-miniere | hydrocarbures | medium | 0.00 | 0.00 | 0.08 | 0.00 | ✗ | 207, 280, 222, 163, 110 |
| hydro-torchage-gaz | hydrocarbures | easy | 0.67 | 0.67 | 1.00 | 0.65 | ✓ | 125, 1, 129, 298, 126 |
| hydro-abandon-puits | hydrocarbures | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 187, 173, 170, 120, 182 |
| douane-valeur-en-douane | douane | medium | 0.33 | 0.67 | 0.20 | 0.35 | ✗ | 34, 33, 32, 23, 29 |
| douane-franchise | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 34, 12, 287, 328, 123 |
| douane-entrepot | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 177, 176, 196, 197, 108 |
| marche-appel-offres-ouvert | marche-public | easy | 0.00 | 0.33 | 0.11 | 0.14 | ✗ | 81, 123, 60, 235, 69 |
| marche-gre-a-gre | marche-public | medium | 0.50 | 1.00 | 0.20 | 0.44 | ✗ | 123, 52, 60, 227, 68 |
| marche-avance-demarrage | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 81, 123, 52, 60, 162 |
| marche-resiliation | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 228, 231, 229, 227, 123 |
| sante-pharmacie-ouverture | sante | easy | 0.00 | 0.00 | 0.09 | 0.00 | ✗ | 339, 3, 338, 311, 471 |
| sante-vaccination-obligations | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 516, 526, 613, 20, 3 |
| sante-secret-medical | sante | medium | 0.00 | 0.33 | 0.11 | 0.14 | ✗ | 6, 3, 438, 1, 295 |
| sante-don-organes | sante | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 191, 637, 471, 164, 146 |
| comm-reseaux-sociaux | communication | easy | 0.67 | 1.00 | 1.00 | 0.81 | ✓ | 1, 4, 37, 2, 17 |
| comm-presse-ligne | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 27, 2, 37, 2bis, 4 |
| comm-droit-rectification | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 2, 2bis, 37, 27, 1 |
| comm-publicite-commerciale | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 2, 2bis, 32, 4, 37 |

### Cross-domaine (attendu : vide après seuil)

| id | domaine | diff | renvoyés | ok |
| --- | --- | --- | --- | --- |
| hors-perimetre-civil-contrat | civil | easy | 12 | ✗ |
| hors-perimetre-penal-homicide | penal | easy | 12 | ✗ |
| hors-perimetre-famille-divorce | famille | easy | 12 | ✗ |
| hors-perimetre-fonction-publique | fonction_publique | easy | 12 | ✗ |
| hors-perimetre-hors-gabon | general | easy | 12 | ✗ |
| piege-article-abroge-smic | travail | trap | 12 | ✗ |
| piege-hors-gabon-ohada-bilan | commercial | trap | 12 | ✗ |
| piege-terminologie-trompeuse | civil | trap | 12 | ✗ |

### Récap par domaine

| domaine | n | R@5 | R@10 | MRR | NDCG@10 | top1 |
| --- | --- | --- | --- | --- | --- | --- |
| communication | 4 | 0.17 | 0.25 | 0.25 | 0.20 | 0.25 |
| douane | 3 | 0.11 | 0.22 | 0.07 | 0.12 | 0.00 |
| hydrocarbures | 4 | 0.17 | 0.17 | 0.27 | 0.16 | 0.25 |
| impots | 5 | 0.00 | 0.17 | 0.05 | 0.07 | 0.00 |
| marche-public | 4 | 0.12 | 0.33 | 0.08 | 0.15 | 0.00 |
| sante | 4 | 0.00 | 0.08 | 0.05 | 0.04 | 0.00 |
| travail | 8 | 0.25 | 0.31 | 0.40 | 0.29 | 0.38 |
| **GLOBAL** | 32 | **0.12** | **0.22** | **0.20** | **0.16** | **0.16** |

Cross-domaine correctement vides : **0/8**
