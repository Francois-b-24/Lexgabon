#!/usr/bin/env python3
"""Construit data/rag_seed.jsonl à partir d’entrées alignées sur lib/veille/official-feed.ts (veille institutionnelle).

Usage :
  cd backend && export PYTHONPATH=. && python scripts/build_rag_seed_jsonl.py
  python scripts/ingest_chroma.py --jsonl data/rag_seed.jsonl
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "rag_seed.jsonl"

# Miroir de lib/veille/official-feed.ts (titres / résumés indicatifs — lien officiel fait foi).
SEED: list[dict[str, str]] = [
    {
        "id": "jo-loi-org-001-2025",
        "slug": "loi-organique-001-2025-code-electoral",
        "citation": "Loi organique n°001/2025 — Code électoral de la République gabonaise (JO Gabon, 19 janv. 2025)",
        "titre": "Loi organique n°001/2025 — Code électoral de la République gabonaise",
        "resume": "Texte paru au Journal officiel : organisation des élections et référendums (présidentielle, législatives, sénatoriales, locales).",
        "source": "Gabon",
        "date": "19 janv. 2025",
        "portal": "journal-officiel.ga",
        "url": "https://journal-officiel.ga/21554-001-2025-/",
    },
    {
        "id": "jo-loi-ref-002-r-2024",
        "slug": "loi-referendaire-002-r-2024-constitution",
        "citation": "Loi référendaire n°002-R/2024 — Constitution de la République gabonaise (JO Gabon, 19 déc. 2024)",
        "titre": "Loi référendaire n°002-R/2024 — Constitution de la République gabonaise",
        "resume": "Publication au Journal officiel suite au référendum : texte constitutionnel adopté et promulgué.",
        "source": "Gabon",
        "date": "19 déc. 2024",
        "portal": "journal-officiel.ga",
        "url": "https://journal-officiel.ga/21489-002-r-2024-/",
    },
    {
        "id": "jo-loi-022-2024",
        "slug": "loi-022-2024-ordonnances-urgence",
        "citation": "Loi n°022/2024 — Pouvoir du Président de la Transition de légiférer par ordonnances (JO Gabon, 21 juil. 2024)",
        "titre": "Loi n°022/2024 — Pouvoir du Président de la Transition de légiférer par ordonnances",
        "resume": "Acte parlementaire publié au Journal officiel encadrant la législation d’urgence en intersession.",
        "source": "Gabon",
        "date": "21 juil. 2024",
        "portal": "journal-officiel.ga",
        "url": "https://journal-officiel.ga/21133-022-2024-/",
    },
    {
        "id": "jo-loi-020-2024",
        "slug": "loi-020-2024-emprunt-bird",
        "citation": "Loi n°020/2024 — Autorisation d’emprunt auprès de la Banque mondiale / projet HISWACA (JO Gabon, 21 juil. 2024)",
        "titre": "Loi n°020/2024 — Autorisation d’emprunt auprès de la Banque mondiale (projet HISWACA)",
        "resume": "Loi de finances / emprunt d’État publiée au Journal officiel ; conditions et montant dans l’acte officiel.",
        "source": "Gabon",
        "date": "21 juil. 2024",
        "portal": "journal-officiel.ga",
        "url": "https://journal-officiel.ga/21132-020-2024-/",
    },
    {
        "id": "ohada-au-recouvrement-2023",
        "slug": "ohada-au-recouvrement-voies-execution-2023",
        "citation": "OHADA — Acte uniforme recouvrement et voies d’exécution (révision 17 oct. 2023)",
        "titre": "Acte uniforme portant organisation des procédures simplifiées de recouvrement et des voies d’exécution (révision du 17 octobre 2023)",
        "resume": "Adopté par le Conseil des ministres de l’OHADA ; publication et entrée en vigueur suivent le Journal officiel de l’OHADA.",
        "source": "OHADA",
        "date": "17 oct. 2023",
        "portal": "ohada.org",
        "url": "https://www.ohada.org/publication-prochaine-du-nouvel-acte-uniforme-portant-organisation-des-procedures-simplifiees-de-recouvrement-et-des-voies-dexecution/",
    },
    {
        "id": "ohada-actes-vigueur",
        "slug": "ohada-actes-uniformes-en-vigueur",
        "citation": "OHADA — Actes uniformes en vigueur (droit des affaires harmonisé, 17 États)",
        "titre": "Actes uniformes en vigueur — droit des affaires harmonisé (17 États membres)",
        "resume": "Index officiel : sociétés, sûretés, procédures collectives, comptabilité, transport, arbitrage, etc.",
        "source": "OHADA",
        "date": "—",
        "portal": "ohada.org",
        "url": "https://www.ohada.org/category/actes-uniformes/actes-uniformes-en-vigueur/",
    },
    {
        "id": "cemac-reg-2-18-changes",
        "slug": "cemac-reglement-2-18-changes-umac",
        "citation": "CEMAC — Règlement n°2/18/CEMAC/UMAC/CM sur les changes",
        "titre": "Règlement n°2/18/CEMAC/UMAC/CM — Réglementation des changes dans la CEMAC",
        "resume": "Texte UMAC/CEMAC relatif aux opérations de change ; publié sur le portail de la BEAC (actualités officielles).",
        "source": "CEMAC",
        "date": "21 déc. 2018",
        "portal": "beac.int",
        "url": "https://beac.int/beac/actualites/reglement-n218cemacumaccm-portant-reglementation-changes-cemac",
    },
    {
        "id": "cemac-decisions",
        "slug": "cemac-decisions-communautaires",
        "citation": "CEMAC — Décisions communautaires (publications officielles)",
        "titre": "Décisions communautaires CEMAC — Publications officielles",
        "resume": "Flux des actes et décisions communautaires publiés sur le site de la Communauté économique et monétaire de l’Afrique centrale.",
        "source": "CEMAC",
        "date": "—",
        "portal": "cemac.int",
        "url": "https://cemac.int/decisions/",
    },
    {
        "id": "cobac-reglements-beac",
        "slug": "cobac-reglements-commission-bancaire",
        "citation": "COBAC — Règlements de la Commission bancaire de l’Afrique centrale",
        "titre": "Règlements de la COBAC — supervision bancaire (CEMAC)",
        "resume": "Recueil officiel des règlements de la Commission bancaire de l’Afrique centrale sur le site de la BEAC.",
        "source": "COBAC",
        "date": "—",
        "portal": "beac.int",
        "url": "https://beac.int/supervision-bancaire/reglements-de-cobac",
    },
    {
        "id": "lex-seed-droit-travail-orientation",
        "slug": "droit-travail-gabon-orientation-lexgabon",
        "citation": "Droit du travail (Gabon) — fiche indicative LexGabon ; texte authentique au Journal officiel",
        "titre": "Code du travail et droit individuel du travail — repères (Gabon)",
        "resume": (
            "Thèmes : contrat de travail (CDI, CDD), obligations des parties, licenciement "
            "(motifs, procédure, notification, recours internes), rupture conventionnelle, démission, "
            "sanctions disciplinaires, durée du travail et repos. Seule la version publiée au Journal officiel fait foi."
        ),
        "source": "Gabon",
        "date": "—",
        "portal": "journal-officiel.ga",
        "url": "https://journal-officiel.ga/",
        "reference": "Code du travail — République gabonaise (texte authentique : Journal officiel)",
    },
]


def chunk_text(row: dict[str, str]) -> str:
    return (
        f"{row['titre']}\n\n"
        f"{row['resume']}\n\n"
        f"Juridiction / espace : {row['source']}. Date indiquée : {row['date']}. "
        f"Portail : {row['portal']}. Lien officiel : {row['url']}\n\n"
        f"Identifiant interne LexGabon (slug) : {row['slug']}."
    )


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    lines: list[str] = []
    for row in SEED:
        line_obj: dict[str, str] = {
            "id": row["id"],
            "citation": row["citation"],
            "text": chunk_text(row),
            "slug": row["slug"],
            "url": row["url"],
            "titre": row["titre"],
            "source": row["source"],
        }
        if row.get("reference"):
            line_obj["reference"] = str(row["reference"])
        if row.get("numero_article"):
            line_obj["numero_article"] = str(row["numero_article"])
        lines.append(json.dumps(line_obj, ensure_ascii=False))
    # Fiche démo code électoral (aperçu pédagogique — renvoie vers le JO pour le texte intégral)
    lines.append(
        json.dumps(
            {
                "id": "lex-demo-code-electoral-apercu",
                "citation": "Aperçu pédagogique — Code électoral (LexGabon) ; texte authentique au JO",
                "text": (
                    "Loi organique n°001/2025 — Code électoral de la République gabonaise.\n\n"
                    "Résumé indicatif : la loi organique fixe le régime des élections et référendums "
                    "(présidentielle, législatives, sénatoriales, locales). Seule la version publiée au "
                    "Journal officiel de la République gabonaise fait foi.\n\n"
                    "Lien officiel : https://journal-officiel.ga/21554-001-2025-/\n\n"
                    "Slug LexGabon : loi-organique-001-2025-code-electoral."
                ),
            },
            ensure_ascii=False,
        )
    )
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {len(lines)} lines -> {OUT}")


if __name__ == "__main__":
    main()
