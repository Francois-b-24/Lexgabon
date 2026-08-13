"""Modèles Pydantic API."""
from typing import Literal

from pydantic import BaseModel, Field


class HistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    content: str


UserProfile = Literal["non_juriste", "professionnel", "etudiant"]


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
    # T2.1 : slug d'URL côté Next pour reconstruire le permalien /textes/<source>/<slug>#article-N.
    # Dérivé du `source_code` (JOG, OHADA, ...) côté backend si présent en métadonnée Chroma.
    source: str | None = None


class Quality(BaseModel):
    has_citation: bool = False
    has_disclaimer: bool = False


class RetrievalDecision(BaseModel):
    """Décision du gate lexical, exposée telle quelle au client.

    Le refus n'est pas une phrase à reconnaître dans `answer` : c'est un champ
    typé, décidé avant l'appel au LLM et de façon déterministe. Le front peut
    donc s'y fier pour distinguer une réponse sourcée d'un refus motivé, ce que
    l'inspection du texte ne permettait pas.

    `matched_terms` porte les formes exactes qui ont déclenché la décision —
    c'est la trace auditable : on peut montrer *pourquoi* le système a répondu
    que le sujet n'était pas couvert.
    """

    reason: Literal[
        "covered",
        "out_of_jurisdiction",
        "regional_not_indexed",
        "code_not_indexed",
        "outdated_reference",
        "domain_not_indexed",
        "no_term_recognized",
    ] = "covered"
    # False uniquement quand le corpus ne couvre pas la question : c'est le
    # signal que le front doit matérialiser.
    indexed: bool = True
    matched_domaines: list[str] = Field(default_factory=list)
    matched_terms: list[str] = Field(default_factory=list)
    invoked_code: str | None = None
    invoked_code_label: str | None = None
    detected_year: int | None = None
    # Les matières réellement couvertes par l'index, pour que le client puisse
    # les afficher sans les recoder en dur.
    indexed_domains: list[str] = Field(default_factory=list)
    n_passages: int = 0


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
    # T2.3 : slug d'URL côté Next (jo-ga, ohada, ...) pour le lien direct et le popover.
    source: str | None = None
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
    # Optionnel : les clients antérieurs au gate continuent de fonctionner.
    retrieval: RetrievalDecision | None = None
