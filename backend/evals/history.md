
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
