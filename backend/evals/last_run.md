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
