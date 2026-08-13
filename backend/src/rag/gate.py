"""Gate lexical déterministe : décider AVANT le LLM si le corpus couvre la question.

Pourquoi ce module existe
-------------------------
Un embedding ne peut pas prouver une absence. Il renvoie toujours un top-k avec
des scores continus, et le seuil qu'on pose dessus est arbitraire : `rag_min_score`
s'applique à un score normalisé min-max *sur le pool remonté*, donc il existe
toujours un extrait à 1.0 et le seuil ne peut jamais tout rejeter. Résultat
mesuré avant ce module : 0/8 sur les questions hors-périmètre du gold set.

Le lexical, lui, peut prouver une absence — mais pas de n'importe quelle façon.

L'asymétrie qui fait marcher le dispositif
------------------------------------------
Faire porter la preuve d'absence au *vocabulaire positif* ne marche pas : on
mesure alors soit 31/32 in-domain et 3/8 hors-périmètre (seuil « ≥1 terme »),
soit 8/8 hors-périmètre mais 10 in-domain cassées (seuil « ≥2 termes »). C'est le
seuil arbitraire de l'embedding, simplement déplacé vers la taille du lexique.

La sortie est de séparer les deux questions :

  * PROUVER L'ABSENCE se fait sur des signaux *explicites et univoques* — une
    juridiction étrangère nommée, un code non indexé nommément invoqué, un
    marqueur fort d'une matière absente. Ils sont rares, donc sûrs, et surtout
    ils sont auditables : on peut montrer le terme qui a déclenché le refus.

  * CONFIRMER LA PRÉSENCE se fait sur le vocabulaire positif. Mais une évidence
    positive faible ne doit JAMAIS provoquer un refus.

D'où `NO_TERM_RECOGNIZED`, qui n'est pas un refus : les questions dont le
vocabulaire manque au lexique passent en recherche normale et alimentent la
boucle d'enrichissement. Le recall est ainsi intouchable par construction.

L'ordre d'évaluation n'est pas cosmétique
------------------------------------------
Il a été établi par l'échec :

  1. juridiction étrangère  — sinon « code du travail français » est vu comme
                              couvert (le vocabulaire « travail » matche).
  2. régional non indexé    — OHADA/CIMA/COBAC. CEMAC est exclu : le Code des
                              douanes CEMAC EST indexé.
  3. code invoqué           — attrape « licencier … selon le code civil », où le
                              SUJET est couvert mais le TEXTE invoqué ne l'est pas.
  4. millésime périmé       — « le code du travail de 1994 » : domaine indexé,
                              donc aucun filtre de domaine ne peut l'attraper.
  5. marqueur négatif fort  — matières absentes du corpus.
  6. vocabulaire positif    — couverture confirmée.
  7. sinon                  — NO_TERM_RECOGNIZED, non bloquant.

Évaluer le vocabulaire positif avant les marqueurs négatifs ferait passer
« homicide volontaire » en « couvert », parce que « peine » existe aussi dans le
Code du travail.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum
from functools import lru_cache
from pathlib import Path

import yaml

from src.rag.lexique import Lexique, get_lexique, normalize, stem_fr, stems

_MANIFEST_PATH = Path(__file__).resolve().parents[2] / "corpus" / "pdfs" / "manifest.yaml"

# Millésime cité explicitement. On ne borne pas au passé lointain : « code du
# travail de 1994 » est périmé parce que le corpus porte l'édition 2021, ce que
# seule la comparaison avec la date du code indexé peut établir.
_YEAR_RE = re.compile(r"\b(1[89]\d{2}|20[0-2]\d)\b")


class GateReason(str, Enum):
    """Motif de la décision. Transmis tel quel jusqu'à la génération et au front."""

    COVERED = "covered"
    OUT_OF_JURISDICTION = "out_of_jurisdiction"
    REGIONAL_NOT_INDEXED = "regional_not_indexed"
    CODE_NOT_INDEXED = "code_not_indexed"
    OUTDATED_REFERENCE = "outdated_reference"
    DOMAIN_NOT_INDEXED = "domain_not_indexed"
    NO_TERM_RECOGNIZED = "no_term_recognized"


