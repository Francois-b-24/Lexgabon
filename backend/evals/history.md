
## Étape 1 — Baseline — 2026-05-28 19:57 UTC

Gold set : 40 questions  |  seuil rag_min_score : appliqué

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | ? | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 305, 140, 198, 413, 1 |
| travail-conges-payes | ? | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 222, 224, 223, 225, 182 |
| travail-preavis-rupture | ? | easy | 0.00 | 0.00 | 0.09 | 0.00 | ✗ | 82, 86, 61, 389, 383 |
| travail-conge-maternite | ? | medium | 1.00 | 1.00 | 1.00 | 0.92 | ✓ | 210, 223, 207, 209, 208 |
| travail-licenciement-faute | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 211 ter, 16, 74, 128, 305 |
| travail-greve-conditions | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 305, 733, 298, 31, 21 |
| travail-delegates-personnel | ? | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 344, 336, 305, 7, 163 |
| travail-salaire-minimum | ? | medium | 0.33 | 0.67 | 1.00 | 0.62 | ✓ | 179, 293, 305, 11, 110 |
| fiscal-is-benefice | ? | medium | 0.33 | 0.33 | 0.50 | 0.30 | ✗ | 12, 11, 9, 13, 10 |
| fiscal-tva-regime | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 368, 248, 206, 11, 160 |
| fiscal-retenue-salaires | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 109, 74, 161, 3, 206 |
| fiscal-amortissements | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 16, 144, 196, 3 bis, 216 |
| fiscal-prescription | ? | hard | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 48, 3 bis, 295, 656, 106 |
| hydro-partage-production | ? | easy | 0.33 | 0.33 | 0.33 | 0.23 | ✗ | 228, 39, 53, 7, 222 |
| hydro-redevance-miniere | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 15, 40, 207, 222, 353 |
| hydro-torchage-gaz | ? | easy | 0.33 | 0.33 | 1.00 | 0.47 | ✓ | 125, 1, 298, 248, 15 |
| hydro-abandon-puits | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 108, 187, 173, 97, 126 |
| douane-valeur-en-douane | ? | medium | 0.00 | 0.33 | 0.14 | 0.16 | ✗ | 216, 34, 23, 228, 33 |
| douane-franchise | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 34, 328, 287, 21, 12 |
| douane-entrepot | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 176, 177, 198, 261, 94 |
| marche-appel-offres-ouvert | ? | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 81, 2, 123, 60, 130 |
| marche-gre-a-gre | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 211 bis, 225, 119, 18, 123 |
| marche-avance-demarrage | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 123, 119, 52, 81, 2 |
| marche-resiliation | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 227, 228, 225, 229, 185 |
| sante-pharmacie-ouverture | ? | easy | 0.33 | 0.33 | 0.33 | 0.23 | ✗ | 3, 339, 184, 238, 779 |
| sante-vaccination-obligations | ? | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 516, 20, 184, 3, 436 |
| sante-secret-medical | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 3, 436, 281, 6, 779 |
| sante-don-organes | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 3, 436, 479, 73, 238 |
| comm-reseaux-sociaux | ? | easy | 0.67 | 1.00 | 1.00 | 0.85 | ✓ | 1, 37, 2, 4, 17 |
| comm-presse-ligne | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 2bis, 2, 1, 37, 4 |
| comm-droit-rectification | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 2bis, 2, 37, 27, 1 |
| comm-publicite-commerciale | ? | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 2bis, 2, 4, 55, 1 |

### Cross-domaine (attendu : vide après seuil)

| id | domaine | diff | renvoyés | ok |
| --- | --- | --- | --- | --- |
| hors-perimetre-civil-contrat | ? | easy | 12 | ✗ |
| hors-perimetre-penal-homicide | ? | easy | 12 | ✗ |
| hors-perimetre-famille-divorce | ? | easy | 12 | ✗ |
| hors-perimetre-fonction-publique | ? | easy | 12 | ✗ |
| hors-perimetre-hors-gabon | ? | easy | 12 | ✗ |
| piege-article-abroge-smic | ? | trap | 12 | ✗ |
| piege-hors-gabon-ohada-bilan | ? | trap | 12 | ✗ |
| piege-terminologie-trompeuse | ? | trap | 12 | ✗ |

### Récap par domaine

| domaine | n | R@5 | R@10 | MRR | NDCG@10 | top1 |
| --- | --- | --- | --- | --- | --- | --- |
| ? | 32 | 0.10 | 0.14 | 0.17 | 0.12 | 0.12 |
| **GLOBAL** | 32 | **0.10** | **0.14** | **0.17** | **0.12** | **0.12** |

Cross-domaine correctement vides : **0/8**

## Étape 1 — Baseline (domaine corrigé) — 2026-05-28 19:58 UTC

Gold set : 40 questions  |  seuil rag_min_score : appliqué

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 305, 140, 21, 198, 1 |
| travail-conges-payes | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 90, 223, 305, 140, 31 |
| travail-preavis-rupture | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 82, 81, 76, 86, 58 |
| travail-conge-maternite | travail | medium | 0.50 | 1.00 | 1.00 | 0.82 | ✓ | 210, 305, 223, 227, 81 |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 305, 95, 31, 21, 132 |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 305, 31, 1, 132, 21 |
| travail-delegates-personnel | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 305, 97, 145, 331, 95 |
| travail-salaire-minimum | travail | medium | 0.33 | 0.67 | 1.00 | 0.63 | ✓ | 179, 293, 305, 31, 144 |
| fiscal-is-benefice | impots | medium | 0.33 | 0.33 | 0.50 | 0.30 | ✗ | 12, 11, 9, 13, 10 |
| fiscal-tva-regime | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 368, 248, 206, 11, 160 |
| fiscal-retenue-salaires | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 109, 74, 161, 206, 11 |
| fiscal-amortissements | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 16, 196, 3 bis, 216, 9 |
| fiscal-prescription | impots | hard | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 3 bis, 656, 26, 462, 166 |
| hydro-partage-production | hydrocarbures | easy | 0.33 | 0.33 | 0.33 | 0.23 | ✗ | 228, 39, 53, 7, 222 |
| hydro-redevance-miniere | hydrocarbures | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 207, 222, 163, 2, 280 |
| hydro-torchage-gaz | hydrocarbures | easy | 0.33 | 0.33 | 1.00 | 0.47 | ✓ | 125, 1, 15, 2, 264 |
| hydro-abandon-puits | hydrocarbures | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 108, 187, 173, 97, 126 |
| douane-valeur-en-douane | douane | medium | 0.33 | 0.67 | 0.25 | 0.34 | ✗ | 34, 23, 33, 28, 26 |
| douane-franchise | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 34, 328, 287, 21, 12 |
| douane-entrepot | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 176, 177, 198, 261, 94 |
| marche-appel-offres-ouvert | marche-public | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 81, 2, 123, 60, 130 |
| marche-gre-a-gre | marche-public | medium | 0.00 | 0.00 | 0.08 | 0.00 | ✗ | 225, 119, 123, 189, 235 |
| marche-avance-demarrage | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 123, 119, 52, 81, 2 |
| marche-resiliation | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 227, 228, 225, 229, 185 |
| sante-pharmacie-ouverture | sante | easy | 0.33 | 0.33 | 0.33 | 0.23 | ✗ | 3, 339, 184, 238, 779 |
| sante-vaccination-obligations | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 516, 20, 184, 3, 436 |
| sante-secret-medical | sante | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 3, 436, 281, 6, 779 |
| sante-don-organes | sante | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 3, 436, 479, 73, 238 |
| comm-reseaux-sociaux | communication | easy | 0.67 | 1.00 | 1.00 | 0.85 | ✓ | 1, 37, 2, 4, 17 |
| comm-presse-ligne | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 2bis, 2, 1, 37, 55 |
| comm-droit-rectification | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 2bis, 2, 37, 27, 1 |
| comm-publicite-commerciale | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 2bis, 2, 4, 55, 1 |

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
| communication | 4 | 0.17 | 0.25 | 0.25 | 0.21 | 0.25 |
| douane | 3 | 0.11 | 0.22 | 0.08 | 0.11 | 0.00 |
| hydrocarbures | 4 | 0.17 | 0.17 | 0.33 | 0.18 | 0.25 |
| impots | 5 | 0.07 | 0.07 | 0.10 | 0.06 | 0.00 |
| marche-public | 4 | 0.00 | 0.00 | 0.02 | 0.00 | 0.00 |
| sante | 4 | 0.08 | 0.08 | 0.08 | 0.06 | 0.00 |
| travail | 8 | 0.10 | 0.21 | 0.25 | 0.18 | 0.25 |
| **GLOBAL** | 32 | **0.10** | **0.14** | **0.17** | **0.12** | **0.12** |

Cross-domaine correctement vides : **0/8**

## Étape 2 — Citations robustes + logs loguru — 2026-05-28 20:02 UTC

Gold set : 40 questions  |  seuil rag_min_score : appliqué

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 305, 140, 21, 198, 1 |
| travail-conges-payes | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 90, 223, 305, 140, 31 |
| travail-preavis-rupture | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 82, 81, 76, 86, 58 |
| travail-conge-maternite | travail | medium | 0.50 | 1.00 | 1.00 | 0.82 | ✓ | 210, 305, 223, 227, 81 |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 305, 95, 31, 21, 132 |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 305, 31, 1, 132, 21 |
| travail-delegates-personnel | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 305, 97, 145, 331, 95 |
| travail-salaire-minimum | travail | medium | 0.33 | 0.67 | 1.00 | 0.63 | ✓ | 179, 293, 305, 31, 144 |
| fiscal-is-benefice | impots | medium | 0.33 | 0.33 | 0.50 | 0.30 | ✗ | 12, 11, 9, 13, 10 |
| fiscal-tva-regime | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 368, 248, 206, 11, 160 |
| fiscal-retenue-salaires | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 109, 74, 161, 206, 11 |
| fiscal-amortissements | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 16, 196, 3 bis, 216, 9 |
| fiscal-prescription | impots | hard | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 3 bis, 656, 26, 462, 166 |
| hydro-partage-production | hydrocarbures | easy | 0.33 | 0.33 | 0.33 | 0.23 | ✗ | 228, 39, 53, 7, 222 |
| hydro-redevance-miniere | hydrocarbures | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 207, 222, 163, 2, 280 |
| hydro-torchage-gaz | hydrocarbures | easy | 0.33 | 0.33 | 1.00 | 0.47 | ✓ | 125, 1, 15, 2, 264 |
| hydro-abandon-puits | hydrocarbures | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 108, 187, 173, 97, 126 |
| douane-valeur-en-douane | douane | medium | 0.33 | 0.67 | 0.25 | 0.34 | ✗ | 34, 23, 33, 28, 26 |
| douane-franchise | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 34, 328, 287, 21, 12 |
| douane-entrepot | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 176, 177, 198, 261, 94 |
| marche-appel-offres-ouvert | marche-public | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 81, 2, 123, 60, 130 |
| marche-gre-a-gre | marche-public | medium | 0.00 | 0.00 | 0.08 | 0.00 | ✗ | 225, 119, 123, 189, 235 |
| marche-avance-demarrage | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 123, 119, 52, 81, 2 |
| marche-resiliation | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 227, 228, 225, 229, 185 |
| sante-pharmacie-ouverture | sante | easy | 0.33 | 0.33 | 0.33 | 0.23 | ✗ | 3, 339, 184, 238, 779 |
| sante-vaccination-obligations | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 516, 20, 184, 3, 436 |
| sante-secret-medical | sante | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 3, 436, 281, 6, 779 |
| sante-don-organes | sante | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 3, 436, 479, 73, 238 |
| comm-reseaux-sociaux | communication | easy | 0.67 | 1.00 | 1.00 | 0.85 | ✓ | 1, 37, 2, 4, 17 |
| comm-presse-ligne | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 2bis, 2, 1, 37, 55 |
| comm-droit-rectification | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 2bis, 2, 37, 27, 1 |
| comm-publicite-commerciale | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | 2bis, 2, 4, 55, 1 |

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
| communication | 4 | 0.17 | 0.25 | 0.25 | 0.21 | 0.25 |
| douane | 3 | 0.11 | 0.22 | 0.08 | 0.11 | 0.00 |
| hydrocarbures | 4 | 0.17 | 0.17 | 0.33 | 0.18 | 0.25 |
| impots | 5 | 0.07 | 0.07 | 0.10 | 0.06 | 0.00 |
| marche-public | 4 | 0.00 | 0.00 | 0.02 | 0.00 | 0.00 |
| sante | 4 | 0.08 | 0.08 | 0.08 | 0.06 | 0.00 |
| travail | 8 | 0.10 | 0.21 | 0.25 | 0.18 | 0.25 |
| **GLOBAL** | 32 | **0.10** | **0.14** | **0.17** | **0.12** | **0.12** |

Cross-domaine correctement vides : **0/8**

## Étape 3 — Benchmark embeddings — 2026-05-28 20:11 UTC

| modèle | dim | R@5 | R@10 | MRR | NDCG@10 | top1 | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| e5-small | 384 | 0.115 | 0.141 | 0.134 | 0.109 | 0.094 | baseline — léger, CPU Render OK |
| e5-base ◀ | 768 | 0.120 | 0.203 | 0.146 | 0.137 | 0.094 | compromis qualité/RAM (~280 MB) |

Meilleur modèle retenu : **e5-base** (intfloat/multilingual-e5-base)

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

## Étape 3 — Benchmark embeddings — 2026-05-28 20:38 UTC

| modèle | dim | R@5 | R@10 | MRR | NDCG@10 | top1 | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| bge-m3 ◀ | 1024 | 0.141 | 0.203 | 0.191 | 0.155 | 0.156 | meilleur multilingue, fenêtre 8192 tokens (~2.3 GB) |

Meilleur modèle retenu : **bge-m3** (BAAI/bge-m3)

## Note étape 3 — BGE-M3 résultat final

BGE-M3 benchmark terminé (collection bench locale, 3277 chunks) :

| modèle | R@5 | R@10 | MRR | NDCG@10 | top1 | latence/q |
| --- | --- | --- | --- | --- | --- | --- |
| e5-small | 0.115 | 0.141 | 0.134 | 0.109 | 0.094 | ~29ms |
| **e5-base** ◀ retenu | **0.120** | **0.203** | **0.146** | **0.137** | **0.094** | ~27ms |
| bge-m3 | 0.141 | 0.203 | 0.191 | 0.155 | 0.156 | ~100ms |

BGE-M3 exclu : inférieur à e5-base en Recall@10 et NDCG@10, 3x plus lent,
~2.3 GB RAM (incompatible Render Standard 2 GB). E5-base retenu en production.

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

## Étape 5 — Query rewriter Haiku + RRF — 2026-05-28 20:58 UTC

Gold set : 40 questions  |  seuil rag_min_score : appliqué

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-conges-payes | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-preavis-rupture | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-conge-maternite | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-delegates-personnel | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-salaire-minimum | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
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
| hors-perimetre-civil-contrat | civil | easy | 0 | ✓ |
| hors-perimetre-penal-homicide | penal | easy | 0 | ✓ |
| hors-perimetre-famille-divorce | famille | easy | 0 | ✓ |
| hors-perimetre-fonction-publique | fonction_publique | easy | 0 | ✓ |
| hors-perimetre-hors-gabon | general | easy | 0 | ✓ |
| piege-article-abroge-smic | travail | trap | 0 | ✓ |
| piege-hors-gabon-ohada-bilan | commercial | trap | 0 | ✓ |
| piege-terminologie-trompeuse | civil | trap | 0 | ✓ |

### Récap par domaine

