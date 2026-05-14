"""Outils exposés au modèle (CDC) + exécution."""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class ToolContext:
    sources: list[dict[str, Any]] = field(default_factory=list)
    tools_used: list[str] = field(default_factory=list)
    session_id: str | None = None
    include_uploads: bool = False
    domaine: str | None = None


def anthropic_tool_definitions() -> list[dict[str, Any]]:
    return [
        {
            "name": "recherche_juridique",
            "description": "Recherche sémantique dans la base juridique indexée (textes applicables au Gabon).",
            "input_schema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Requête en français (mots-clés, article, thème).",
                    },
                },
                "required": ["query"],
            },
        },
        {
            "name": "lire_article",
            "description": "Récupère des extraits liés à un numéro d'article ou de disposition recherchée.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "numero": {"type": "string", "description": "Numéro d'article ou référence (ex. 12, Loi n°…)."},
                    "contexte": {"type": "string", "description": "Contexte ou texte applicable (optionnel)."},
                },
                "required": ["numero"],
            },
        },
        {
            "name": "calculer_indemnite",
            "description": "Estimation indicative liée au droit du travail (à confirmer par un professionnel).",
            "input_schema": {
                "type": "object",
                "properties": {
                    "salaire_mensuel": {"type": "number", "description": "Salaire brut mensuel indicatif."},
                    "anciennete_annees": {"type": "number", "description": "Ancienneté en années."},
                    "motif": {"type": "string", "description": "Motif (licenciement, rupture, etc.)."},
                },
                "required": ["salaire_mensuel"],
            },
        },
        {
            "name": "synthese_document",
            "description": "Produit une synthèse courte à partir des extraits trouvés pour un sujet donné.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "sujet": {"type": "string", "description": "Sujet ou titre à synthétiser."},
                },
                "required": ["sujet"],
            },
        },
        {
            "name": "generer_rapport",
            "description": "Produit un rapport structuré en texte brut (sections courtes) à partir des extraits disponibles.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "titre": {"type": "string", "description": "Titre du rapport."},
                    "points": {"type": "string", "description": "Points ou questions à couvrir, séparés par des virgules."},
                },
                "required": ["titre"],
            },
        },
    ]


def _add_sources(ctx: ToolContext, rows: list[dict[str, Any]], badge: str) -> None:
    for r in rows:
        ctx.sources.append(
            {
                "citation": r.get("citation", ""),
                "text": (r.get("text") or "")[:4000],
                "score": float(r.get("score", 0.5)),
                "badge": badge,
                "id": r.get("id"),
                "metadata": r.get("metadata") if isinstance(r.get("metadata"), dict) else {},
            }
        )


def execute_tool(name: str, tool_input: dict[str, Any], ctx: ToolContext) -> str:
    from src.rag import retriever

    ctx.tools_used.append(name)
    try:
        if name == "recherche_juridique":
            q = str(tool_input.get("query", "")).strip()
            if not q:
                return "Aucune requête fournie."
            rows = retriever.search(
                q,
                session_id=ctx.session_id,
                include_uploads=ctx.include_uploads,
                domaine=ctx.domaine,
            )
            _add_sources(ctx, rows, "recherche_juridique")
            if not rows:
                return (
                    "Recherche indexée : aucun passage retourné pour cette requête (corpus limité ou thème peu couvert). "
                    "Tu dois tout de même répondre sur le fond à partir de tes connaissances, puis un bref paragraphe "
                    "« Sources indexées » pour indiquer qu'aucun extrait indexé n'étaye la réponse ici."
                )
            lines = [f"- {r['citation']}: {(r.get('text') or '')[:500]}…" for r in rows[:5]]
            return "Extraits pertinents (résumé pour l'agent) :\n" + "\n".join(lines)

        if name == "lire_article":
            num = str(tool_input.get("numero", "")).strip()
            ctxe = str(tool_input.get("contexte", "")).strip()
            q = f"article {num} {ctxe}".strip()
            rows = retriever.search(
                q,
                session_id=ctx.session_id,
                include_uploads=ctx.include_uploads,
                domaine=ctx.domaine,
            )
            _add_sources(ctx, rows, "lire_article")
            if not rows:
                return (
                    f"Recherche indexée : aucun extrait pour « {num} ». Réponds sur le fond avec tes connaissances "
                    "(sans inventer le texte de l'article), puis indique en « Sources indexées » que l'index n'a pas "
                    "fourni ce passage."
                )
            return "\n\n".join(f"[{r['citation']}]\n{(r.get('text') or '')[:2000]}" for r in rows[:3])

        if name == "calculer_indemnite":
            sal = float(tool_input.get("salaire_mensuel", 0) or 0)
            anc = float(tool_input.get("anciennete_annees", 0) or 0)
            motif = str(tool_input.get("motif", "non précisé"))
            # Indemnité indicative très simplifiée (non juridique, Gabon non codé finement ici)
            base = sal * min(anc, 12) * 0.15 if sal > 0 else 0
            return (
                f"Estimation purement indicative (non opposable, à valider par un juriste) : "
                f"salaire {sal:.0f}, ancienneté {anc:.1f} an(s), motif {motif}. "
                f"Montant indicatif calculé pour l'agent : {base:.0f} (unité : même devise que le salaire saisi). "
                f"Vérifiez les barèmes et le Code du travail gabonais en vigueur."
            )

        if name == "synthese_document":
            sujet = str(tool_input.get("sujet", "")).strip()
            rows = retriever.search(
                sujet,
                session_id=ctx.session_id,
                include_uploads=ctx.include_uploads,
                domaine=ctx.domaine,
            )
            _add_sources(ctx, rows, "synthese_document")
            if not rows:
                return (
                    "Synthèse : pas d'extraits indexés pour ce sujet. Propose une synthèse courte à partir de tes "
                    "connaissances et précise en « Sources indexées » que la base indexée n'a pas fourni de matériau."
                )
            blob = "\n".join((r.get("text") or "")[:1200] for r in rows[:4])
            return (
                "Matériau pour synthèse (extraits concaténés, à reformuler pour le public) :\n"
                f"{blob[:6000]}"
            )

        if name == "generer_rapport":
            titre = str(tool_input.get("titre", "")).strip()
            points = str(tool_input.get("points", "")).strip()
            q = f"{titre} {points}".strip()
            rows = retriever.search(
                q or titre,
                session_id=ctx.session_id,
                include_uploads=ctx.include_uploads,
                domaine=ctx.domaine,
            )
            _add_sources(ctx, rows, "generer_rapport")
            if not rows:
                return (
                    "Rapport : aucun extrait indexé. Rédige une ébauche à partir de tes connaissances et indique "
                    "explicitement au lecteur que les sources indexées LexGabon n'ont pas été utilisées faute de résultats."
                )
            sections = []
            for i, r in enumerate(rows[:5], 1):
                sections.append(f"Section {i} — {r['citation']}\n{(r.get('text') or '')[:800]}")
            return "Rapport (ébauche texte brut pour réutilisation par le modèle) :\n" + "\n\n".join(sections)

        return f"Outil inconnu : {name}"
    except Exception as e:
        logger.exception("tool %s failed", name)
        return f"Erreur lors de l'exécution de l'outil {name} : {e}"