# Les seules raisons qui empêchent d'interroger Chroma. `NO_TERM_RECOGNIZED` en
# est délibérément absent : c'est ce qui protège les questions dont le lexique
# est encore incomplet.
_BLOCKING = frozenset({
    GateReason.OUT_OF_JURISDICTION,
    GateReason.REGIONAL_NOT_INDEXED,
    GateReason.CODE_NOT_INDEXED,
    GateReason.OUTDATED_REFERENCE,
    GateReason.DOMAIN_NOT_INDEXED,
})


@dataclass(frozen=True)
class GateDecision:
    """Décision typée et auditable.

    `matched_terms` est la preuve : les formes exactes qui ont déclenché la
    décision. C'est ce qui rend le refus défendable — on peut montrer pourquoi.
    """

    reason: GateReason
    blocking: bool
    matched_domaines: tuple[str, ...] = ()
    matched_terms: tuple[str, ...] = ()
    invoked_code: str | None = None
    invoked_code_label: str | None = None
    detected_year: int | None = None
    indexed_domains: tuple[str, ...] = field(default_factory=tuple)

    @property
    def indexed(self) -> bool:
        """Le corpus couvre-t-il la question (au sens : peut-on répondre sourcé) ?"""
        return not self.blocking


@lru_cache(maxsize=1)
def indexed_code_years(path: Path | None = None) -> dict[str, int]:
    """Année d'édition de chaque code indexé, lue dans le manifest du corpus.

    Sert à détecter les références à une édition antérieure : le corpus porte le
    Code du travail de 2021, donc « le code du travail de 1994 » vise un texte
    que l'index ne contient pas.
    """
    p = path or _MANIFEST_PATH
    if not p.exists():
        return {}
    data = yaml.safe_load(p.read_text(encoding="utf-8")) or {}
    out: dict[str, int] = {}
    for meta in (data.get("files") or {}).values():
        dom, date = meta.get("domaine"), meta.get("date")
        if dom and date:
            year = str(date)[:4]
            if year.isdigit():
                out[dom] = int(year)
    return out


def _word_present(needle: str, haystack_norm: str) -> bool:
    """Présence en frontière de mot — évite que « penal » matche « pénalité »."""
    return re.search(r"\b" + re.escape(needle) + r"\b", haystack_norm) is not None


def _match_domain_terms(dom, question_norm: str, question_stems: set[str]) -> list[str]:
    """Termes du domaine présents dans la question.

    Les expressions (« don d'organes ») sont testées par sous-chaîne, les termes
    simples par racine, pour absorber les variantes morphologiques.
    """
    hits: list[str] = []
    for t in dom.phrases:
        if t in question_norm:
            hits.append(t)
    # Une seule forme par racine : le lexique porte « licenciement »,
    # « licenciements », « licencier »… mais la trace d'audit doit rester
    # lisible, pas énumérer les variantes morphologiques d'un même terme.
    seen_stems: set[str] = set()
    for t in sorted(dom.termes, key=len):
        if t in dom.phrases:
            continue
        st = stem_fr(t)
        if st in question_stems and st not in seen_stems:
            seen_stems.add(st)
            hits.append(t)
    return sorted(set(hits))


def _indexed_code_invoked(lex: Lexique, question_norm: str) -> tuple[str, str] | None:
    """Code INDEXÉ explicitement nommé dans la question, s'il y en a un."""
    for c in lex.codes:
        if not c.indexed:
            continue
        for f in c.formes:
            if f and f in question_norm:
                return c.id, c.libelle
    return None