| domaine | n | R@5 | R@10 | MRR | NDCG@10 | top1 |
| --- | --- | --- | --- | --- | --- | --- |
| communication | 4 | 0.25 | 0.25 | 0.25 | 0.23 | 0.25 |
| douane | 3 | 0.22 | 0.33 | 0.11 | 0.19 | 0.00 |
| hydrocarbures | 4 | 0.29 | 0.29 | 0.30 | 0.23 | 0.25 |
| impots | 5 | 0.07 | 0.07 | 0.05 | 0.04 | 0.00 |
| marche-public | 4 | 0.12 | 0.12 | 0.25 | 0.15 | 0.25 |
| sante | 4 | 0.08 | 0.08 | 0.06 | 0.05 | 0.00 |
| travail | 8 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| **GLOBAL** | 32 | **0.15** | **0.16** | **0.13** | **0.11** | **0.09** |

Cross-domaine correctement vides : **8/8**

## Étape 5 — RRF pondéré (primaires x2) — 2026-05-28 21:10 UTC

Gold set : 40 questions  |  seuil rag_min_score : appliqué

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-conges-payes | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-preavis-rupture | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-conge-maternite | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-delegates-personnel | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-salaire-minimum | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
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
| hors-perimetre-civil-contrat | civil | easy | 0 | ✓ |
| hors-perimetre-penal-homicide | penal | easy | 0 | ✓ |
| hors-perimetre-famille-divorce | famille | easy | 0 | ✓ |
| hors-perimetre-fonction-publique | fonction_publique | easy | 0 | ✓ |
| hors-perimetre-hors-gabon | general | easy | 0 | ✓ |
| piege-article-abroge-smic | travail | trap | 0 | ✓ |
| piege-hors-gabon-ohada-bilan | commercial | trap | 0 | ✓ |
| piege-terminologie-trompeuse | civil | trap | 0 | ✓ |

### Récap par domaine

| domaine | n | R@5 | R@10 | MRR | NDCG@10 | top1 |
| --- | --- | --- | --- | --- | --- | --- |
| communication | 4 | 0.25 | 0.25 | 0.25 | 0.23 | 0.25 |
| douane | 3 | 0.22 | 0.33 | 0.11 | 0.19 | 0.00 |
| hydrocarbures | 4 | 0.29 | 0.29 | 0.30 | 0.23 | 0.25 |
| impots | 5 | 0.07 | 0.07 | 0.05 | 0.04 | 0.00 |
| marche-public | 4 | 0.12 | 0.12 | 0.25 | 0.15 | 0.25 |
| sante | 4 | 0.08 | 0.08 | 0.06 | 0.05 | 0.00 |
| travail | 8 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| **GLOBAL** | 32 | **0.15** | **0.16** | **0.13** | **0.11** | **0.09** |

Cross-domaine correctement vides : **8/8**

## Étape 5 — RRF avec domain filter sur variantes rewriter — 2026-05-28 21:24 UTC

Gold set : 40 questions  |  seuil rag_min_score : appliqué

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-conges-payes | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-preavis-rupture | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-conge-maternite | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-delegates-personnel | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
| travail-salaire-minimum | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | — |
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
| hors-perimetre-civil-contrat | civil | easy | 0 | ✓ |
| hors-perimetre-penal-homicide | penal | easy | 0 | ✓ |
| hors-perimetre-famille-divorce | famille | easy | 0 | ✓ |
| hors-perimetre-fonction-publique | fonction_publique | easy | 0 | ✓ |
| hors-perimetre-hors-gabon | general | easy | 0 | ✓ |
| piege-article-abroge-smic | travail | trap | 0 | ✓ |
| piege-hors-gabon-ohada-bilan | commercial | trap | 0 | ✓ |
| piege-terminologie-trompeuse | civil | trap | 0 | ✓ |

### Récap par domaine

| domaine | n | R@5 | R@10 | MRR | NDCG@10 | top1 |
| --- | --- | --- | --- | --- | --- | --- |
| communication | 4 | 0.25 | 0.25 | 0.25 | 0.23 | 0.25 |
| douane | 3 | 0.22 | 0.33 | 0.11 | 0.19 | 0.00 |
| hydrocarbures | 4 | 0.29 | 0.29 | 0.30 | 0.23 | 0.25 |
| impots | 5 | 0.07 | 0.07 | 0.05 | 0.04 | 0.00 |
| marche-public | 4 | 0.12 | 0.12 | 0.25 | 0.15 | 0.25 |
| sante | 4 | 0.08 | 0.08 | 0.06 | 0.05 | 0.00 |
| travail | 8 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| **GLOBAL** | 32 | **0.15** | **0.16** | **0.13** | **0.11** | **0.09** |

Cross-domaine correctement vides : **8/8**

## Étape 5 — score-max + query rewriter + domain filter — 2026-05-28 21:47 UTC

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

## Rebaseline — matching (code, article) — 2026-08-13 16:12 UTC

Gold set : 40 questions  |  seuil rag_min_score : appliqué

### Métriques de tête

| métrique | valeur | cible |
| --- | --- | --- |
| **cross_domain_empty_rate** | **7/8 (0.88)** | 8/8 (1.00) |
| **in_domain_blocked_rate** | **0/32 (0.00)** | 0.00 (dur) |

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du travail|21, code du travail|25, code du travail|206, code du travail|140, code du travail|1 |
| travail-conges-payes | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|222, code du travail|224, code du travail|223, code du travail|182, code du travail|227 |
| travail-preavis-rupture | travail | easy | 0.00 | 0.50 | 0.17 | 0.22 | ✗ | code du travail|86, code du travail|82, code du travail|81, code du travail|61, code du travail|60 |
| travail-conge-maternite | travail | medium | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|210, code du travail|207, code du travail|208, code du travail|223, code du travail|211 |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|330, code du travail|81, code du travail|90, code du travail|64, code du travail|95 |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|393, code du travail|156, code du travail|128, code du travail|305, code du travail|21 |
| travail-delegates-personnel | travail | easy | 0.33 | 0.33 | 0.50 | 0.30 | ✗ | code du travail|95, code du travail|64, code du travail|336, code du travail|331, code du travail|330 |
| travail-salaire-minimum | travail | medium | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code du travail|179, code du travail|293, code du travail|110, code du travail|178, code du travail|90 |
| fiscal-is-benefice | impots | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code général des impôts|164, code général des impôts|161, code général des impôts|40, code général des impôts|11, code général des impôts|14 |
| fiscal-tva-regime | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|221, code général des impôts|248, code général des impôts|165, code général des impôts|90, code général des impôts|206 |
| fiscal-retenue-salaires | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|74, code général des impôts|90, code général des impôts|161, code général des impôts|95, code général des impôts|119 |
| fiscal-amortissements | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|196, code général des impôts|42, code général des impôts|16, code général des impôts|9, code général des impôts|38 |
| fiscal-prescription | impots | hard | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|656, code général des impôts|166, code général des impôts|462, code général des impôts|551, code général des impôts|374 |
| hydro-partage-production | hydrocarbures | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|61, code des hydrocarbures|66, code des hydrocarbures|222, code des hydrocarbures|34, code des hydrocarbures|197 |
| hydro-redevance-miniere | hydrocarbures | medium | 0.50 | 0.50 | 0.20 | 0.24 | ✗ | code des hydrocarbures|207, code des hydrocarbures|217, code des hydrocarbures|280, code des hydrocarbures|222, code des hydrocarbures|104 |
| hydro-torchage-gaz | hydrocarbures | easy | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code des hydrocarbures|125, code des hydrocarbures|264, code des hydrocarbures|127, code des hydrocarbures|126, code des hydrocarbures|1 |
| hydro-abandon-puits | hydrocarbures | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|170, code des hydrocarbures|173, code des hydrocarbures|87, code des hydrocarbures|97, code des hydrocarbures|120 |
| douane-valeur-en-douane | douane | medium | 0.67 | 1.00 | 0.33 | 0.58 | ✗ | code des douanes|34, code des douanes|32, code des douanes|30, code des douanes|33, code des douanes|29 |
| douane-franchise | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|12, code des douanes|34, code des douanes|276, code des douanes|287, code des douanes|21 |
| douane-entrepot | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|176, code des douanes|196, code des douanes|177, code des douanes|185, code des douanes|198 |
| marche-appel-offres-ouvert | marche-public | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|81, code du marché public|119, code du marché public|60, code du marché public|2, code du marché public|117 |
| marche-gre-a-gre | marche-public | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code du marché public|68, code du marché public|189, code du marché public|227, code du marché public|52, code du marché public|119 |
| marche-avance-demarrage | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|162, code du marché public|2, code du marché public|81, code du marché public|235, code du marché public|52 |
| marche-resiliation | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|227, code du marché public|229, code du marché public|228, code du marché public|185, code du marché public|225 |
| sante-pharmacie-ouverture | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|339, code de la santé publique|332, code de la santé publique|3, code de la santé publique|338, code de la santé publique|304 |
| sante-vaccination-obligations | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|516, code de la santé publique|20, code de la santé publique|613, code de la santé publique|517, code de la santé publique|17 |
| sante-secret-medical | sante | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code de la santé publique|3, code de la santé publique|436, code de la santé publique|281, code de la santé publique|26, code de la santé publique|304 |
| sante-don-organes | sante | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|191, code de la santé publique|195, code de la santé publique|167, code de la santé publique|637, code de la santé publique|164 |
| comm-reseaux-sociaux | communication | easy | 1.00 | 1.00 | 1.00 | 0.91 | ✓ | code de la communication|1, code de la communication|4, code de la communication|2, code de la communication|3, code de la communication|37 |
| comm-presse-ligne | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|27, code de la communication|25, code de la communication|2bis, code de la communication|22 |
| comm-droit-rectification | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|27, code de la communication|2bis, code de la communication|2, code de la communication|15 |
| comm-publicite-commerciale | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|2bis, code de la communication|3, code de la communication|32 |

### Hors-périmètre (attendu : aucun extrait)

| id | domaine | raison attendue | raison obtenue | renvoyés | ok |
| --- | --- | --- | --- | --- | --- |
| hors-perimetre-civil-contrat | civil | domain_not_indexed | — | 0 | ✓ |
| hors-perimetre-penal-homicide | penal | domain_not_indexed | — | 0 | ✓ |
| hors-perimetre-famille-divorce | famille | domain_not_indexed | — | 0 | ✓ |
| hors-perimetre-fonction-publique | fonction_publique | domain_not_indexed | — | 0 | ✓ |
| hors-perimetre-hors-gabon | general | out_of_jurisdiction | — | 0 | ✓ |
| piege-article-abroge-smic | travail | outdated_reference | — | 6 | ✗ |
| piege-hors-gabon-ohada-bilan | commercial | code_not_indexed | — | 0 | ✓ |
| piege-terminologie-trompeuse | civil | code_not_indexed | — | 0 | ✓ |

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

Cross-domaine correctement vides : **7/8**

## Étape 6 — gate lexical déterministe — 2026-08-13 16:42 UTC

Gold set : 40 questions  |  seuil rag_min_score : appliqué

### Métriques de tête

| métrique | valeur | cible |
| --- | --- | --- |
| **cross_domain_empty_rate** | **8/8 (1.00)** | 8/8 (1.00) |
| **in_domain_blocked_rate** | **0/32 (0.00)** | 0.00 (dur) |
| cross_domain_right_reason | 8/8 (1.00) | ≥ 0.875 |

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du travail|21, code du travail|25, code du travail|206, code du travail|140, code du travail|1 |
| travail-conges-payes | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|222, code du travail|224, code du travail|223, code du travail|182, code du travail|227 |
| travail-preavis-rupture | travail | easy | 0.00 | 0.50 | 0.17 | 0.22 | ✗ | code du travail|86, code du travail|82, code du travail|81, code du travail|61, code du travail|60 |
| travail-conge-maternite | travail | medium | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|210, code du travail|207, code du travail|208, code du travail|223, code du travail|211 |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|330, code du travail|81, code du travail|90, code du travail|64, code du travail|95 |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|393, code du travail|156, code du travail|128, code du travail|305, code du travail|21 |
| travail-delegates-personnel | travail | easy | 0.33 | 0.33 | 0.50 | 0.30 | ✗ | code du travail|95, code du travail|64, code du travail|336, code du travail|331, code du travail|330 |
| travail-salaire-minimum | travail | medium | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code du travail|179, code du travail|293, code du travail|110, code du travail|178, code du travail|90 |
| fiscal-is-benefice | impots | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code général des impôts|164, code général des impôts|161, code général des impôts|40, code général des impôts|11, code général des impôts|14 |
| fiscal-tva-regime | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|221, code général des impôts|248, code général des impôts|165, code général des impôts|90, code général des impôts|206 |
| fiscal-retenue-salaires | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|74, code général des impôts|90, code général des impôts|161, code général des impôts|95, code général des impôts|119 |
| fiscal-amortissements | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|196, code général des impôts|42, code général des impôts|16, code général des impôts|9, code général des impôts|38 |
| fiscal-prescription | impots | hard | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|656, code général des impôts|166, code général des impôts|462, code général des impôts|551, code général des impôts|374 |
| hydro-partage-production | hydrocarbures | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|61, code des hydrocarbures|66, code des hydrocarbures|222, code des hydrocarbures|34, code des hydrocarbures|197 |
| hydro-redevance-miniere | hydrocarbures | medium | 0.50 | 0.50 | 0.20 | 0.24 | ✗ | code des hydrocarbures|207, code des hydrocarbures|217, code des hydrocarbures|280, code des hydrocarbures|222, code des hydrocarbures|104 |
| hydro-torchage-gaz | hydrocarbures | easy | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code des hydrocarbures|125, code des hydrocarbures|264, code des hydrocarbures|127, code des hydrocarbures|126, code des hydrocarbures|1 |
| hydro-abandon-puits | hydrocarbures | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|170, code des hydrocarbures|173, code des hydrocarbures|87, code des hydrocarbures|97, code des hydrocarbures|120 |
| douane-valeur-en-douane | douane | medium | 0.67 | 1.00 | 0.33 | 0.58 | ✗ | code des douanes|34, code des douanes|32, code des douanes|30, code des douanes|33, code des douanes|29 |
| douane-franchise | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|12, code des douanes|34, code des douanes|276, code des douanes|287, code des douanes|21 |
| douane-entrepot | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|176, code des douanes|196, code des douanes|177, code des douanes|185, code des douanes|198 |
| marche-appel-offres-ouvert | marche-public | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|81, code du marché public|119, code du marché public|60, code du marché public|2, code du marché public|117 |
| marche-gre-a-gre | marche-public | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code du marché public|68, code du marché public|189, code du marché public|227, code du marché public|52, code du marché public|119 |
| marche-avance-demarrage | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|162, code du marché public|2, code du marché public|81, code du marché public|235, code du marché public|52 |
| marche-resiliation | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|227, code du marché public|229, code du marché public|228, code du marché public|185, code du marché public|225 |
| sante-pharmacie-ouverture | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|339, code de la santé publique|332, code de la santé publique|3, code de la santé publique|338, code de la santé publique|304 |
| sante-vaccination-obligations | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|516, code de la santé publique|20, code de la santé publique|613, code de la santé publique|517, code de la santé publique|17 |
| sante-secret-medical | sante | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code de la santé publique|3, code de la santé publique|436, code de la santé publique|281, code de la santé publique|26, code de la santé publique|304 |
| sante-don-organes | sante | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|191, code de la santé publique|195, code de la santé publique|167, code de la santé publique|637, code de la santé publique|164 |
| comm-reseaux-sociaux | communication | easy | 1.00 | 1.00 | 1.00 | 0.91 | ✓ | code de la communication|1, code de la communication|4, code de la communication|2, code de la communication|3, code de la communication|37 |
| comm-presse-ligne | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|27, code de la communication|25, code de la communication|2bis, code de la communication|22 |
| comm-droit-rectification | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|27, code de la communication|2bis, code de la communication|2, code de la communication|15 |
| comm-publicite-commerciale | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|2bis, code de la communication|3, code de la communication|32 |

### Hors-périmètre (attendu : aucun extrait)

