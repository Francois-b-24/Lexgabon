"""Chargement et normalisation du lexique juridique (gating déterministe).

Ce module ne dépend NI de Chroma NI d'un modèle d'embedding : il se charge en
quelques millisecondes et se teste sans réseau. C'est délibéré — le lexique est
la brique qui doit rester rapide sur le chemin critique et vérifiable hors ligne.

Rôle du lexique dans le dispositif : un embedding ne peut pas prouver une
absence (il rend toujours un top-k, et tout seuil sur des scores continus est
arbitraire). Le lexical, lui, le peut : si aucune forme connue du sujet
n'apparaît, c'est une constatation, pas une estimation. Encore faut-il que le
vocabulaire soit explicite et versionné — d'où ce fichier.
"""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml

_DEFAULT_PATH = Path(__file__).resolve().parents[2] / "corpus" / "lexique.yaml"

# Même tokenisation que le retriever (`_WORD_RE`), pour que le gate raisonne sur
# exactement les mêmes unités que la recherche lexicale.
_WORD_RE = re.compile(r"[a-zàâäéèêëïîôùûüçœæ0-9]+")

# Suffixes ordonnés du plus long au plus court : on retire le premier qui
# s'applique. Suffisant pour du français juridique (« licenciement » /
# « licenciements », « imposable » / « imposables ») sans dépendance externe.
_SUFFIXES = (
    "ements", "ement", "ations", "ation", "ables", "able", "ances", "ance",
    "ences", "ence", "eurs", "euse", "elles", "elle", "aux", "ales", "ale",
    "iers", "ier", "ives", "ive", "ees", "ée", "ées", "es", "s", "e",
)

_MIN_STEM = 4


def strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def normalize(text: str) -> str:
    """Minuscules + accents retirés — la forme de comparaison du lexique."""
    return strip_accents((text or "").lower())


def stem_fr(word: str) -> str:
    """Racine approximative d'un mot français.

    Volontairement conservateur : on ne coupe que si la racine reste d'au moins
    4 caractères, pour éviter de fusionner des termes distincts. Ce stemmer fait
    la différence entre reconnaître « licenciement » quand le lexique porte
    « licenciements » et manquer le terme.
    """
    w = normalize(word)
    for suf in _SUFFIXES:
        if len(w) - len(suf) >= _MIN_STEM and w.endswith(suf):
            return w[: -len(suf)]
    return w


def tokens(text: str) -> list[str]:
    return _WORD_RE.findall((text or "").lower())


def stems(text: str) -> set[str]:
    return {stem_fr(t) for t in tokens(text)}


@dataclass(frozen=True)
class DomainEntry:
    """Un domaine juridique et son vocabulaire.

    `indexed` porte toute la logique : un domaine indexé apporte une preuve de
    *présence*, un domaine non indexé une preuve d'*absence*.
    """

    id: str
    indexed: bool
    libelle: str
    code: str
    slug: str
    termes: tuple[str, ...]
    # Formes multi-mots (« don d'organes ») : testées par sous-chaîne, car la
    # tokenisation les briserait.
    phrases: tuple[str, ...]
    stems: frozenset[str]


@dataclass(frozen=True)
class CodeEntry:
    id: str
    indexed: bool
    libelle: str
    formes: tuple[str, ...]


@dataclass(frozen=True)
class Lexique:
    domaines: tuple[DomainEntry, ...]
    codes: tuple[CodeEntry, ...]
    juridictions_etrangeres: tuple[str, ...]
    regionaux_non_indexes: tuple[str, ...]

    def indexed_domains(self) -> tuple[str, ...]:
        return tuple(d.id for d in self.domaines if d.indexed)

    def domain(self, domain_id: str) -> DomainEntry | None:
        for d in self.domaines:
            if d.id == domain_id:
                return d
        return None


def _split_forms(termes: list[str]) -> tuple[tuple[str, ...], tuple[str, ...]]:
    """Sépare les termes simples (comparés par racine) des expressions."""
    simples: list[str] = []
    phrases: list[str] = []
    for t in termes:
        n = normalize(str(t).strip())
        if not n:
            continue
        (phrases if (" " in n or "'" in n) else simples).append(n)
    return tuple(simples), tuple(phrases)


def _domain_entry(dom_id: str, raw: dict[str, Any], *, indexed: bool) -> DomainEntry:
    termes = list(raw.get("termes") or [])
    simples, phrases = _split_forms(termes)
    return DomainEntry(
        id=dom_id,
        indexed=indexed,
        libelle=str(raw.get("libelle") or raw.get("code") or dom_id),
        code=str(raw.get("code") or ""),
        slug=str(raw.get("slug") or ""),
        termes=simples + phrases,
        phrases=phrases,
        stems=frozenset(stem_fr(t) for t in simples),
    )


def load_lexique(path: Path | None = None) -> Lexique:
    """Charge le lexique depuis le YAML (non caché — utile en test)."""
    p = path or _DEFAULT_PATH
    data = yaml.safe_load(p.read_text(encoding="utf-8")) or {}

    domaines: list[DomainEntry] = []
    for dom_id, raw in (data.get("domaines") or {}).items():
        domaines.append(_domain_entry(dom_id, raw or {}, indexed=True))
    for dom_id, raw in (data.get("domaines_non_indexes") or {}).items():
        domaines.append(_domain_entry(dom_id, raw or {}, indexed=False))

    codes: list[CodeEntry] = []
    for c in data.get("codes") or []:
        formes = tuple(normalize(f) for f in (c.get("formes") or []) if str(f).strip())
        codes.append(
            CodeEntry(
                id=str(c.get("id") or ""),
                indexed=bool(c.get("indexed")),
                libelle=str(c.get("libelle") or ""),
                formes=formes,
            )
        )

    return Lexique(
        domaines=tuple(domaines),
        codes=tuple(codes),
        juridictions_etrangeres=tuple(
            normalize(x) for x in (data.get("juridictions_etrangeres") or [])
        ),
        regionaux_non_indexes=tuple(
            normalize(x) for x in (data.get("regionaux_non_indexes") or [])
        ),
    )


@lru_cache(maxsize=1)
def get_lexique() -> Lexique:
    """Instance partagée (chemin par défaut), chargée une seule fois."""
    return load_lexique()