def evaluate(
    question: str,
    domaine: str | None = None,
    lexique: Lexique | None = None,
    *,
    indexed_code_dates: dict[str, int] | None = None,
) -> GateDecision:
    """Décide si le corpus indexé couvre la question.

    `domaine` est le domaine éventuellement choisi dans le sélecteur front. Il
    est traité comme un signal *supplémentaire*, jamais comme la seule source :
    en production il est le plus souvent vide, or c'est justement là que le
    refus doit fonctionner.
    """
    lex = lexique or get_lexique()
    q_norm = normalize(question)
    q_stems = stems(question)
    indexed_domains = lex.indexed_domains()

    def _decide(reason: GateReason, **kw) -> GateDecision:
        return GateDecision(
            reason=reason,
            blocking=reason in _BLOCKING,
            indexed_domains=indexed_domains,
            **kw,
        )

    # Le domaine explicitement choisi dans le sélecteur prime s'il est connu et
    # non indexé — c'est une déclaration de l'utilisateur, pas une inférence.
    if domaine:
        d = lex.domain(domaine)
        if d is not None and not d.indexed:
            return _decide(
                GateReason.DOMAIN_NOT_INDEXED,
                matched_domaines=(d.id,),
                matched_terms=(f"domaine={domaine}",),
            )

    # 1. Juridiction étrangère — avant tout le reste : « code du travail
    #    français » matche le vocabulaire travail et serait sinon vu couvert.
    jur = [j for j in lex.juridictions_etrangeres if _word_present(j, q_norm)]
    if jur:
        return _decide(GateReason.OUT_OF_JURISDICTION, matched_terms=tuple(sorted(jur)))

    # 2. Norme régionale non indexée (OHADA, CIMA…). CEMAC en est absent.
    reg = [r for r in lex.regionaux_non_indexes if r in q_norm]
    if reg:
        return _decide(GateReason.REGIONAL_NOT_INDEXED, matched_terms=tuple(sorted(reg)))

    # 3. Code non indexé nommément invoqué. Distingue le SUJET du TEXTE : dans
    #    « licencier un salarié selon le code civil », le sujet est couvert mais
    #    le texte invoqué ne l'est pas — c'est bien un refus.
    for c in lex.codes:
        if c.indexed:
            continue
        for f in c.formes:
            if f and f in q_norm:
                return _decide(
                    GateReason.CODE_NOT_INDEXED,
                    matched_domaines=(c.id,),
                    matched_terms=(f,),
                    invoked_code=c.id,
                    invoked_code_label=c.libelle,
                )

    # 4. Millésime périmé d'un code indexé. Le domaine étant indexé, aucun filtre
    #    de domaine ne peut attraper ce cas — seule la date le peut.
    dates = indexed_code_dates if indexed_code_dates is not None else indexed_code_years()
    if dates:
        invoked = _indexed_code_invoked(lex, q_norm)
        if invoked:
            code_id, code_label = invoked
            current = dates.get(code_id)
            for y in (int(m) for m in _YEAR_RE.findall(question)):
                if current and y < current:
                    return _decide(
                        GateReason.OUTDATED_REFERENCE,
                        matched_domaines=(code_id,),
                        matched_terms=(str(y),),
                        invoked_code=code_id,
                        invoked_code_label=code_label,
                        detected_year=y,
                    )

    # 5. Marqueur fort d'une matière absente du corpus. Ces termes sont choisis
    #    pour être univoques : un mot du vocabulaire juridique commun ici ferait
    #    refuser une question légitime (invariant testé côté lexique).
    for d in lex.domaines:
        if d.indexed:
            continue
        hits = _match_domain_terms(d, q_norm, q_stems)
        if hits:
            return _decide(
                GateReason.DOMAIN_NOT_INDEXED,
                matched_domaines=(d.id,),
                matched_terms=tuple(hits),
            )

    # 6. Vocabulaire positif : la question est couverte par au moins un domaine.
    covered: list[str] = []
    terms: list[str] = []
    for d in lex.domaines:
        if not d.indexed:
            continue
        hits = _match_domain_terms(d, q_norm, q_stems)
        if hits:
            covered.append(d.id)
            terms.extend(hits)
    if covered:
        return _decide(
            GateReason.COVERED,
            matched_domaines=tuple(covered),
            matched_terms=tuple(sorted(set(terms))),
        )

    # 7. Aucun signal. NON bloquant : le lexique est peut-être incomplet, et
    #    c'est à la boucle d'enrichissement de le combler, pas à l'utilisateur
    #    d'essuyer un refus.
    return _decide(GateReason.NO_TERM_RECOGNIZED)
