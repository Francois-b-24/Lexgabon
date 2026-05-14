"""Modèles Pydantic API (contrat cahier des charges)."""
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
    include_uploads: bool = False


class SessionClearRequest(BaseModel):
    session_id: str


class SourceItem(BaseModel):
    citation: str
    text: str
    score: float
    badge: str = "doc"


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
    tools_used: list[str] = Field(default_factory=list)
    source_stats: dict | None = None
    citations: list[StructuredCitation] | None = None
    warnings: list[str] = Field(default_factory=list)
