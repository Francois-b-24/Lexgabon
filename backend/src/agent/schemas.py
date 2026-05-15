"""Modèles Pydantic API."""
from typing import Literal

from pydantic import BaseModel, Field


class HistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    content: str


UserProfile = Literal["avocat", "juriste", "etudiant"]


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=3)
    history: list[HistoryItem] = Field(default_factory=list)
    session_id: str | None = None
    domaine: str | None = None
    profile: UserProfile | None = None


class SourceItem(BaseModel):
    citation: str
    text: str
    score: float
    badge: str = "doc"
    slug: str | None = None
    numero_article: str | None = None
    url: str | None = None


class Quality(BaseModel):
    has_citation: bool = False
    has_disclaimer: bool = False


class StructuredCitation(BaseModel):
    citation: str
    text: str
    score: float
    source_id: str | None = None


class StructuredRef(BaseModel):
    """Référence légale résolue dans un paragraphe d'une note juridique."""

    kind: Literal["article", "source"]
    label: str  # rendu visuel court, ex. « Article 12 du Code du travail »
    article: str | None = None
    code: str | None = None
    slug: str | None = None
    url: str | None = None
    source_index: int | None = None  # index dans ChatResponse.sources (résolution côté front)


class StructuredParagraph(BaseModel):
    """Un paragraphe court (3-5 lignes) avec ses références résolues."""

    text: str
    refs: list[StructuredRef] = Field(default_factory=list)


class StructuredAnswer(BaseModel):
    """Réponse Ama'IA structurée pour rendu type « note juridique »."""

    paragraphs: list[StructuredParagraph]
    disclaimer: str | None = None  # phrase d'avertissement isolée pour rendu distinct


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceItem]
    quality: Quality
    session_id: str
    source_stats: dict | None = None
    citations: list[StructuredCitation] | None = None
    structured: StructuredAnswer | None = None