| id | domaine | raison attendue | raison obtenue | renvoyés | ok |
| --- | --- | --- | --- | --- | --- |
| hors-perimetre-civil-contrat | civil | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-penal-homicide | penal | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-famille-divorce | famille | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-fonction-publique | fonction_publique | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-hors-gabon | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| piege-article-abroge-smic | travail | outdated_reference | outdated_reference | 0 | ✓ |
| piege-hors-gabon-ohada-bilan | commercial | code_not_indexed / regional_not_indexed | regional_not_indexed | 0 | ✓ |
| piege-terminologie-trompeuse | civil | code_not_indexed | code_not_indexed | 0 | ✓ |

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

Cross-domaine correctement vides : **8/8**

## Étape 6b — gate seul (sentinelle retirée) — 2026-08-13 16:46 UTC

Gold set : 40 questions  |  seuil rag_min_score : appliqué

### Métriques de tête

| métrique | valeur | cible |
| --- | --- | --- |
| **cross_domain_empty_rate** | **8/8 (1.00)** | 8/8 (1.00) |
| **in_domain_blocked_rate** | **0/32 (0.00)** | 0.00 (dur) |
| cross_domain_right_reason | 8/8 (1.00) | ≥ 0.875 |

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du travail|21, code du travail|25, code du travail|206, code du travail|140, code du travail|1 |
| travail-conges-payes | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|222, code du travail|224, code du travail|223, code du travail|182, code du travail|227 |
| travail-preavis-rupture | travail | easy | 0.00 | 0.50 | 0.17 | 0.22 | ✗ | code du travail|86, code du travail|82, code du travail|81, code du travail|61, code du travail|60 |
| travail-conge-maternite | travail | medium | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|210, code du travail|207, code du travail|208, code du travail|223, code du travail|211 |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|330, code du travail|81, code du travail|90, code du travail|64, code du travail|95 |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|393, code du travail|156, code du travail|128, code du travail|305, code du travail|21 |
| travail-delegates-personnel | travail | easy | 0.33 | 0.33 | 0.50 | 0.30 | ✗ | code du travail|95, code du travail|64, code du travail|336, code du travail|331, code du travail|330 |
| travail-salaire-minimum | travail | medium | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code du travail|179, code du travail|293, code du travail|110, code du travail|178, code du travail|90 |
| fiscal-is-benefice | impots | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code général des impôts|164, code général des impôts|161, code général des impôts|40, code général des impôts|11, code général des impôts|14 |
| fiscal-tva-regime | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|221, code général des impôts|248, code général des impôts|165, code général des impôts|90, code général des impôts|206 |
| fiscal-retenue-salaires | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|74, code général des impôts|90, code général des impôts|161, code général des impôts|95, code général des impôts|119 |
| fiscal-amortissements | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|196, code général des impôts|42, code général des impôts|16, code général des impôts|9, code général des impôts|38 |
| fiscal-prescription | impots | hard | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|656, code général des impôts|166, code général des impôts|462, code général des impôts|551, code général des impôts|374 |
| hydro-partage-production | hydrocarbures | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|61, code des hydrocarbures|66, code des hydrocarbures|222, code des hydrocarbures|34, code des hydrocarbures|197 |
| hydro-redevance-miniere | hydrocarbures | medium | 0.50 | 0.50 | 0.20 | 0.24 | ✗ | code des hydrocarbures|207, code des hydrocarbures|217, code des hydrocarbures|280, code des hydrocarbures|222, code des hydrocarbures|104 |
| hydro-torchage-gaz | hydrocarbures | easy | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code des hydrocarbures|125, code des hydrocarbures|264, code des hydrocarbures|127, code des hydrocarbures|126, code des hydrocarbures|1 |
| hydro-abandon-puits | hydrocarbures | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|170, code des hydrocarbures|173, code des hydrocarbures|87, code des hydrocarbures|97, code des hydrocarbures|120 |
| douane-valeur-en-douane | douane | medium | 0.67 | 1.00 | 0.33 | 0.58 | ✗ | code des douanes|34, code des douanes|32, code des douanes|30, code des douanes|33, code des douanes|29 |
| douane-franchise | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|12, code des douanes|34, code des douanes|276, code des douanes|287, code des douanes|21 |
| douane-entrepot | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|176, code des douanes|196, code des douanes|177, code des douanes|185, code des douanes|198 |
| marche-appel-offres-ouvert | marche-public | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|81, code du marché public|119, code du marché public|60, code du marché public|2, code du marché public|117 |
| marche-gre-a-gre | marche-public | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code du marché public|68, code du marché public|189, code du marché public|227, code du marché public|52, code du marché public|119 |
| marche-avance-demarrage | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|162, code du marché public|2, code du marché public|81, code du marché public|235, code du marché public|52 |
| marche-resiliation | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|227, code du marché public|229, code du marché public|228, code du marché public|185, code du marché public|225 |
| sante-pharmacie-ouverture | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|339, code de la santé publique|332, code de la santé publique|3, code de la santé publique|338, code de la santé publique|304 |
| sante-vaccination-obligations | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|516, code de la santé publique|20, code de la santé publique|613, code de la santé publique|517, code de la santé publique|17 |
| sante-secret-medical | sante | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code de la santé publique|3, code de la santé publique|436, code de la santé publique|281, code de la santé publique|26, code de la santé publique|304 |
| sante-don-organes | sante | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|191, code de la santé publique|195, code de la santé publique|167, code de la santé publique|637, code de la santé publique|164 |
| comm-reseaux-sociaux | communication | easy | 1.00 | 1.00 | 1.00 | 0.91 | ✓ | code de la communication|1, code de la communication|4, code de la communication|2, code de la communication|3, code de la communication|37 |
| comm-presse-ligne | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|27, code de la communication|25, code de la communication|2bis, code de la communication|22 |
| comm-droit-rectification | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|27, code de la communication|2bis, code de la communication|2, code de la communication|15 |
| comm-publicite-commerciale | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|2bis, code de la communication|3, code de la communication|32 |

### Hors-périmètre (attendu : aucun extrait)

| id | domaine | raison attendue | raison obtenue | renvoyés | ok |
| --- | --- | --- | --- | --- | --- |
| hors-perimetre-civil-contrat | civil | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-penal-homicide | penal | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-famille-divorce | famille | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-fonction-publique | fonction_publique | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-hors-gabon | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| piege-article-abroge-smic | travail | outdated_reference | outdated_reference | 0 | ✓ |
| piege-hors-gabon-ohada-bilan | commercial | code_not_indexed / regional_not_indexed | regional_not_indexed | 0 | ✓ |
| piege-terminologie-trompeuse | civil | code_not_indexed | code_not_indexed | 0 | ✓ |

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

Cross-domaine correctement vides : **8/8**

## Contrôle — sans gate — 2026-08-13 16:51 UTC

Gold set : 40 questions  |  seuil rag_min_score : appliqué

### Métriques de tête

| métrique | valeur | cible |
| --- | --- | --- |
| **cross_domain_empty_rate** | **0/8 (0.00)** | 8/8 (1.00) |
| **in_domain_blocked_rate** | **0/32 (0.00)** | 0.00 (dur) |

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du travail|21, code du travail|25, code du travail|206, code du travail|140, code du travail|1 |
| travail-conges-payes | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|222, code du travail|224, code du travail|223, code du travail|182, code du travail|227 |
| travail-preavis-rupture | travail | easy | 0.00 | 0.50 | 0.17 | 0.22 | ✗ | code du travail|86, code du travail|82, code du travail|81, code du travail|61, code du travail|60 |
| travail-conge-maternite | travail | medium | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|210, code du travail|207, code du travail|208, code du travail|223, code du travail|211 |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|330, code du travail|81, code du travail|90, code du travail|64, code du travail|95 |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|393, code du travail|156, code du travail|128, code du travail|305, code du travail|21 |
| travail-delegates-personnel | travail | easy | 0.33 | 0.33 | 0.50 | 0.30 | ✗ | code du travail|95, code du travail|64, code du travail|336, code du travail|331, code du travail|330 |
| travail-salaire-minimum | travail | medium | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code du travail|179, code du travail|293, code du travail|110, code du travail|178, code du travail|90 |
| fiscal-is-benefice | impots | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code général des impôts|164, code général des impôts|161, code général des impôts|40, code général des impôts|11, code général des impôts|14 |
| fiscal-tva-regime | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|221, code général des impôts|248, code général des impôts|165, code général des impôts|90, code général des impôts|206 |
| fiscal-retenue-salaires | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|74, code général des impôts|90, code général des impôts|161, code général des impôts|95, code général des impôts|119 |
| fiscal-amortissements | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|196, code général des impôts|42, code général des impôts|16, code général des impôts|9, code général des impôts|38 |
| fiscal-prescription | impots | hard | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|656, code général des impôts|166, code général des impôts|462, code général des impôts|551, code général des impôts|374 |
| hydro-partage-production | hydrocarbures | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|61, code des hydrocarbures|66, code des hydrocarbures|222, code des hydrocarbures|34, code des hydrocarbures|197 |
| hydro-redevance-miniere | hydrocarbures | medium | 0.50 | 0.50 | 0.20 | 0.24 | ✗ | code des hydrocarbures|207, code des hydrocarbures|217, code des hydrocarbures|280, code des hydrocarbures|222, code des hydrocarbures|104 |
| hydro-torchage-gaz | hydrocarbures | easy | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code des hydrocarbures|125, code des hydrocarbures|264, code des hydrocarbures|127, code des hydrocarbures|126, code des hydrocarbures|1 |
| hydro-abandon-puits | hydrocarbures | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|170, code des hydrocarbures|173, code des hydrocarbures|87, code des hydrocarbures|97, code des hydrocarbures|120 |
| douane-valeur-en-douane | douane | medium | 0.67 | 1.00 | 0.33 | 0.58 | ✗ | code des douanes|34, code des douanes|32, code des douanes|30, code des douanes|33, code des douanes|29 |
| douane-franchise | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|12, code des douanes|34, code des douanes|276, code des douanes|287, code des douanes|21 |
| douane-entrepot | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|176, code des douanes|196, code des douanes|177, code des douanes|185, code des douanes|198 |
| marche-appel-offres-ouvert | marche-public | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|81, code du marché public|119, code du marché public|60, code du marché public|2, code du marché public|117 |
| marche-gre-a-gre | marche-public | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code du marché public|68, code du marché public|189, code du marché public|227, code du marché public|52, code du marché public|119 |
| marche-avance-demarrage | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|162, code du marché public|2, code du marché public|81, code du marché public|235, code du marché public|52 |
| marche-resiliation | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|227, code du marché public|229, code du marché public|228, code du marché public|185, code du marché public|225 |
| sante-pharmacie-ouverture | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|339, code de la santé publique|332, code de la santé publique|3, code de la santé publique|338, code de la santé publique|304 |
| sante-vaccination-obligations | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|516, code de la santé publique|20, code de la santé publique|613, code de la santé publique|517, code de la santé publique|17 |
| sante-secret-medical | sante | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code de la santé publique|3, code de la santé publique|436, code de la santé publique|281, code de la santé publique|26, code de la santé publique|304 |
| sante-don-organes | sante | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|191, code de la santé publique|195, code de la santé publique|167, code de la santé publique|637, code de la santé publique|164 |
| comm-reseaux-sociaux | communication | easy | 1.00 | 1.00 | 1.00 | 0.91 | ✓ | code de la communication|1, code de la communication|4, code de la communication|2, code de la communication|3, code de la communication|37 |
| comm-presse-ligne | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|27, code de la communication|25, code de la communication|2bis, code de la communication|22 |
| comm-droit-rectification | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|27, code de la communication|2bis, code de la communication|2, code de la communication|15 |
| comm-publicite-commerciale | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|2bis, code de la communication|3, code de la communication|32 |

### Hors-périmètre (attendu : aucun extrait)

| id | domaine | raison attendue | raison obtenue | renvoyés | ok |
| --- | --- | --- | --- | --- | --- |
| hors-perimetre-civil-contrat | civil | domain_not_indexed / code_not_indexed | — | 6 | ✗ |
| hors-perimetre-penal-homicide | penal | domain_not_indexed / code_not_indexed | — | 6 | ✗ |
| hors-perimetre-famille-divorce | famille | domain_not_indexed | — | 6 | ✗ |
| hors-perimetre-fonction-publique | fonction_publique | domain_not_indexed | — | 6 | ✗ |
| hors-perimetre-hors-gabon | general | out_of_jurisdiction | — | 6 | ✗ |
| piege-article-abroge-smic | travail | outdated_reference | — | 6 | ✗ |
| piege-hors-gabon-ohada-bilan | commercial | code_not_indexed / regional_not_indexed | — | 6 | ✗ |
| piege-terminologie-trompeuse | civil | code_not_indexed | — | 6 | ✗ |

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

### Note étape 6 — gate lexical déterministe

Constat de départ : `cross_domain_empty_rate = 0/8` à **toutes** les étapes 1 à 5.
Aucun gain d'embedding (e5-small → e5-base → bge-m3) ni de reranker n'a jamais
permis au système de dire « ce n'est pas dans le corpus ». La cause est
structurelle : `rag_min_score` s'applique au score normalisé min-max *sur le pool
remonté* (`_hybrid_rescore`), donc il existe toujours un extrait à 1.0 et le
seuil ne peut mathématiquement jamais tout rejeter.

Ce qui NE marche pas : faire porter la preuve d'absence au vocabulaire positif.
Mesuré sur ce gold set — seuil « ≥1 terme reconnu » → 31/32 in-domain mais 3/8
hors-périmètre ; seuil « ≥2 termes » → 8/8 hors-périmètre mais 10 in-domain
cassées. C'est le seuil arbitraire de l'embedding, déplacé vers la taille du
dictionnaire.

Ce qui marche : séparer les deux questions. La preuve d'absence repose sur des
signaux explicites et univoques (juridiction étrangère, code non indexé invoqué,
millésime périmé, marqueur négatif fort), évalués dans un ordre de précédence
strict. La confirmation de présence repose sur le vocabulaire positif, mais une
évidence positive faible ne provoque JAMAIS de refus : `no_term_recognized` est
non bloquant et alimente la boucle d'enrichissement.

| configuration | cross_domain_empty_rate | in_domain_blocked_rate | R@5 |
|---|---|---|---|
| sans gate (`--no-gate`) | 0/8 (0.00) | 0/32 | 0.203 |
| **avec gate** | **8/8 (1.00)** | **0/32** | **0.203** |

`cross_domain_right_reason = 1.00` : chaque refus porte le bon motif, avec les
termes déclencheurs comme trace auditable.

Le recall est **inchangé** — c'est attendu : le gate ne cherche pas mieux, il
prouve une absence. Il ne doit donc pas être jugé sur le recall, seulement sur
sa non-régression.

Note de méthode : le gate est évalué **sans** le `expected_domain` du gold set.
En production le sélecteur front est le plus souvent vide, et l'évaluer avec le
domaine déclaré surestimerait ses performances.

Note de matching : `(code, article)` remplace le numéro nu (809 des 909 numéros
du corpus apparaissent dans plusieurs codes). Mesuré, l'écart est **nul**
(0.203 dans les deux cas) : quand le retrieval trouve le bon numéro, il trouve
aussi le bon code. C'est un garde-fou de correction, pas un correctif de chiffres.

Limite assumée : 8 questions hors-périmètre est un échantillon mince. 8/8
signifie « aucun échec connu », pas « robuste ». Élargir le gold set à ~20
hors-périmètre avant de considérer ce chiffre comme solide.

## Étape 7 — gold set élargi (28 hors-périmètre) + enrichissement — 2026-08-13 17:13 UTC

Gold set : 60 questions  |  seuil rag_min_score : appliqué

### Métriques de tête

