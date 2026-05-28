"""Fonction d'embedding E5 avec préfixes obligatoires `passage:` / `query:`.

Les modèles E5 (intfloat/multilingual-e5-*) sont entraînés avec des préfixes
d'instruction OBLIGATOIRES :
  - « passage: <texte> » pour les documents indexés ;
  - « query: <texte> »   pour les requêtes de recherche.

Sans ces préfixes, la similarité est nettement dégradée (cf. carte du modèle
intfloat). Chroma applique une seule embedding_function à l'ingestion (`__call__`)
et — quand on l'utilise — aux requêtes. On distingue donc les deux chemins :

  * `__call__`     préfixe « passage: » → utilisé par Chroma à `col.add`.
  * `embed_query`  préfixe « query: »   → appelé explicitement par le retriever,
                   qui passe le vecteur via `col.query(query_embeddings=[...])`.

Le même `SentenceTransformer` (clé = model_name) est mis en cache au niveau classe
par `SentenceTransformerEmbeddingFunction`, donc passage et query partagent une
unique instance en mémoire — pas de doublement de la RAM (contrainte Render).
"""
from __future__ import annotations

from typing import Any

from chromadb.utils import embedding_functions

PASSAGE_PREFIX = "passage: "
QUERY_PREFIX = "query: "


class E5EmbeddingFunction(embedding_functions.SentenceTransformerEmbeddingFunction):
    """Variante E5 qui préfixe les documents par « passage: » et les requêtes par « query: »."""

    def __call__(self, input: Any) -> Any:  # noqa: A002 - signature imposée par Chroma
        prefixed = [f"{PASSAGE_PREFIX}{t}" for t in input]
        return super().__call__(prefixed)

    def embed_query(self, input: Any) -> Any:  # noqa: A002 - signature imposée par Chroma
        prefixed = [f"{QUERY_PREFIX}{t}" for t in input]
        # On réutilise la passe « document » du parent sur des entrées déjà
        # préfixées « query: » : l'encodage sous-jacent est identique, seul le
        # préfixe d'instruction change.
        return super().__call__(prefixed)


def make_embedding_function(model_name: str) -> embedding_functions.EmbeddingFunction:
    """EF E5 à préfixes si le modèle est un E5, sinon EF SentenceTransformer standard."""
    if "e5" in model_name.lower():
        return E5EmbeddingFunction(model_name=model_name)
    return embedding_functions.SentenceTransformerEmbeddingFunction(model_name=model_name)


def embed_query_text(ef: embedding_functions.EmbeddingFunction, text: str) -> list[float]:
    """Vecteur d'une requête, avec préfixe « query: » si l'EF est une E5."""
    if isinstance(ef, E5EmbeddingFunction):
        vec = ef.embed_query([text])[0]
    else:
        vec = ef([text])[0]
    return [float(x) for x in vec]
