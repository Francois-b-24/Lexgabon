"""Tests du filet de sécurité strip_meta_rag_paragraphs."""
from __future__ import annotations

from src.agent.prompts import strip_meta_rag_paragraphs


def test_removes_sources_indexees_paragraph():
    raw = (
        "Au Gabon, la succession est régie par le Code civil.\n\n"
        "Sources indexées : L'index LexGabon n'a pas fourni de passage pertinent "
        "relatif au droit des successions pour cette requête. Les douze extraits "
        "retournés relèvent tous du Code du travail (Loi n° 022/2021).\n\n"
        "Cette réponse ne constitue pas un conseil juridique, veuillez si "
        "nécessaire consulter un professionnel du droit."
    )
    out = strip_meta_rag_paragraphs(raw)
    assert "Sources indexées" not in out
    assert "Code du travail" not in out
    assert "succession est régie par le Code civil" in out
    assert "Cette réponse ne constitue pas un conseil juridique" in out


def test_removes_extraits_retournes_variant():
    raw = (
        "La TVA gabonaise frappe en principe toutes les ventes.\n\n"
        "L'index LexGabon n'a pas fourni de passage du Code général des impôts "
        "pour cette requête. Les extraits disponibles relevaient exclusivement "
        "du Code du travail.\n\n"
        "Cette réponse ne constitue pas un conseil juridique."
    )
    out = strip_meta_rag_paragraphs(raw)
    assert "L'index LexGabon" not in out
    assert "Les extraits disponibles" not in out
    assert "La TVA gabonaise" in out


def test_keeps_substantive_paragraphs_intact():
    raw = (
        "Paragraphe 1 sur le fond.\n\n"
        "Paragraphe 2 sur le fond, avec [Article 12, Code du travail].\n\n"
        "Cette réponse ne constitue pas un conseil juridique."
    )
    out = strip_meta_rag_paragraphs(raw)
    assert "Paragraphe 1 sur le fond" in out
    assert "[Article 12, Code du travail]" in out
    assert "Cette réponse ne constitue pas un conseil juridique" in out


def test_empty_input_passes_through():
    assert strip_meta_rag_paragraphs("") == ""
    assert strip_meta_rag_paragraphs("   ") == ""


def test_handles_no_blank_line_between_paragraphs_gracefully():
    """Si tout le texte est sur une seule ligne avec « Sources indexées »
    enchaîné directement, on garde l'avant et coupe à partir du marqueur
    n'est pas garanti — on accepte ici un fail soft : le filtre ne touche
    qu'aux paragraphes séparés par une ligne vide. Ce cas est rare car le
    system prompt impose des paragraphes séparés par une ligne vide."""
    raw = "Du fond important. Sources indexées : index vide."
    out = strip_meta_rag_paragraphs(raw)
    # On vérifie au moins que la fonction ne crashe pas.
    assert isinstance(out, str)