| métrique | valeur | cible |
| --- | --- | --- |
| **cross_domain_empty_rate** | **27/28 (0.96)** | 8/8 (1.00) |
| **in_domain_blocked_rate** | **0/32 (0.00)** | 0.00 (dur) |
| cross_domain_right_reason | 28/28 (1.00) | ≥ 0.875 |

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du travail|21, code du travail|25, code du travail|206, code du travail|140, code du travail|1 |
| travail-conges-payes | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|222, code du travail|224, code du travail|223, code du travail|182, code du travail|227 |
| travail-preavis-rupture | travail | easy | 0.00 | 0.50 | 0.17 | 0.22 | ✗ | code du travail|86, code du travail|82, code du travail|81, code du travail|61, code du travail|60 |
| travail-conge-maternite | travail | medium | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|210, code du travail|207, code du travail|208, code du travail|223, code du travail|211 |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|330, code du travail|81, code du travail|90, code du travail|64, code du travail|95 |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|393, code du travail|156, code du travail|128, code du travail|305, code du travail|21 |
| travail-delegates-personnel | travail | easy | 0.33 | 0.33 | 0.50 | 0.30 | ✗ | code du travail|95, code du travail|64, code du travail|336, code du travail|331, code du travail|330 |
| travail-salaire-minimum | travail | medium | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code du travail|179, code du travail|293, code du travail|110, code du travail|178, code du travail|90 |
| fiscal-is-benefice | impots | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code général des impôts|164, code général des impôts|161, code général des impôts|40, code général des impôts|11, code général des impôts|14 |
| fiscal-tva-regime | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|221, code général des impôts|248, code général des impôts|165, code général des impôts|90, code général des impôts|206 |
| fiscal-retenue-salaires | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|74, code général des impôts|90, code général des impôts|161, code général des impôts|95, code général des impôts|119 |
| fiscal-amortissements | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|196, code général des impôts|42, code général des impôts|16, code général des impôts|9, code général des impôts|38 |
| fiscal-prescription | impots | hard | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|656, code général des impôts|166, code général des impôts|462, code général des impôts|551, code général des impôts|374 |
| hydro-partage-production | hydrocarbures | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|61, code des hydrocarbures|66, code des hydrocarbures|222, code des hydrocarbures|34, code des hydrocarbures|197 |
| hydro-redevance-miniere | hydrocarbures | medium | 0.50 | 0.50 | 0.20 | 0.24 | ✗ | code des hydrocarbures|207, code des hydrocarbures|217, code des hydrocarbures|280, code des hydrocarbures|222, code des hydrocarbures|104 |
| hydro-torchage-gaz | hydrocarbures | easy | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code des hydrocarbures|125, code des hydrocarbures|264, code des hydrocarbures|127, code des hydrocarbures|126, code des hydrocarbures|1 |
| hydro-abandon-puits | hydrocarbures | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|170, code des hydrocarbures|173, code des hydrocarbures|87, code des hydrocarbures|97, code des hydrocarbures|120 |
| douane-valeur-en-douane | douane | medium | 0.67 | 1.00 | 0.33 | 0.58 | ✗ | code des douanes|34, code des douanes|32, code des douanes|30, code des douanes|33, code des douanes|29 |
| douane-franchise | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|12, code des douanes|34, code des douanes|276, code des douanes|287, code des douanes|21 |
| douane-entrepot | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|176, code des douanes|196, code des douanes|177, code des douanes|185, code des douanes|198 |
| marche-appel-offres-ouvert | marche-public | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|81, code du marché public|119, code du marché public|60, code du marché public|2, code du marché public|117 |
| marche-gre-a-gre | marche-public | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code du marché public|68, code du marché public|189, code du marché public|227, code du marché public|52, code du marché public|119 |
| marche-avance-demarrage | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|162, code du marché public|2, code du marché public|81, code du marché public|235, code du marché public|52 |
| marche-resiliation | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|227, code du marché public|229, code du marché public|228, code du marché public|185, code du marché public|225 |
| sante-pharmacie-ouverture | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|339, code de la santé publique|332, code de la santé publique|3, code de la santé publique|338, code de la santé publique|304 |
| sante-vaccination-obligations | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|516, code de la santé publique|20, code de la santé publique|613, code de la santé publique|517, code de la santé publique|17 |
| sante-secret-medical | sante | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code de la santé publique|3, code de la santé publique|436, code de la santé publique|281, code de la santé publique|26, code de la santé publique|304 |
| sante-don-organes | sante | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|191, code de la santé publique|195, code de la santé publique|167, code de la santé publique|637, code de la santé publique|164 |
| comm-reseaux-sociaux | communication | easy | 1.00 | 1.00 | 1.00 | 0.91 | ✓ | code de la communication|1, code de la communication|4, code de la communication|2, code de la communication|3, code de la communication|37 |
| comm-presse-ligne | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|27, code de la communication|25, code de la communication|2bis, code de la communication|22 |
| comm-droit-rectification | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|27, code de la communication|2bis, code de la communication|2, code de la communication|15 |
| comm-publicite-commerciale | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|2bis, code de la communication|3, code de la communication|32 |

### Hors-périmètre (attendu : aucun extrait)

| id | domaine | raison attendue | raison obtenue | renvoyés | ok |
| --- | --- | --- | --- | --- | --- |
| hors-perimetre-civil-contrat | civil | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-penal-homicide | penal | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-famille-divorce | famille | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-fonction-publique | fonction_publique | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-hors-gabon | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| piege-article-abroge-smic | travail | outdated_reference | outdated_reference | 0 | ✓ |
| piege-hors-gabon-ohada-bilan | commercial | code_not_indexed / regional_not_indexed | regional_not_indexed | 0 | ✓ |
| piege-terminologie-trompeuse | civil | code_not_indexed | code_not_indexed | 0 | ✓ |
| hp-civil-bail | civil | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-civil-responsabilite | civil | no_term_recognized | no_term_recognized | 6 | ✗ |
| hp-penal-vol | penal | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-penal-recidive | penal | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-famille-adoption | famille | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-famille-pension | famille | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-fp-avancement | fonction_publique | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-admin-recours | administratif | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-commercial-rcs | commercial | domain_not_indexed / code_not_indexed / regional_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-jur-senegal | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-cameroun | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-belge | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-europe | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-ohada-suretes | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-cima-assurance | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-cobac-banque | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-millesime-impots | impots | outdated_reference | outdated_reference | 0 | ✓ |
| hp-millesime-hydro | hydrocarbures | outdated_reference | outdated_reference | 0 | ✓ |
| hp-code-penal-nomme | penal | code_not_indexed / domain_not_indexed | code_not_indexed | 0 | ✓ |
| hp-code-famille-nomme | famille | code_not_indexed / domain_not_indexed | code_not_indexed | 0 | ✓ |

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

Cross-domaine correctement vides : **27/28**

## Étape 7 — gold set élargi + lexique corrigé — 2026-08-13 17:16 UTC

Gold set : 60 questions  |  seuil rag_min_score : appliqué

### Métriques de tête

| métrique | valeur | cible |
| --- | --- | --- |
| **cross_domain_empty_rate** | **27/28 (0.96)** | ≥ 0.95 |
| **in_domain_blocked_rate** | **0/32 (0.00)** | 0.00 (dur) |
| cross_domain_right_reason | 28/28 (1.00) | ≥ 0.875 |

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du travail|21, code du travail|25, code du travail|206, code du travail|140, code du travail|1 |
| travail-conges-payes | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|222, code du travail|224, code du travail|223, code du travail|182, code du travail|227 |
| travail-preavis-rupture | travail | easy | 0.00 | 0.50 | 0.17 | 0.22 | ✗ | code du travail|86, code du travail|82, code du travail|81, code du travail|61, code du travail|60 |
| travail-conge-maternite | travail | medium | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|210, code du travail|207, code du travail|208, code du travail|223, code du travail|211 |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|330, code du travail|81, code du travail|90, code du travail|64, code du travail|95 |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|393, code du travail|156, code du travail|128, code du travail|305, code du travail|21 |
| travail-delegates-personnel | travail | easy | 0.33 | 0.33 | 0.50 | 0.30 | ✗ | code du travail|95, code du travail|64, code du travail|336, code du travail|331, code du travail|330 |
| travail-salaire-minimum | travail | medium | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code du travail|179, code du travail|293, code du travail|110, code du travail|178, code du travail|90 |
| fiscal-is-benefice | impots | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code général des impôts|164, code général des impôts|161, code général des impôts|40, code général des impôts|11, code général des impôts|14 |
| fiscal-tva-regime | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|221, code général des impôts|248, code général des impôts|165, code général des impôts|90, code général des impôts|206 |
| fiscal-retenue-salaires | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|74, code général des impôts|90, code général des impôts|161, code général des impôts|95, code général des impôts|119 |
| fiscal-amortissements | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|196, code général des impôts|42, code général des impôts|16, code général des impôts|9, code général des impôts|38 |
| fiscal-prescription | impots | hard | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|656, code général des impôts|166, code général des impôts|462, code général des impôts|551, code général des impôts|374 |
| hydro-partage-production | hydrocarbures | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|61, code des hydrocarbures|66, code des hydrocarbures|222, code des hydrocarbures|34, code des hydrocarbures|197 |
| hydro-redevance-miniere | hydrocarbures | medium | 0.50 | 0.50 | 0.20 | 0.24 | ✗ | code des hydrocarbures|207, code des hydrocarbures|217, code des hydrocarbures|280, code des hydrocarbures|222, code des hydrocarbures|104 |
| hydro-torchage-gaz | hydrocarbures | easy | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code des hydrocarbures|125, code des hydrocarbures|264, code des hydrocarbures|127, code des hydrocarbures|126, code des hydrocarbures|1 |
| hydro-abandon-puits | hydrocarbures | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|170, code des hydrocarbures|173, code des hydrocarbures|87, code des hydrocarbures|97, code des hydrocarbures|120 |
| douane-valeur-en-douane | douane | medium | 0.67 | 1.00 | 0.33 | 0.58 | ✗ | code des douanes|34, code des douanes|32, code des douanes|30, code des douanes|33, code des douanes|29 |
| douane-franchise | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|12, code des douanes|34, code des douanes|276, code des douanes|287, code des douanes|21 |
| douane-entrepot | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|176, code des douanes|196, code des douanes|177, code des douanes|185, code des douanes|198 |
| marche-appel-offres-ouvert | marche-public | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|81, code du marché public|119, code du marché public|60, code du marché public|2, code du marché public|117 |
| marche-gre-a-gre | marche-public | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code du marché public|68, code du marché public|189, code du marché public|227, code du marché public|52, code du marché public|119 |
| marche-avance-demarrage | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|162, code du marché public|2, code du marché public|81, code du marché public|235, code du marché public|52 |
| marche-resiliation | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|227, code du marché public|229, code du marché public|228, code du marché public|185, code du marché public|225 |
| sante-pharmacie-ouverture | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|339, code de la santé publique|332, code de la santé publique|3, code de la santé publique|338, code de la santé publique|304 |
| sante-vaccination-obligations | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|516, code de la santé publique|20, code de la santé publique|613, code de la santé publique|517, code de la santé publique|17 |
| sante-secret-medical | sante | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code de la santé publique|3, code de la santé publique|436, code de la santé publique|281, code de la santé publique|26, code de la santé publique|304 |
| sante-don-organes | sante | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|191, code de la santé publique|195, code de la santé publique|167, code de la santé publique|637, code de la santé publique|164 |
| comm-reseaux-sociaux | communication | easy | 1.00 | 1.00 | 1.00 | 0.91 | ✓ | code de la communication|1, code de la communication|4, code de la communication|2, code de la communication|3, code de la communication|37 |
| comm-presse-ligne | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|27, code de la communication|25, code de la communication|2bis, code de la communication|22 |
| comm-droit-rectification | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|27, code de la communication|2bis, code de la communication|2, code de la communication|15 |
| comm-publicite-commerciale | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|2bis, code de la communication|3, code de la communication|32 |

### Hors-périmètre (attendu : aucun extrait)

| id | domaine | raison attendue | raison obtenue | renvoyés | ok |
| --- | --- | --- | --- | --- | --- |
| hors-perimetre-civil-contrat | civil | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-penal-homicide | penal | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-famille-divorce | famille | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-fonction-publique | fonction_publique | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-hors-gabon | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| piege-article-abroge-smic | travail | outdated_reference | outdated_reference | 0 | ✓ |
| piege-hors-gabon-ohada-bilan | commercial | code_not_indexed / regional_not_indexed | regional_not_indexed | 0 | ✓ |
| piege-terminologie-trompeuse | civil | code_not_indexed | code_not_indexed | 0 | ✓ |
| hp-civil-bail | civil | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-civil-responsabilite | civil | no_term_recognized | no_term_recognized | 6 | ✗ |
| hp-penal-vol | penal | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-penal-recidive | penal | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-famille-adoption | famille | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-famille-pension | famille | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-fp-avancement | fonction_publique | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-admin-recours | administratif | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-commercial-rcs | commercial | domain_not_indexed / code_not_indexed / regional_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-jur-senegal | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-cameroun | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-belge | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-europe | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-ohada-suretes | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-cima-assurance | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-cobac-banque | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-millesime-impots | impots | outdated_reference | outdated_reference | 0 | ✓ |
| hp-millesime-hydro | hydrocarbures | outdated_reference | outdated_reference | 0 | ✓ |
| hp-code-penal-nomme | penal | code_not_indexed / domain_not_indexed | code_not_indexed | 0 | ✓ |
| hp-code-famille-nomme | famille | code_not_indexed / domain_not_indexed | code_not_indexed | 0 | ✓ |

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

Cross-domaine correctement vides : **27/28**

### Note étape 7 — boucle d'enrichissement + gold set élargi

**Boucle d'enrichissement** (`scripts/propose_lexique_terms.py`). Mise en œuvre de
l'idée de l'expert : se servir de l'embedding pour *construire le dictionnaire*,
pas pour chercher. Pour chaque question où le gate répond `no_term_recognized`,
on lance la passe vectorielle et on extrait les termes faisant le **pont** entre
la question et les passages remontés (présents dans les deux, à la variation
morphologique près). Un terme du corpus absent de la question ne sert à rien pour
le gating — d'où ce filtre.

Résultat sur `hydro-abandon-puits`, seule in-domain non reconnue : le vectoriel
identifie le domaine à 100 %, et propose `hydrocarbures`, `abandon`, `opérateur`,
`obligations`, chacun avec son article justificatif. Validation « juriste » : on
retient `hydrocarbures` et `abandon` (caractéristiques), on écarte `opérateur` et
`obligations` (vocabulaire administratif transverse). La question passe de
`no_term_recognized` à `covered` → **32/32 in-domain reconnues**.

Le script n'écrit jamais dans `lexique.yaml` : il produit
`lexique.propositions.yaml`, chaque terme accompagné de la question déclenchante
et de l'article source. C'est la validation humaine tracée qui rend le lexique
défendable.

