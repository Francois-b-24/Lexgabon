## Étape 4 — Cross-encoder bge-reranker-v2-m3 — 2026-05-28 20:51 UTC

Gold set : 40 questions  |  seuil rag_min_score : appliqué

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | 21, 25, 206, 140, 1 |
| travail-conges-payes | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 222, 224, 223, 182, 227 |
| travail-preavis-rupture | travail | easy | 0.00 | 0.50 | 0.17 | 0.22 | ✗ | 86, 82, 81, 61, 60 |
| travail-conge-maternite | travail | medium | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | 210, 207, 208, 223, 211 |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 330, 81, 90, 64, 95 |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 393, 156, 128, 305, 21 |
| travail-delegates-personnel | travail | easy | 0.33 | 0.33 | 0.50 | 0.30 | ✗ | 95, 64, 336, 331, 330 |
| travail-salaire-minimum | travail | medium | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | 179, 293, 110, 178, 90 |
| fiscal-is-benefice | impots | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | 164, 161, 40, 11, 14 |
| fiscal-tva-regime | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 221, 248, 165, 90, 206 |
| fiscal-retenue-salaires | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 74, 90, 161, 95, 119 |
| fiscal-amortissements | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 196, 42, 16, 9, 38 |
| fiscal-prescription | impots | hard | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 656, 166, 462, 551, 374 |
| hydro-partage-production | hydrocarbures | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 61, 66, 222, 34, 197 |
| hydro-redevance-miniere | hydrocarbures | medium | 0.50 | 0.50 | 0.20 | 0.24 | ✗ | 207, 217, 280, 222, 104 |
| hydro-torchage-gaz | hydrocarbures | easy | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | 125, 264, 127, 126, 1 |
| hydro-abandon-puits | hydrocarbures | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 170, 173, 87, 97, 120 |
| douane-valeur-en-douane | douane | medium | 0.67 | 1.00 | 0.33 | 0.58 | ✗ | 34, 32, 30, 33, 29 |
| douane-franchise | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 12, 34, 276, 287, 21 |
| douane-entrepot | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 176, 196, 177, 185, 198 |
| marche-appel-offres-ouvert | marche-public | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 81, 119, 60, 2, 117 |
| marche-gre-a-gre | marche-public | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | 68, 189, 227, 52, 119 |
| marche-avance-demarrage | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 162, 2, 81, 235, 52 |
| marche-resiliation | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 227, 229, 228, 185, 225 |
| sante-pharmacie-ouverture | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 339, 332, 3, 338, 304 |
| sante-vaccination-obligations | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 516, 20, 613, 517, 17 |
| sante-secret-medical | sante | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | 3, 436, 281, 26, 304 |
| sante-don-organes | sante | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 191, 195, 167, 637, 164 |
| comm-reseaux-sociaux | communication | easy | 1.00 | 1.00 | 1.00 | 0.91 | ✓ | 1, 4, 2, 3, 37 |
| comm-presse-ligne | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 2, 27, 25, 2bis, 22 |
| comm-droit-rectification | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 27, 2bis, 2, 15 |
| comm-publicite-commerciale | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 2, 2bis, 3, 32 |

### Cross-domaine (attendu : vide après seuil)

| id | domaine | diff | renvoyés | ok |
| --- | --- | --- | --- | --- |
| hors-perimetre-civil-contrat | civil | easy | 6 | ✗ |
| hors-perimetre-penal-homicide | penal | easy | 6 | ✗ |
| hors-perimetre-famille-divorce | famille | easy | 6 | ✗ |
| hors-perimetre-fonction-publique | fonction_publique | easy | 6 | ✗ |
| hors-perimetre-hors-gabon | general | easy | 6 | ✗ |
| piege-article-abroge-smic | travail | trap | 6 | ✗ |
| piege-hors-gabon-ohada-bilan | commercial | trap | 6 | ✗ |
| piege-terminologie-trompeuse | civil | trap | 6 | ✗ |

### Récap par domaine

| domaine | n | R@5 | R@10 | MRR | NDCG@10 | top1 |
| --- | --- | --- | --- | --- | --- | --- |
| communication | 4 | 0.25 | 0.25 | 0.25 | 0.23 | 0.25 |
| douane | 3 | 0.22 | 0.33 | 0.11 | 0.19 | 0.00 |
| hydrocarbures | 4 | 0.29 | 0.29 | 0.30 | 0.23 | 0.25 |
| impots | 5 | 0.07 | 0.07 | 0.05 | 0.04 | 0.00 |
| marche-public | 4 | 0.12 | 0.12 | 0.25 | 0.15 | 0.25 |
| sante | 4 | 0.08 | 0.08 | 0.06 | 0.05 | 0.00 |
| travail | 8 | 0.31 | 0.38 | 0.40 | 0.32 | 0.25 |
| **GLOBAL** | 32 | **0.19** | **0.22** | **0.23** | **0.19** | **0.16** |

Cross-domaine correctement vides : **0/8**
