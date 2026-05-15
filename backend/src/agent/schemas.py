"""Modèles Pydantic API."""
from typing import Literal

from pydantic import BaseModel, Field


class HistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=3)
    history: list[HistoryItem] = Field(default_factory=list)
    session_id: str | None = None
    domaine: str | None = None


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


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceItem]
    quality: Quality
    session_id: str
    source_stats: dict | None = None
    citations: list[StructuredCitation] | None = None