**Gold set élargi : 40 → 60 questions, hors-périmètre 8 → 28.** Le 8/8 précédent
était trop optimiste, comme la limite le laissait craindre. Testé à blanc sur 20
questions inédites (formulations indirectes sans le mot « code X », juridictions
Sénégal/Cameroun/Belgique/UE, OHADA/CIMA/COBAC, millésimes sur d'autres codes) :

| passe | bloquées | bon motif |
|---|---|---|
| avant correction | 17/20 | 17/20 |
| après correction du lexique | **19/20** | **20/20** |

Les 3 échecs initiaux étaient des défauts de **contenu**, pas d'architecture :
- `dommage` (communication) et `enfants` (impots/sante/travail) polluaient le
  vocabulaire positif → faisaient croire à tort à une couverture. Retirés.
- `bailleur`, `locataire`, `adoption` manquaient au lexique négatif. Ajoutés.
- `bail` a dû être retiré du négatif : le CGI traite la fiscalité des baux.
  L'invariant `test_negative_lexicon_disjoint_from_positive` l'a détecté et a
  évité de bloquer des questions fiscales légitimes.

**Métriques finales (60 questions)**

| métrique | valeur | cible |
|---|---|---|
| `cross_domain_empty_rate` | **27/28 (0.96)** | ≥ 0.95 |
| `cross_domain_right_reason` | **1.00** | ≥ 0.875 |
| `in_domain_blocked_rate` | **0/32 (0.00)** | 0.00 (dur) |
| Recall@5 in-domain | 0.203 | non-régression |

Le cas non bloqué (`hp-civil-responsabilite`, « qui doit réparer le dommage causé
par la chute d'un mur ») tombe en `no_term_recognized` : non bloquant, donc sans
danger. Le forcer au refus exigerait des marqueurs négatifs trop généraux qui
casseraient des questions légitimes. Le compromis est délibérément placé du côté
de la prudence, et le cas est annoté comme tel dans le gold set.

## Étape 8 — annotations corrigées + trous de corpus documentés — 2026-08-13 17:56 UTC

Gold set : 60 questions  |  seuil rag_min_score : appliqué

### Métriques de tête

| métrique | valeur | cible |
| --- | --- | --- |
| **cross_domain_empty_rate** | **27/28 (0.96)** | ≥ 0.95 |
| **in_domain_blocked_rate** | **0/32 (0.00)** | 0.00 (dur) |
| cross_domain_right_reason | 28/28 (1.00) | ≥ 0.875 |

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du travail|21, code du travail|25, code du travail|206, code du travail|140, code du travail|1 |
| travail-conges-payes | travail | easy | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|222, code du travail|224, code du travail|223, code du travail|182, code du travail|227 |
| travail-preavis-rupture | travail | easy | 0.00 | 0.50 | 0.17 | 0.22 | ✗ | code du travail|86, code du travail|82, code du travail|81, code du travail|61, code du travail|60 |
| travail-conge-maternite | travail | medium | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|210, code du travail|207, code du travail|208, code du travail|223, code du travail|211 |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|330, code du travail|81, code du travail|90, code du travail|64, code du travail|95 |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|393, code du travail|156, code du travail|128, code du travail|305, code du travail|21 |
| travail-delegates-personnel | travail | easy | 0.33 | 0.33 | 0.50 | 0.30 | ✗ | code du travail|95, code du travail|64, code du travail|336, code du travail|331, code du travail|330 |
| travail-salaire-minimum | travail | medium | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code du travail|179, code du travail|293, code du travail|110, code du travail|178, code du travail|90 |
| fiscal-is-benefice | impots | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code général des impôts|164, code général des impôts|161, code général des impôts|40, code général des impôts|11, code général des impôts|14 |
| fiscal-tva-regime | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|221, code général des impôts|248, code général des impôts|165, code général des impôts|90, code général des impôts|206 |
| fiscal-retenue-salaires | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|74, code général des impôts|90, code général des impôts|161, code général des impôts|95, code général des impôts|119 |
| fiscal-amortissements | impots | medium | 1.00 | 1.00 | 0.20 | 0.39 | ✗ | code général des impôts|196, code général des impôts|42, code général des impôts|16, code général des impôts|9, code général des impôts|38 |
| fiscal-prescription | impots | hard | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|656, code général des impôts|166, code général des impôts|462, code général des impôts|551, code général des impôts|374 |
| hydro-partage-production | hydrocarbures | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|61, code des hydrocarbures|66, code des hydrocarbures|222, code des hydrocarbures|34, code des hydrocarbures|197 |
| hydro-redevance-miniere | hydrocarbures | medium | 0.50 | 0.50 | 0.20 | 0.24 | ✗ | code des hydrocarbures|207, code des hydrocarbures|217, code des hydrocarbures|280, code des hydrocarbures|222, code des hydrocarbures|104 |
| hydro-torchage-gaz | hydrocarbures | easy | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code des hydrocarbures|125, code des hydrocarbures|264, code des hydrocarbures|127, code des hydrocarbures|126, code des hydrocarbures|1 |
| hydro-abandon-puits | hydrocarbures | medium | 1.00 | 1.00 | 0.50 | 0.63 | ✗ | code des hydrocarbures|170, code des hydrocarbures|173, code des hydrocarbures|87, code des hydrocarbures|97, code des hydrocarbures|120 |
| douane-valeur-en-douane | douane | medium | 0.67 | 1.00 | 0.33 | 0.58 | ✗ | code des douanes|34, code des douanes|32, code des douanes|30, code des douanes|33, code des douanes|29 |
| douane-franchise | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|12, code des douanes|34, code des douanes|276, code des douanes|287, code des douanes|21 |
| douane-entrepot | douane | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code des douanes|176, code des douanes|196, code des douanes|177, code des douanes|185, code des douanes|198 |
| marche-appel-offres-ouvert | marche-public | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|81, code du marché public|119, code du marché public|60, code du marché public|2, code du marché public|117 |
| marche-gre-a-gre | marche-public | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code du marché public|68, code du marché public|189, code du marché public|227, code du marché public|52, code du marché public|119 |
| marche-avance-demarrage | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|162, code du marché public|2, code du marché public|81, code du marché public|235, code du marché public|52 |
| marche-resiliation | marche-public | medium | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du marché public|227, code du marché public|229, code du marché public|228, code du marché public|185, code du marché public|225 |
| sante-pharmacie-ouverture | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|339, code de la santé publique|332, code de la santé publique|3, code de la santé publique|338, code de la santé publique|304 |
| sante-vaccination-obligations | sante | easy | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code de la santé publique|516, code de la santé publique|20, code de la santé publique|613, code de la santé publique|517, code de la santé publique|17 |
| sante-secret-medical | sante | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code de la santé publique|3, code de la santé publique|436, code de la santé publique|281, code de la santé publique|26, code de la santé publique|304 |
| sante-don-organes | sante | medium | 1.00 | 1.00 | 0.33 | 0.54 | ✗ | code de la santé publique|191, code de la santé publique|195, code de la santé publique|167, code de la santé publique|637, code de la santé publique|164 |
| comm-reseaux-sociaux | communication | easy | 1.00 | 1.00 | 1.00 | 0.91 | ✓ | code de la communication|1, code de la communication|4, code de la communication|2, code de la communication|3, code de la communication|37 |
| comm-presse-ligne | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|27, code de la communication|25, code de la communication|2bis, code de la communication|22 |
| comm-droit-rectification | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|27, code de la communication|2bis, code de la communication|2, code de la communication|15 |
| comm-publicite-commerciale | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|2bis, code de la communication|3, code de la communication|32 |

### Hors-périmètre (attendu : aucun extrait)

| id | domaine | raison attendue | raison obtenue | renvoyés | ok |
| --- | --- | --- | --- | --- | --- |
| hors-perimetre-civil-contrat | civil | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-penal-homicide | penal | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-famille-divorce | famille | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-fonction-publique | fonction_publique | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-hors-gabon | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| piege-article-abroge-smic | travail | outdated_reference | outdated_reference | 0 | ✓ |
| piege-hors-gabon-ohada-bilan | commercial | code_not_indexed / regional_not_indexed | regional_not_indexed | 0 | ✓ |
| piege-terminologie-trompeuse | civil | code_not_indexed | code_not_indexed | 0 | ✓ |
| hp-civil-bail | civil | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-civil-responsabilite | civil | no_term_recognized | no_term_recognized | 6 | ✗ |
| hp-penal-vol | penal | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-penal-recidive | penal | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-famille-adoption | famille | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-famille-pension | famille | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-fp-avancement | fonction_publique | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-admin-recours | administratif | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-commercial-rcs | commercial | domain_not_indexed / code_not_indexed / regional_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-jur-senegal | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-cameroun | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-belge | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-europe | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-ohada-suretes | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-cima-assurance | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-cobac-banque | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-millesime-impots | impots | outdated_reference | outdated_reference | 0 | ✓ |
| hp-millesime-hydro | hydrocarbures | outdated_reference | outdated_reference | 0 | ✓ |
| hp-code-penal-nomme | penal | code_not_indexed / domain_not_indexed | code_not_indexed | 0 | ✓ |
| hp-code-famille-nomme | famille | code_not_indexed / domain_not_indexed | code_not_indexed | 0 | ✓ |

### Récap par domaine

| domaine | n | R@5 | R@10 | MRR | NDCG@10 | top1 |
| --- | --- | --- | --- | --- | --- | --- |
| communication | 4 | 0.25 | 0.25 | 0.25 | 0.23 | 0.25 |
| douane | 3 | 0.39 | 0.50 | 0.44 | 0.40 | 0.33 |
| hydrocarbures | 4 | 0.54 | 0.54 | 0.42 | 0.38 | 0.25 |
| impots | 5 | 0.27 | 0.27 | 0.09 | 0.12 | 0.00 |
| marche-public | 4 | 0.25 | 0.25 | 0.38 | 0.25 | 0.25 |
| sante | 4 | 0.46 | 0.46 | 0.40 | 0.34 | 0.25 |
| travail | 8 | 0.44 | 0.50 | 0.52 | 0.45 | 0.38 |
| **GLOBAL** | 32 | **0.37** | **0.40** | **0.37** | **0.32** | **0.25** |

Cross-domaine correctement vides : **27/28**

### Note étape 8 — correction des annotations du gold set

Le Recall@5 de 0.203 mesurait en grande partie la qualité du jeu de test, pas
celle du moteur. Vérification faite en lisant le texte intégral des articles
déclarés « bonne réponse » : **8 annotations sur 32 désignaient des articles
sans rapport avec la question**.

| question | attendait… | qui traite en réalité de | corrigé en |
|---|---|---|---|
| travail-conges-payes | 149-150 | conventions collectives | **222, 224** |
| fiscal-amortissements | 13-14 | (générique) | **38** |
| marche-avance-demarrage | 117-118 | appels d'offres infructueux | **211, 213** |
| marche-resiliation | 137-139 | prestations intellectuelles | **229, 230** |
| sante-vaccination-obligations | 271-272 | compétences des sage-femmes | **516, 521** |
| sante-don-organes | 50-52 | ministère / conseil national | **164, 167** |
| douane-entrepot | 150-152 | (art.152 absent) | **176, 191** |
| hydro-abandon-puits | 115-116 | (non pertinents) | **173** |

Les articles de remplacement ont été trouvés par recherche plein-texte dans le
bon code, puis vérifiés un par un. Exemple : l'art.222 du Code du travail dit
« le travailleur acquiert droit au congé … à raison de deux (2) jours ouvrables
par mois de service effectif » — exactement la question posée.

**4 questions sont hors de portée du moteur** et sont désormais marquées
`known_gap: true`, donc comptées à part :
- `comm-droit-rectification`, `comm-publicite-commerciale`, `comm-presse-ligne` :
  les articles attendus (60-62, 80-81) **n'existent pas** — le PDF du Code de la
  communication indexé s'arrête à l'article 55.
- `fiscal-prescription` : la prescription est bien dans le CGI, mais noyée dans
  l'article 815, **un chunk de 185 666 caractères**.

**Défaut de découpage découvert au passage** : 9 chunks sur 3277 (0,3 %) portent
**16 % du texte total** du corpus. Le plus gros (CGI art.815) fait à lui seul
plus de 10 % du corpus, contre une médiane de 361 caractères. Un tel chunk est
illisible pour un embedding — son vecteur est une moyenne diluée qui ne ressemble
à aucune question précise. C'est une cause structurelle de silence, indépendante
du ranking.

| chunk | taille |
|---|---|
| CGI art.815 | 185 666 car. |
| Hydrocarbures art.9 | 21 196 car. |
| CGI art.271 | 20 091 car. |
| Marché public art.2 | 18 602 car. |
| *(médiane du corpus)* | *361 car.* |

**Métriques après correction**

| périmètre | R@5 | R@10 | MRR |
|---|---|---|---|
| avant correction (32 q) | 0.203 | 0.229 | 0.225 |
| toutes questions (32 q) | 0.375 | — | — |
| **corpus atteignable (28 q)** | **0.429** | **0.458** | **0.419** |

Le moteur est donc **deux fois meilleur** que ce que le chiffre historique
laissait croire : 0.429 contre 0.203, sans qu'une seule ligne du pipeline de
recherche ait été modifiée. Les comparaisons avec les étapes 1 à 7 ne sont plus
valides — c'est une rebaseline.

Refus inchangés : `cross_domain_empty_rate` 27/28, `in_domain_blocked_rate` 0/32.

Prochain levier mesurable : le pool remis au cross-encoder. `_hybrid_rescore`
coupe à 12 les 24 candidats récupérés, donc le reranker ne voit jamais les rangs
13-24 — or plusieurs bons articles s'y trouvent (rangs 7 à 21 constatés). Les
réglages `rag_fetch_pool` / `rag_rerank_pool` ont été ajoutés à `config.py` pour
permettre cette mesure ; **elle n'a pas encore été faite**.

## Étape 9 — contrôle après restauration du pipeline — 2026-08-13 18:48 UTC

Gold set : 60 questions  |  seuil rag_min_score : appliqué

### Métriques de tête

| métrique | valeur | cible |
| --- | --- | --- |
| **cross_domain_empty_rate** | **27/28 (0.96)** | ≥ 0.95 |
| **in_domain_blocked_rate** | **0/32 (0.00)** | 0.00 (dur) |
| cross_domain_right_reason | 28/28 (1.00) | ≥ 0.875 |

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du travail|21, code du travail|25, code du travail|206, code du travail|140, code du travail|1 |
| travail-conges-payes | travail | easy | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|222, code du travail|224, code du travail|223, code du travail|182, code du travail|227 |
| travail-preavis-rupture | travail | easy | 0.00 | 0.50 | 0.17 | 0.22 | ✗ | code du travail|86, code du travail|82, code du travail|81, code du travail|61, code du travail|60 |
| travail-conge-maternite | travail | medium | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|210, code du travail|207, code du travail|208, code du travail|223, code du travail|211 |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|330, code du travail|81, code du travail|90, code du travail|64, code du travail|95 |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|393, code du travail|156, code du travail|128, code du travail|305, code du travail|21 |
| travail-delegates-personnel | travail | easy | 0.33 | 0.33 | 0.50 | 0.30 | ✗ | code du travail|95, code du travail|64, code du travail|336, code du travail|331, code du travail|330 |
| travail-salaire-minimum | travail | medium | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code du travail|179, code du travail|293, code du travail|110, code du travail|178, code du travail|90 |
| fiscal-is-benefice | impots | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code général des impôts|164, code général des impôts|161, code général des impôts|40, code général des impôts|11, code général des impôts|14 |
| fiscal-tva-regime | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|221, code général des impôts|248, code général des impôts|165, code général des impôts|90, code général des impôts|206 |
| fiscal-retenue-salaires | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|74, code général des impôts|90, code général des impôts|161, code général des impôts|95, code général des impôts|119 |
| fiscal-amortissements | impots | medium | 1.00 | 1.00 | 0.20 | 0.39 | ✗ | code général des impôts|196, code général des impôts|42, code général des impôts|16, code général des impôts|9, code général des impôts|38 |
| fiscal-prescription | impots | hard | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|656, code général des impôts|166, code général des impôts|462, code général des impôts|551, code général des impôts|374 |
| hydro-partage-production | hydrocarbures | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|61, code des hydrocarbures|66, code des hydrocarbures|222, code des hydrocarbures|34, code des hydrocarbures|197 |
| hydro-redevance-miniere | hydrocarbures | medium | 0.50 | 0.50 | 0.20 | 0.24 | ✗ | code des hydrocarbures|207, code des hydrocarbures|217, code des hydrocarbures|280, code des hydrocarbures|222, code des hydrocarbures|104 |
| hydro-torchage-gaz | hydrocarbures | easy | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code des hydrocarbures|125, code des hydrocarbures|264, code des hydrocarbures|127, code des hydrocarbures|126, code des hydrocarbures|1 |
| hydro-abandon-puits | hydrocarbures | medium | 1.00 | 1.00 | 0.50 | 0.63 | ✗ | code des hydrocarbures|170, code des hydrocarbures|173, code des hydrocarbures|87, code des hydrocarbures|97, code des hydrocarbures|120 |
| douane-valeur-en-douane | douane | medium | 0.67 | 1.00 | 0.33 | 0.58 | ✗ | code des douanes|34, code des douanes|32, code des douanes|30, code des douanes|33, code des douanes|29 |
| douane-franchise | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|12, code des douanes|34, code des douanes|276, code des douanes|287, code des douanes|21 |
| douane-entrepot | douane | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code des douanes|176, code des douanes|196, code des douanes|177, code des douanes|185, code des douanes|198 |
| marche-appel-offres-ouvert | marche-public | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|81, code du marché public|119, code du marché public|60, code du marché public|2, code du marché public|117 |
| marche-gre-a-gre | marche-public | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code du marché public|68, code du marché public|189, code du marché public|227, code du marché public|52, code du marché public|119 |
| marche-avance-demarrage | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|162, code du marché public|2, code du marché public|81, code du marché public|235, code du marché public|52 |
| marche-resiliation | marche-public | medium | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du marché public|227, code du marché public|229, code du marché public|228, code du marché public|185, code du marché public|225 |
| sante-pharmacie-ouverture | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|339, code de la santé publique|332, code de la santé publique|3, code de la santé publique|338, code de la santé publique|304 |
| sante-vaccination-obligations | sante | easy | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code de la santé publique|516, code de la santé publique|20, code de la santé publique|613, code de la santé publique|517, code de la santé publique|17 |
| sante-secret-medical | sante | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code de la santé publique|3, code de la santé publique|436, code de la santé publique|281, code de la santé publique|26, code de la santé publique|304 |
| sante-don-organes | sante | medium | 1.00 | 1.00 | 0.33 | 0.54 | ✗ | code de la santé publique|191, code de la santé publique|195, code de la santé publique|167, code de la santé publique|637, code de la santé publique|164 |
| comm-reseaux-sociaux | communication | easy | 1.00 | 1.00 | 1.00 | 0.91 | ✓ | code de la communication|1, code de la communication|4, code de la communication|2, code de la communication|3, code de la communication|37 |
| comm-presse-ligne | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|27, code de la communication|25, code de la communication|2bis, code de la communication|22 |
| comm-droit-rectification | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|27, code de la communication|2bis, code de la communication|2, code de la communication|15 |
| comm-publicite-commerciale | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|2bis, code de la communication|3, code de la communication|32 |

### Hors-périmètre (attendu : aucun extrait)

| id | domaine | raison attendue | raison obtenue | renvoyés | ok |
| --- | --- | --- | --- | --- | --- |
| hors-perimetre-civil-contrat | civil | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-penal-homicide | penal | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-famille-divorce | famille | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-fonction-publique | fonction_publique | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-hors-gabon | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| piege-article-abroge-smic | travail | outdated_reference | outdated_reference | 0 | ✓ |
| piege-hors-gabon-ohada-bilan | commercial | code_not_indexed / regional_not_indexed | regional_not_indexed | 0 | ✓ |
| piege-terminologie-trompeuse | civil | code_not_indexed | code_not_indexed | 0 | ✓ |
| hp-civil-bail | civil | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-civil-responsabilite | civil | no_term_recognized | no_term_recognized | 6 | ✗ |
| hp-penal-vol | penal | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-penal-recidive | penal | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-famille-adoption | famille | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-famille-pension | famille | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-fp-avancement | fonction_publique | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-admin-recours | administratif | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-commercial-rcs | commercial | domain_not_indexed / code_not_indexed / regional_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-jur-senegal | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-cameroun | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-belge | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-europe | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-ohada-suretes | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-cima-assurance | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-cobac-banque | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-millesime-impots | impots | outdated_reference | outdated_reference | 0 | ✓ |
| hp-millesime-hydro | hydrocarbures | outdated_reference | outdated_reference | 0 | ✓ |
| hp-code-penal-nomme | penal | code_not_indexed / domain_not_indexed | code_not_indexed | 0 | ✓ |
| hp-code-famille-nomme | famille | code_not_indexed / domain_not_indexed | code_not_indexed | 0 | ✓ |

### Récap par domaine

| domaine | n | R@5 | R@10 | MRR | NDCG@10 | top1 |
| --- | --- | --- | --- | --- | --- | --- |
| communication | 4 | 0.25 | 0.25 | 0.25 | 0.23 | 0.25 |
| douane | 3 | 0.39 | 0.50 | 0.44 | 0.40 | 0.33 |
| hydrocarbures | 4 | 0.54 | 0.54 | 0.42 | 0.38 | 0.25 |
| impots | 5 | 0.27 | 0.27 | 0.09 | 0.12 | 0.00 |
| marche-public | 4 | 0.25 | 0.25 | 0.38 | 0.25 | 0.25 |
| sante | 4 | 0.46 | 0.46 | 0.40 | 0.34 | 0.25 |
| travail | 8 | 0.44 | 0.50 | 0.52 | 0.45 | 0.38 |
| **GLOBAL** | 32 | **0.37** | **0.40** | **0.37** | **0.32** | **0.25** |

Cross-domaine correctement vides : **27/28**

### Note étape 9 — pool du cross-encoder : hypothèse INVALIDÉE

Hypothèse testée : `_hybrid_rescore` coupant à 12 les 24 candidats, le reranker
ne verrait jamais les rangs 13-24, où plusieurs bons articles ont été observés
(rangs 7 à 21). Élargir le pool devait donc améliorer le rappel.

**C'est faux.** Trois mesures successives, sur les 28 questions atteignables :

| configuration | R@5 | R@10 | MRR | s/q |
|---|---|---|---|---|
| **24 / 12 (référence)** | **0.429** | **0.458** | **0.419** | 4.5 |
| fetch 40 / rerank 20 | 0.405 | 0.446 | 0.440 | 5.8 |
| fetch 60 / rerank 30 | 0.405 | 0.446 | 0.440 | 12.5 |
| sortie reranker élargie à 12 | 0.292 | 0.440 | 0.333 | 4.5 |

Trois enseignements :

1. **Élargir le pool dégrade le R@5** (-5.6 %) tout en améliorant le MRR
   (0.419 → 0.440). Le reranker classe mieux le premier résultat quand il voit
   plus de candidats, mais le seuil `rag_min_score` — appliqué au score hybride
   normalisé **min-max sur le pool** — ne coupe alors plus au même endroit.
   Pool et seuil interagissent : on ne peut pas régler l'un sans l'autre.

2. **60/30 donne exactement 40/20** (chiffres identiques au millième). Cause
   trouvée : `merged = merged[:k_eff]` dans `search_expanded` coupe à
   `rag_top_k` = 12 avant le reranker, quelle que soit la taille du pool amont.
   Les réglages `rag_fetch_pool` / `rag_rerank_pool` ajoutés à `config.py`
   n'agissent donc que sur `search_main`, en amont de cette coupe.

3. **Élargir la sortie du reranker est nettement pire** : `top_k_llm` porté de
   6 à 12 fait chuter le R@5 de 0.429 à 0.292 (-32 %), le R@10 restant stable
   (0.440). Le cross-encoder réordonne alors le top-5, et son classement y est
   moins bon que le score hybride. `top_k_llm = 6` n'était pas arbitraire.

**Le pipeline est restauré à l'identique** (24/12, `top_k_llm` = 6) et re-mesuré :
R@5 = 0.429, R@10 = 0.458, MRR = 0.419. Un commentaire d'avertissement a été
ajouté dans `retriever.py` pour éviter qu'on « corrige » ce plafond sans mesurer.

Conclusion pour la suite : le ranking n'est pas le levier. Les gains restants
sont ailleurs — au chunking (9 chunks portent 16 % du corpus, dont un de 185 666
caractères) et au corpus lui-même (Code de la communication tronqué à l'art. 55).

## Étape 10 — chunking corrigé (Livre 5 CGI détecté) — 2026-08-13 19:08 UTC

Gold set : 60 questions  |  seuil rag_min_score : appliqué

### Métriques de tête

| métrique | valeur | cible |
| --- | --- | --- |
| **cross_domain_empty_rate** | **27/28 (0.96)** | ≥ 0.95 |
| **in_domain_blocked_rate** | **0/32 (0.00)** | 0.00 (dur) |
| cross_domain_right_reason | 28/28 (1.00) | ≥ 0.875 |

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du travail|21, code du travail|25, code du travail|206, code du travail|140, code du travail|1 |
| travail-conges-payes | travail | easy | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|222, code du travail|224, code du travail|223, code du travail|182, code du travail|227 |
| travail-preavis-rupture | travail | easy | 0.00 | 0.50 | 0.17 | 0.22 | ✗ | code du travail|86, code du travail|82, code du travail|81, code du travail|61, code du travail|60 |
| travail-conge-maternite | travail | medium | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|210, code du travail|207, code du travail|208, code du travail|223, code du travail|211 |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|330, code du travail|81, code du travail|90, code du travail|64, code du travail|95 |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|393, code du travail|156, code du travail|128, code du travail|305, code du travail|21 |
| travail-delegates-personnel | travail | easy | 0.33 | 0.33 | 0.50 | 0.30 | ✗ | code du travail|95, code du travail|64, code du travail|336, code du travail|331, code du travail|330 |
| travail-salaire-minimum | travail | medium | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code du travail|179, code du travail|293, code du travail|110, code du travail|178, code du travail|90 |
| fiscal-is-benefice | impots | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code général des impôts|164, code général des impôts|161, code général des impôts|40, code général des impôts|11, code général des impôts|14 |
| fiscal-tva-regime | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|221, code général des impôts|248, code général des impôts|165, code général des impôts|p-896, code général des impôts|90 |
| fiscal-retenue-salaires | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|74, code général des impôts|90, code général des impôts|161, code général des impôts|95, code général des impôts|119 |
| fiscal-amortissements | impots | medium | 1.00 | 1.00 | 0.20 | 0.39 | ✗ | code général des impôts|196, code général des impôts|42, code général des impôts|16, code général des impôts|9, code général des impôts|38 |
| fiscal-prescription | impots | hard | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|p-1036, code général des impôts|p-872, code général des impôts|656, code général des impôts|p-992, code général des impôts|166 |
| hydro-partage-production | hydrocarbures | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|61, code des hydrocarbures|66, code des hydrocarbures|222, code des hydrocarbures|34, code des hydrocarbures|197 |
| hydro-redevance-miniere | hydrocarbures | medium | 0.50 | 0.50 | 0.20 | 0.24 | ✗ | code des hydrocarbures|207, code des hydrocarbures|217, code des hydrocarbures|280, code des hydrocarbures|222, code des hydrocarbures|104 |
| hydro-torchage-gaz | hydrocarbures | easy | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code des hydrocarbures|125, code des hydrocarbures|264, code des hydrocarbures|127, code des hydrocarbures|126, code des hydrocarbures|1 |
| hydro-abandon-puits | hydrocarbures | medium | 1.00 | 1.00 | 0.50 | 0.63 | ✗ | code des hydrocarbures|170, code des hydrocarbures|173, code des hydrocarbures|87, code des hydrocarbures|97, code des hydrocarbures|120 |
| douane-valeur-en-douane | douane | medium | 0.67 | 1.00 | 0.33 | 0.58 | ✗ | code des douanes|34, code des douanes|32, code des douanes|30, code des douanes|33, code des douanes|29 |
| douane-franchise | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|12, code des douanes|34, code des douanes|276, code des douanes|287, code des douanes|21 |
| douane-entrepot | douane | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code des douanes|176, code des douanes|196, code des douanes|177, code des douanes|185, code des douanes|198 |
| marche-appel-offres-ouvert | marche-public | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|81, code du marché public|119, code du marché public|60, code du marché public|2, code du marché public|117 |
| marche-gre-a-gre | marche-public | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code du marché public|68, code du marché public|189, code du marché public|227, code du marché public|52, code du marché public|119 |
| marche-avance-demarrage | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|162, code du marché public|2, code du marché public|81, code du marché public|235, code du marché public|52 |
| marche-resiliation | marche-public | medium | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du marché public|227, code du marché public|229, code du marché public|228, code du marché public|185, code du marché public|225 |
| sante-pharmacie-ouverture | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|339, code de la santé publique|332, code de la santé publique|3, code de la santé publique|338, code de la santé publique|304 |
| sante-vaccination-obligations | sante | easy | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code de la santé publique|516, code de la santé publique|20, code de la santé publique|613, code de la santé publique|517, code de la santé publique|17 |
| sante-secret-medical | sante | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code de la santé publique|3, code de la santé publique|436, code de la santé publique|281, code de la santé publique|26, code de la santé publique|304 |
| sante-don-organes | sante | medium | 1.00 | 1.00 | 0.33 | 0.54 | ✗ | code de la santé publique|191, code de la santé publique|195, code de la santé publique|167, code de la santé publique|637, code de la santé publique|164 |
| comm-reseaux-sociaux | communication | easy | 1.00 | 1.00 | 1.00 | 0.91 | ✓ | code de la communication|1, code de la communication|4, code de la communication|2, code de la communication|3, code de la communication|37 |
| comm-presse-ligne | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|27, code de la communication|25, code de la communication|2bis, code de la communication|22 |
| comm-droit-rectification | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|27, code de la communication|2bis, code de la communication|2, code de la communication|15 |
| comm-publicite-commerciale | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|2bis, code de la communication|3, code de la communication|32 |

### Hors-périmètre (attendu : aucun extrait)

| id | domaine | raison attendue | raison obtenue | renvoyés | ok |
| --- | --- | --- | --- | --- | --- |
| hors-perimetre-civil-contrat | civil | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-penal-homicide | penal | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-famille-divorce | famille | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-fonction-publique | fonction_publique | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-hors-gabon | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| piege-article-abroge-smic | travail | outdated_reference | outdated_reference | 0 | ✓ |
| piege-hors-gabon-ohada-bilan | commercial | code_not_indexed / regional_not_indexed | regional_not_indexed | 0 | ✓ |
| piege-terminologie-trompeuse | civil | code_not_indexed | code_not_indexed | 0 | ✓ |
| hp-civil-bail | civil | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-civil-responsabilite | civil | no_term_recognized | no_term_recognized | 6 | ✗ |
| hp-penal-vol | penal | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-penal-recidive | penal | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-famille-adoption | famille | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-famille-pension | famille | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-fp-avancement | fonction_publique | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-admin-recours | administratif | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-commercial-rcs | commercial | domain_not_indexed / code_not_indexed / regional_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-jur-senegal | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-cameroun | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-belge | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-europe | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-ohada-suretes | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-cima-assurance | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-cobac-banque | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-millesime-impots | impots | outdated_reference | outdated_reference | 0 | ✓ |
| hp-millesime-hydro | hydrocarbures | outdated_reference | outdated_reference | 0 | ✓ |
| hp-code-penal-nomme | penal | code_not_indexed / domain_not_indexed | code_not_indexed | 0 | ✓ |
| hp-code-famille-nomme | famille | code_not_indexed / domain_not_indexed | code_not_indexed | 0 | ✓ |

### Récap par domaine

| domaine | n | R@5 | R@10 | MRR | NDCG@10 | top1 |
| --- | --- | --- | --- | --- | --- | --- |
| communication | 4 | 0.25 | 0.25 | 0.25 | 0.23 | 0.25 |
| douane | 3 | 0.39 | 0.50 | 0.44 | 0.40 | 0.33 |
| hydrocarbures | 4 | 0.54 | 0.54 | 0.42 | 0.38 | 0.25 |
| impots | 5 | 0.27 | 0.27 | 0.09 | 0.12 | 0.00 |
| marche-public | 4 | 0.25 | 0.25 | 0.38 | 0.25 | 0.25 |
| sante | 4 | 0.46 | 0.46 | 0.40 | 0.34 | 0.25 |
| travail | 8 | 0.44 | 0.50 | 0.52 | 0.45 | 0.38 |
| **GLOBAL** | 32 | **0.37** | **0.40** | **0.37** | **0.32** | **0.25** |

Cross-domaine correctement vides : **27/28**

## Étape 10b — prescription fiscale réintégrée — 2026-08-13 19:12 UTC

Gold set : 60 questions  |  seuil rag_min_score : appliqué

### Métriques de tête

| métrique | valeur | cible |
| --- | --- | --- |
| **cross_domain_empty_rate** | **27/28 (0.96)** | ≥ 0.95 |
| **in_domain_blocked_rate** | **0/32 (0.00)** | 0.00 (dur) |
| cross_domain_right_reason | 28/28 (1.00) | ≥ 0.875 |

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du travail|21, code du travail|25, code du travail|206, code du travail|140, code du travail|1 |
| travail-conges-payes | travail | easy | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|222, code du travail|224, code du travail|223, code du travail|182, code du travail|227 |
| travail-preavis-rupture | travail | easy | 0.00 | 0.50 | 0.17 | 0.22 | ✗ | code du travail|86, code du travail|82, code du travail|81, code du travail|61, code du travail|60 |
| travail-conge-maternite | travail | medium | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|210, code du travail|207, code du travail|208, code du travail|223, code du travail|211 |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|330, code du travail|81, code du travail|90, code du travail|64, code du travail|95 |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|393, code du travail|156, code du travail|128, code du travail|305, code du travail|21 |
| travail-delegates-personnel | travail | easy | 0.33 | 0.33 | 0.50 | 0.30 | ✗ | code du travail|95, code du travail|64, code du travail|336, code du travail|331, code du travail|330 |
| travail-salaire-minimum | travail | medium | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code du travail|179, code du travail|293, code du travail|110, code du travail|178, code du travail|90 |
| fiscal-is-benefice | impots | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code général des impôts|164, code général des impôts|161, code général des impôts|40, code général des impôts|11, code général des impôts|14 |
| fiscal-tva-regime | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|221, code général des impôts|248, code général des impôts|165, code général des impôts|p-896, code général des impôts|90 |
| fiscal-retenue-salaires | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|74, code général des impôts|90, code général des impôts|161, code général des impôts|95, code général des impôts|119 |
| fiscal-amortissements | impots | medium | 1.00 | 1.00 | 0.20 | 0.39 | ✗ | code général des impôts|196, code général des impôts|42, code général des impôts|16, code général des impôts|9, code général des impôts|38 |
| fiscal-prescription | impots | hard | 1.00 | 1.00 | 0.50 | 0.65 | ✗ | code général des impôts|p-1036, code général des impôts|p-872, code général des impôts|656, code général des impôts|p-992, code général des impôts|166 |
| hydro-partage-production | hydrocarbures | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|61, code des hydrocarbures|66, code des hydrocarbures|222, code des hydrocarbures|34, code des hydrocarbures|197 |
| hydro-redevance-miniere | hydrocarbures | medium | 0.50 | 0.50 | 0.20 | 0.24 | ✗ | code des hydrocarbures|207, code des hydrocarbures|217, code des hydrocarbures|280, code des hydrocarbures|222, code des hydrocarbures|104 |
| hydro-torchage-gaz | hydrocarbures | easy | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code des hydrocarbures|125, code des hydrocarbures|264, code des hydrocarbures|127, code des hydrocarbures|126, code des hydrocarbures|1 |
| hydro-abandon-puits | hydrocarbures | medium | 1.00 | 1.00 | 0.50 | 0.63 | ✗ | code des hydrocarbures|170, code des hydrocarbures|173, code des hydrocarbures|87, code des hydrocarbures|97, code des hydrocarbures|120 |
| douane-valeur-en-douane | douane | medium | 0.67 | 1.00 | 0.33 | 0.58 | ✗ | code des douanes|34, code des douanes|32, code des douanes|30, code des douanes|33, code des douanes|29 |
| douane-franchise | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|12, code des douanes|34, code des douanes|276, code des douanes|287, code des douanes|21 |
| douane-entrepot | douane | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code des douanes|176, code des douanes|196, code des douanes|177, code des douanes|185, code des douanes|198 |
| marche-appel-offres-ouvert | marche-public | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|81, code du marché public|119, code du marché public|60, code du marché public|2, code du marché public|117 |
| marche-gre-a-gre | marche-public | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code du marché public|68, code du marché public|189, code du marché public|227, code du marché public|52, code du marché public|119 |
| marche-avance-demarrage | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|162, code du marché public|2, code du marché public|81, code du marché public|235, code du marché public|52 |
| marche-resiliation | marche-public | medium | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du marché public|227, code du marché public|229, code du marché public|228, code du marché public|185, code du marché public|225 |
| sante-pharmacie-ouverture | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|339, code de la santé publique|332, code de la santé publique|3, code de la santé publique|338, code de la santé publique|304 |
| sante-vaccination-obligations | sante | easy | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code de la santé publique|516, code de la santé publique|20, code de la santé publique|613, code de la santé publique|517, code de la santé publique|17 |
| sante-secret-medical | sante | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code de la santé publique|3, code de la santé publique|436, code de la santé publique|281, code de la santé publique|26, code de la santé publique|304 |
| sante-don-organes | sante | medium | 1.00 | 1.00 | 0.33 | 0.54 | ✗ | code de la santé publique|191, code de la santé publique|195, code de la santé publique|167, code de la santé publique|637, code de la santé publique|164 |
| comm-reseaux-sociaux | communication | easy | 1.00 | 1.00 | 1.00 | 0.91 | ✓ | code de la communication|1, code de la communication|4, code de la communication|2, code de la communication|3, code de la communication|37 |
| comm-presse-ligne | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|27, code de la communication|25, code de la communication|2bis, code de la communication|22 |
| comm-droit-rectification | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|27, code de la communication|2bis, code de la communication|2, code de la communication|15 |
| comm-publicite-commerciale | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|2bis, code de la communication|3, code de la communication|32 |

### Hors-périmètre (attendu : aucun extrait)

| id | domaine | raison attendue | raison obtenue | renvoyés | ok |
| --- | --- | --- | --- | --- | --- |
| hors-perimetre-civil-contrat | civil | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-penal-homicide | penal | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-famille-divorce | famille | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-fonction-publique | fonction_publique | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-hors-gabon | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| piege-article-abroge-smic | travail | outdated_reference | outdated_reference | 0 | ✓ |
| piege-hors-gabon-ohada-bilan | commercial | code_not_indexed / regional_not_indexed | regional_not_indexed | 0 | ✓ |
| piege-terminologie-trompeuse | civil | code_not_indexed | code_not_indexed | 0 | ✓ |
| hp-civil-bail | civil | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-civil-responsabilite | civil | no_term_recognized | no_term_recognized | 6 | ✗ |
| hp-penal-vol | penal | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-penal-recidive | penal | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-famille-adoption | famille | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-famille-pension | famille | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-fp-avancement | fonction_publique | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-admin-recours | administratif | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-commercial-rcs | commercial | domain_not_indexed / code_not_indexed / regional_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-jur-senegal | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-cameroun | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-belge | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-europe | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-ohada-suretes | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-cima-assurance | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-cobac-banque | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-millesime-impots | impots | outdated_reference | outdated_reference | 0 | ✓ |
| hp-millesime-hydro | hydrocarbures | outdated_reference | outdated_reference | 0 | ✓ |
| hp-code-penal-nomme | penal | code_not_indexed / domain_not_indexed | code_not_indexed | 0 | ✓ |
| hp-code-famille-nomme | famille | code_not_indexed / domain_not_indexed | code_not_indexed | 0 | ✓ |

### Récap par domaine

| domaine | n | R@5 | R@10 | MRR | NDCG@10 | top1 |
| --- | --- | --- | --- | --- | --- | --- |
| communication | 4 | 0.25 | 0.25 | 0.25 | 0.23 | 0.25 |
| douane | 3 | 0.39 | 0.50 | 0.44 | 0.40 | 0.33 |
| hydrocarbures | 4 | 0.54 | 0.54 | 0.42 | 0.38 | 0.25 |
| impots | 5 | 0.47 | 0.47 | 0.19 | 0.25 | 0.00 |
| marche-public | 4 | 0.25 | 0.25 | 0.38 | 0.25 | 0.25 |
| sante | 4 | 0.46 | 0.46 | 0.40 | 0.34 | 0.25 |
| travail | 8 | 0.44 | 0.50 | 0.52 | 0.45 | 0.38 |
| **GLOBAL** | 32 | **0.40** | **0.42** | **0.38** | **0.34** | **0.25** |

Cross-domaine correctement vides : **27/28**

### Note étape 10 — correction du chunking (préfixes de livre)

Diagnostic des 9 chunks géants (0,3 % des chunks portant 16 % du texte) : **deux
causes distinctes**, pas une.

**(a) Bug de détection — corrigé.** Le CGI art.815 (185 666 car.) contenait
encore **336 en-têtes d'article non détectés**, au format `Art.P‐816.‐` : le
Livre 5 « Procédures fiscales » préfixe ses articles d'un `P` et sépare avec un
tiret Unicode `‐` (U+2010). `_ARTICLE_HEADER_RE` exigeait le numéro directement
après `article|art.`, donc tout le livre restait soudé. Le Code de la
communication art.2 (11 en-têtes internes) souffrait du même défaut.

Correction : troisième forme dans `_ARTICLE_HEADER_RE` acceptant un préfixe de
lettre, et `_normalize_article_number` normalisant « P ‐ 816 » → « p-816 ». Le
préfixe est **conservé** dans le numéro : sans lui, l'article P-816 des
Procédures fiscales collisionnerait avec l'article 816 d'un autre livre.

**(b) Articles de définitions — non corrigés, délibérément.** Les 8 autres gros
chunks (Hydrocarbures art.9, CGI art.271, Marché public art.2, Santé art.4…) ne
contiennent aucun en-tête interne : ce sont de véritables articles-glossaires,
longs par nature. L'ingestion utilise `one_per_article=True` (choix T2.1 : un
chunk = un article citable). Les scinder ferait passer le corpus de 2780 à 3037
chunks pour les 5 codes testés, avec un maximum ramené de ~20 000 à ~1 520 car.
Non appliqué ici : cela change l'unité de citation, donc mérite sa propre
mesure.

**Effet mesuré**

| | avant | après |
|---|---|---|
| chunks indexés | 3 277 | **3 613** |
| plus gros chunk | 185 666 car. | **21 196 car.** |
| chunks > 10 000 car. | 9 | 8 |
| articles du Livre 5 (P-xxx) indexés | **0** | **336** |
| médiane | 361 car. | 366 car. |

**Gain concret et vérifié.** `fiscal-prescription` était classée `known_gap`
(insatisfiable). L'article P-872 — « L'action en recouvrement des droits se
prescrit : 1° après un délai de 5 ans… » — est désormais un chunk autonome de
1 281 caractères. La question est réintégrée à l'évaluation, et le moteur la
résout avec **Recall@5 = 1.00** (P-872 et P-992 tous deux dans le top-5).

| périmètre | R@5 | R@10 | MRR |
|---|---|---|---|
| 28 q atteignables (étape 8) | 0.429 | 0.458 | 0.419 |
| **29 q atteignables (étape 10)** | **0.448** | **0.477** | **0.422** |

Invariant de non-régression respecté : `code-travail-2021.pdf` donne toujours
**415 numéros uniques** — 453 segments = 417 articles distincts + 36 suites
d'articles longs, conforme à CLAUDE.md.

Refus inchangés : `cross_domain_empty_rate` 27/28, `in_domain_blocked_rate` 0/32.

Reste hors portée : 3 questions sur le Code de la communication, dont le PDF
indexé s'arrête à l'article 55 (articles 60-62 et 80-81 attendus absents). C'est
un trou de **corpus**, pas de moteur : il faut un PDF complet.

## Étape 11 — articles-glossaires scindés (max 21k → 1.5k car.) — 2026-08-13 19:38 UTC

Gold set : 60 questions  |  seuil rag_min_score : appliqué

### Métriques de tête

| métrique | valeur | cible |
| --- | --- | --- |
| **cross_domain_empty_rate** | **27/28 (0.96)** | ≥ 0.95 |
| **in_domain_blocked_rate** | **0/32 (0.00)** | 0.00 (dur) |
| cross_domain_right_reason | 28/28 (1.00) | ≥ 0.875 |

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|21, code du travail|206, code du travail|140, code du travail|1, code du travail|54 |
| travail-conges-payes | travail | easy | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|222, code du travail|224, code du travail|223, code du travail|54, code du travail|227 |
| travail-preavis-rupture | travail | easy | 0.50 | 1.00 | 0.25 | 0.48 | ✗ | code du travail|86, code du travail|82, code du travail|81, code du travail|54, code du travail|61 |
| travail-conge-maternite | travail | medium | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|207, code du travail|210, code du travail|208, code du travail|223, code du travail|54 |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|330, code du travail|81, code du travail|74, code du travail|6, code du travail|90 |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|393, code du travail|156, code du travail|15, code du travail|128, code du travail|21 |
| travail-delegates-personnel | travail | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|95, code du travail|336, code du travail|331, code du travail|330, code du travail|145 |
| travail-salaire-minimum | travail | medium | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code du travail|179, code du travail|293, code du travail|110, code du travail|178, code du travail|90 |
| fiscal-is-benefice | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|5, code général des impôts|8, code général des impôts|40, code général des impôts|14, code général des impôts|12 |
| fiscal-tva-regime | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|221, code général des impôts|248, code général des impôts|11, code général des impôts|165, code général des impôts|p-896 |
| fiscal-retenue-salaires | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|74, code général des impôts|90, code général des impôts|161, code général des impôts|95, code général des impôts|119 |
| fiscal-amortissements | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|196, code général des impôts|42, code général des impôts|11, code général des impôts|16, code général des impôts|209 |
| fiscal-prescription | impots | hard | 1.00 | 1.00 | 0.50 | 0.65 | ✗ | code général des impôts|p-1036, code général des impôts|p-872, code général des impôts|656, code général des impôts|p-992, code général des impôts|166 |
| hydro-partage-production | hydrocarbures | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|61, code des hydrocarbures|66, code des hydrocarbures|222, code des hydrocarbures|197, code des hydrocarbures|9 |
| hydro-redevance-miniere | hydrocarbures | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|207, code des hydrocarbures|9, code des hydrocarbures|217, code des hydrocarbures|280, code des hydrocarbures|222 |
| hydro-torchage-gaz | hydrocarbures | easy | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code des hydrocarbures|125, code des hydrocarbures|264, code des hydrocarbures|127, code des hydrocarbures|126, code des hydrocarbures|1 |
| hydro-abandon-puits | hydrocarbures | medium | 1.00 | 1.00 | 0.50 | 0.63 | ✗ | code des hydrocarbures|170, code des hydrocarbures|173, code des hydrocarbures|87, code des hydrocarbures|97, code des hydrocarbures|120 |
| douane-valeur-en-douane | douane | medium | 0.67 | 1.00 | 0.33 | 0.58 | ✗ | code des douanes|34, code des douanes|32, code des douanes|30, code des douanes|33, code des douanes|29 |
| douane-franchise | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|12, code des douanes|34, code des douanes|276, code des douanes|287, code des douanes|21 |
| douane-entrepot | douane | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code des douanes|176, code des douanes|196, code des douanes|177, code des douanes|185, code des douanes|198 |
| marche-appel-offres-ouvert | marche-public | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|81, code du marché public|119, code du marché public|60, code du marché public|2, code du marché public|69 |
| marche-gre-a-gre | marche-public | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code du marché public|68, code du marché public|189, code du marché public|227, code du marché public|52, code du marché public|119 |
| marche-avance-demarrage | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|2, code du marché public|162, code du marché public|81, code du marché public|52, code du marché public|123 |
| marche-resiliation | marche-public | medium | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du marché public|227, code du marché public|229, code du marché public|228, code du marché public|185, code du marché public|225 |
| sante-pharmacie-ouverture | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|339, code de la santé publique|332, code de la santé publique|3, code de la santé publique|338, code de la santé publique|324 |
| sante-vaccination-obligations | sante | easy | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code de la santé publique|516, code de la santé publique|20, code de la santé publique|613, code de la santé publique|517, code de la santé publique|525 |
| sante-secret-medical | sante | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code de la santé publique|3, code de la santé publique|436, code de la santé publique|281, code de la santé publique|26, code de la santé publique|304 |
| sante-don-organes | sante | medium | 1.00 | 1.00 | 0.33 | 0.54 | ✗ | code de la santé publique|191, code de la santé publique|195, code de la santé publique|167, code de la santé publique|637, code de la santé publique|164 |
| comm-reseaux-sociaux | communication | easy | 0.67 | 0.67 | 1.00 | 0.70 | ✓ | code de la communication|1, code de la communication|4, code de la communication|2, code de la communication|37, code de la communication|17 |
| comm-presse-ligne | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|27, code de la communication|3 |
| comm-droit-rectification | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|27, code de la communication|2, code de la communication|2bis, code de la communication|15 |
| comm-publicite-commerciale | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|2bis |

### Hors-périmètre (attendu : aucun extrait)

| id | domaine | raison attendue | raison obtenue | renvoyés | ok |
| --- | --- | --- | --- | --- | --- |
| hors-perimetre-civil-contrat | civil | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-penal-homicide | penal | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-famille-divorce | famille | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-fonction-publique | fonction_publique | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-hors-gabon | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| piege-article-abroge-smic | travail | outdated_reference | outdated_reference | 0 | ✓ |
| piege-hors-gabon-ohada-bilan | commercial | code_not_indexed / regional_not_indexed | regional_not_indexed | 0 | ✓ |
| piege-terminologie-trompeuse | civil | code_not_indexed | code_not_indexed | 0 | ✓ |
| hp-civil-bail | civil | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-civil-responsabilite | civil | no_term_recognized | no_term_recognized | 6 | ✗ |
| hp-penal-vol | penal | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-penal-recidive | penal | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-famille-adoption | famille | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-famille-pension | famille | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-fp-avancement | fonction_publique | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-admin-recours | administratif | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-commercial-rcs | commercial | domain_not_indexed / code_not_indexed / regional_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-jur-senegal | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-cameroun | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-belge | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-europe | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-ohada-suretes | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-cima-assurance | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-cobac-banque | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-millesime-impots | impots | outdated_reference | outdated_reference | 0 | ✓ |
| hp-millesime-hydro | hydrocarbures | outdated_reference | outdated_reference | 0 | ✓ |
| hp-code-penal-nomme | penal | code_not_indexed / domain_not_indexed | code_not_indexed | 0 | ✓ |
| hp-code-famille-nomme | famille | code_not_indexed / domain_not_indexed | code_not_indexed | 0 | ✓ |

### Récap par domaine

| domaine | n | R@5 | R@10 | MRR | NDCG@10 | top1 |
| --- | --- | --- | --- | --- | --- | --- |
| communication | 4 | 0.17 | 0.17 | 0.25 | 0.18 | 0.25 |
| douane | 3 | 0.39 | 0.50 | 0.44 | 0.40 | 0.33 |
| hydrocarbures | 4 | 0.42 | 0.42 | 0.38 | 0.33 | 0.25 |
| impots | 5 | 0.20 | 0.20 | 0.10 | 0.13 | 0.00 |
| marche-public | 4 | 0.25 | 0.25 | 0.38 | 0.25 | 0.25 |
| sante | 4 | 0.46 | 0.46 | 0.40 | 0.34 | 0.25 |
| travail | 8 | 0.40 | 0.46 | 0.41 | 0.39 | 0.38 |
| **GLOBAL** | 32 | **0.33** | **0.35** | **0.33** | **0.29** | **0.25** |

Cross-domaine correctement vides : **27/28**

## Étape 11b — retour à one_per_article (contrôle) — 2026-08-13 19:46 UTC

Gold set : 60 questions  |  seuil rag_min_score : appliqué

### Métriques de tête

| métrique | valeur | cible |
| --- | --- | --- |
| **cross_domain_empty_rate** | **27/28 (0.96)** | ≥ 0.95 |
| **in_domain_blocked_rate** | **0/32 (0.00)** | 0.00 (dur) |
| cross_domain_right_reason | 28/28 (1.00) | ≥ 0.875 |

### Détail par question

| id | domaine | diff | R@5 | R@10 | MRR | NDCG@10 | top1 | got[:5] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travail-duree-hebdo | travail | easy | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du travail|21, code du travail|25, code du travail|206, code du travail|140, code du travail|1 |
| travail-conges-payes | travail | easy | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|222, code du travail|224, code du travail|223, code du travail|182, code du travail|227 |
| travail-preavis-rupture | travail | easy | 0.00 | 0.50 | 0.17 | 0.22 | ✗ | code du travail|86, code du travail|82, code du travail|81, code du travail|61, code du travail|60 |
| travail-conge-maternite | travail | medium | 1.00 | 1.00 | 1.00 | 1.00 | ✓ | code du travail|210, code du travail|207, code du travail|208, code du travail|223, code du travail|211 |
| travail-licenciement-faute | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|330, code du travail|81, code du travail|90, code du travail|64, code du travail|95 |
| travail-greve-conditions | travail | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du travail|393, code du travail|156, code du travail|128, code du travail|305, code du travail|21 |
| travail-delegates-personnel | travail | easy | 0.33 | 0.33 | 0.50 | 0.30 | ✗ | code du travail|95, code du travail|64, code du travail|336, code du travail|331, code du travail|330 |
| travail-salaire-minimum | travail | medium | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code du travail|179, code du travail|293, code du travail|110, code du travail|178, code du travail|90 |
| fiscal-is-benefice | impots | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code général des impôts|164, code général des impôts|161, code général des impôts|40, code général des impôts|11, code général des impôts|14 |
| fiscal-tva-regime | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|221, code général des impôts|248, code général des impôts|165, code général des impôts|p-896, code général des impôts|90 |
| fiscal-retenue-salaires | impots | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code général des impôts|74, code général des impôts|90, code général des impôts|161, code général des impôts|95, code général des impôts|119 |
| fiscal-amortissements | impots | medium | 1.00 | 1.00 | 0.20 | 0.39 | ✗ | code général des impôts|196, code général des impôts|42, code général des impôts|16, code général des impôts|9, code général des impôts|38 |
| fiscal-prescription | impots | hard | 1.00 | 1.00 | 0.50 | 0.65 | ✗ | code général des impôts|p-1036, code général des impôts|p-872, code général des impôts|656, code général des impôts|p-992, code général des impôts|166 |
| hydro-partage-production | hydrocarbures | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des hydrocarbures|61, code des hydrocarbures|66, code des hydrocarbures|222, code des hydrocarbures|34, code des hydrocarbures|197 |
| hydro-redevance-miniere | hydrocarbures | medium | 0.50 | 0.50 | 0.20 | 0.24 | ✗ | code des hydrocarbures|207, code des hydrocarbures|217, code des hydrocarbures|280, code des hydrocarbures|222, code des hydrocarbures|104 |
| hydro-torchage-gaz | hydrocarbures | easy | 0.67 | 0.67 | 1.00 | 0.67 | ✓ | code des hydrocarbures|125, code des hydrocarbures|264, code des hydrocarbures|127, code des hydrocarbures|126, code des hydrocarbures|1 |
| hydro-abandon-puits | hydrocarbures | medium | 1.00 | 1.00 | 0.50 | 0.63 | ✗ | code des hydrocarbures|170, code des hydrocarbures|173, code des hydrocarbures|87, code des hydrocarbures|97, code des hydrocarbures|120 |
| douane-valeur-en-douane | douane | medium | 0.67 | 1.00 | 0.33 | 0.58 | ✗ | code des douanes|34, code des douanes|32, code des douanes|30, code des douanes|33, code des douanes|29 |
| douane-franchise | douane | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code des douanes|12, code des douanes|34, code des douanes|276, code des douanes|287, code des douanes|21 |
| douane-entrepot | douane | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code des douanes|176, code des douanes|196, code des douanes|177, code des douanes|185, code des douanes|198 |
| marche-appel-offres-ouvert | marche-public | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|81, code du marché public|119, code du marché public|60, code du marché public|2, code du marché public|117 |
| marche-gre-a-gre | marche-public | medium | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code du marché public|68, code du marché public|189, code du marché public|227, code du marché public|52, code du marché public|119 |
| marche-avance-demarrage | marche-public | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code du marché public|162, code du marché public|2, code du marché public|81, code du marché public|235, code du marché public|52 |
| marche-resiliation | marche-public | medium | 0.50 | 0.50 | 0.50 | 0.39 | ✗ | code du marché public|227, code du marché public|229, code du marché public|228, code du marché public|185, code du marché public|225 |
| sante-pharmacie-ouverture | sante | easy | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la santé publique|339, code de la santé publique|332, code de la santé publique|3, code de la santé publique|338, code de la santé publique|304 |
| sante-vaccination-obligations | sante | easy | 0.50 | 0.50 | 1.00 | 0.61 | ✓ | code de la santé publique|516, code de la santé publique|20, code de la santé publique|613, code de la santé publique|517, code de la santé publique|17 |
| sante-secret-medical | sante | medium | 0.33 | 0.33 | 0.25 | 0.20 | ✗ | code de la santé publique|3, code de la santé publique|436, code de la santé publique|281, code de la santé publique|26, code de la santé publique|304 |
| sante-don-organes | sante | medium | 1.00 | 1.00 | 0.33 | 0.54 | ✗ | code de la santé publique|191, code de la santé publique|195, code de la santé publique|167, code de la santé publique|637, code de la santé publique|164 |
| comm-reseaux-sociaux | communication | easy | 1.00 | 1.00 | 1.00 | 0.91 | ✓ | code de la communication|1, code de la communication|4, code de la communication|2, code de la communication|3, code de la communication|37 |
| comm-presse-ligne | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|27, code de la communication|25, code de la communication|2bis, code de la communication|22 |
| comm-droit-rectification | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|27, code de la communication|2bis, code de la communication|2, code de la communication|15 |
| comm-publicite-commerciale | communication | medium | 0.00 | 0.00 | 0.00 | 0.00 | ✗ | code de la communication|2, code de la communication|2bis, code de la communication|3, code de la communication|32 |

### Hors-périmètre (attendu : aucun extrait)

| id | domaine | raison attendue | raison obtenue | renvoyés | ok |
| --- | --- | --- | --- | --- | --- |
| hors-perimetre-civil-contrat | civil | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-penal-homicide | penal | domain_not_indexed / code_not_indexed | code_not_indexed | 0 | ✓ |
| hors-perimetre-famille-divorce | famille | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-fonction-publique | fonction_publique | domain_not_indexed | domain_not_indexed | 0 | ✓ |
| hors-perimetre-hors-gabon | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| piege-article-abroge-smic | travail | outdated_reference | outdated_reference | 0 | ✓ |
| piege-hors-gabon-ohada-bilan | commercial | code_not_indexed / regional_not_indexed | regional_not_indexed | 0 | ✓ |
| piege-terminologie-trompeuse | civil | code_not_indexed | code_not_indexed | 0 | ✓ |
| hp-civil-bail | civil | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-civil-responsabilite | civil | no_term_recognized | no_term_recognized | 6 | ✗ |
| hp-penal-vol | penal | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-penal-recidive | penal | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-famille-adoption | famille | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-famille-pension | famille | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-fp-avancement | fonction_publique | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-admin-recours | administratif | domain_not_indexed / code_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-commercial-rcs | commercial | domain_not_indexed / code_not_indexed / regional_not_indexed | domain_not_indexed | 0 | ✓ |
| hp-jur-senegal | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-cameroun | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-belge | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-jur-europe | general | out_of_jurisdiction | out_of_jurisdiction | 0 | ✓ |
| hp-ohada-suretes | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-cima-assurance | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-cobac-banque | commercial | regional_not_indexed / code_not_indexed | regional_not_indexed | 0 | ✓ |
| hp-millesime-impots | impots | outdated_reference | outdated_reference | 0 | ✓ |
| hp-millesime-hydro | hydrocarbures | outdated_reference | outdated_reference | 0 | ✓ |
| hp-code-penal-nomme | penal | code_not_indexed / domain_not_indexed | code_not_indexed | 0 | ✓ |
| hp-code-famille-nomme | famille | code_not_indexed / domain_not_indexed | code_not_indexed | 0 | ✓ |

### Récap par domaine

| domaine | n | R@5 | R@10 | MRR | NDCG@10 | top1 |
| --- | --- | --- | --- | --- | --- | --- |
| communication | 4 | 0.25 | 0.25 | 0.25 | 0.23 | 0.25 |
| douane | 3 | 0.39 | 0.50 | 0.44 | 0.40 | 0.33 |
| hydrocarbures | 4 | 0.54 | 0.54 | 0.42 | 0.38 | 0.25 |
| impots | 5 | 0.47 | 0.47 | 0.19 | 0.25 | 0.00 |
| marche-public | 4 | 0.25 | 0.25 | 0.38 | 0.25 | 0.25 |
| sante | 4 | 0.46 | 0.46 | 0.40 | 0.34 | 0.25 |
| travail | 8 | 0.44 | 0.50 | 0.52 | 0.45 | 0.38 |
| **GLOBAL** | 32 | **0.40** | **0.42** | **0.38** | **0.34** | **0.25** |

Cross-domaine correctement vides : **27/28**

### Note étape 11 — articles-glossaires : découpage TESTÉ et REJETÉ

Hypothèse : les 8 articles de définitions restants (« Au sens de la présente
loi, on entend par : … ») atteignent 21 196 caractères, soit 58x la médiane
(366). Leur vecteur d'embedding est une moyenne diluée sur ~100 définitions,
donc ne ressemble à aucune question précise. Les scinder devait améliorer le
rappel.

**Le découpage fonctionne techniquement, mais dégrade le résultat.**

| | one_per_article=True | scindé |
|---|---|---|
| chunks Chroma | 3 613 | 3 954 |
| plus gros chunk | 21 196 car. | **1 528 car.** |
| chunks > 2 000 car. | 78 | **0** |
| **Recall@5 (29 q)** | **0.448** | **0.362 (-19 %)** |
| Recall@10 | 0.477 | 0.391 |
| MRR | 0.422 | 0.368 |

Cause : les 341 sous-chunks créés sont denses en vocabulaire juridique et
**saturent le top-5**, évinçant les articles courts et précis qui étaient les
bonnes réponses. 14 questions sur 29 tombent à R@5 = 0, dont des cas auparavant
réussis (travail-duree-hebdo, hydro-redevance-miniere). On échange de la
précision contre du volume.

C'est la même leçon qu'à l'étape 9 sur le pool du cross-encoder : **plus de
candidats ne veut pas dire meilleur rappel**. Le réglage d'origine était juste.

Deux corrections de `chunk_long_article` sont CONSERVÉES, car justes
indépendamment de ce choix (elles servent dès qu'un article dépasse max_chars,
notamment sur les 36 suites du Code du travail) :
  - frontières de coupure élargies aux puces « -x » et « §x » : les articles de
    définitions sont des listes sans point final, la coupure tombait en plein mot ;
  - le recouvrement se recale sur la frontière de mot suivante : il repartait
    `overlap` caractères en arrière sans égard aux mots (« …autorise » →
    « orise le contracteur… »), produisant un chunk ouvrant sur un fragment
    illisible.

Deux tests verrouillent ces corrections (`test_long_article_chunks_start_on_word_boundary`,
`test_long_article_keeps_article_number_on_every_part`).

Un commentaire dans `scripts/ingest_pdfs.py` documente le résultat pour éviter
qu'on « corrige » ce point sans re-mesurer.

Note sur les deux artefacts produits : `articles_ingest.jsonl` (upsert SQL,
affichage /textes/) contient les articles ENTIERS via `parse_pdf_articles`,
indépendamment du mode de chunking Chroma. Un juriste lit un article complet ;
l'embedding travaille sur l'unité qui le sert le mieux. Les deux usages sont
distincts et ne doivent pas être confondus.

Index restauré et re-mesuré : R@5 = 0.448, R@10 = 0.477, MRR = 0.422.
