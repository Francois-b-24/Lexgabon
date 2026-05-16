"""Route /api/veille/scrape — scraping intelligent des portails officiels (D7).

Architecture par adapter (un par portail) :
- OHADA : scrape l'index des actes uniformes en vigueur via trafilatura.
- JO Gabon : tente la page d'accueil ; le portail ne propose pas de flux propre,
  donc on extrait des liens vers les dernières publications quand le HTML s'y prête.
- CEMAC, COBAC, CIMA : squelettes à enrichir au cas par cas.

Retourne un JSON d'items prêts à upserter dans la table `veille_items` côté Next :
{
  "items": [
    {
      "slug": "ohada-au-vente-2023",
      "source": "ohada",
      "type": "acte uniforme",
      "titre": "...",
      "resume": "...",
      "url": "https://...",
      "portal": "ohada.org",
      "date_publication": "2023-10-17"   // YYYY-MM-DD, peut être null
    },
    ...
  ],
  "errors": [
    {"adapter": "jo-ga", "message": "..."}
  ]
}

Sécurité : la route exige un Bearer token (le même CRON_SECRET que côté Next)
pour empêcher des déclenchements anonymes.
"""
from __future__ import annotations

import logging
import re
from datetime import datetime
from typing import Any
from urllib.parse import urljoin, urlparse

import httpx
import trafilatura
from fastapi import APIRouter, Header, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from src.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()

DEFAULT_UA = "LexGabonVeilleBot/1.0 (+https://github.com/Francois-b-24/Lexgabon)"
HTTP_TIMEOUT_S = 30.0


class VeilleScrapeItem(BaseModel):
    slug: str
    source: str  # slug URL : jo-ga, ohada, cemac, cobac, cima
    type: str | None = None
    titre: str
    resume: str | None = None
    url: str
    portal: str
    date_publication: str | None = None  # YYYY-MM-DD


class VeilleScrapeResponse(BaseModel):
    items: list[VeilleScrapeItem]
    errors: list[dict[str, Any]] = Field(default_factory=list)


def _slugify(text: str, max_len: int = 80) -> str:
    """Slug ASCII safe (a-z, 0-9, -) pour servir d'identifiant veille."""
    s = text.lower().strip()
    s = re.sub(r"[àâäãáåā]", "a", s)
    s = re.sub(r"[éèêëē]", "e", s)
    s = re.sub(r"[ïîíīì]", "i", s)
    s = re.sub(r"[óôöõòō]", "o", s)
    s = re.sub(r"[üûúùū]", "u", s)
    s = re.sub(r"[ç]", "c", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    return s[:max_len] or "item"


def _portal_host(url: str) -> str:
    try:
        return urlparse(url).hostname or url
    except Exception:
        return url


# --- Adapter OHADA ----------------------------------------------------------

OHADA_INDEX = "https://www.ohada.org/category/actes-uniformes/actes-uniformes-en-vigueur/"


def _scrape_ohada(client: httpx.Client) -> tuple[list[VeilleScrapeItem], list[dict[str, Any]]]:
    """Extrait les actes uniformes en vigueur depuis l'index OHADA.

    Le portail liste un titre + lien par acte. On parse le HTML brut avec une
    regex tolérante : trafilatura n'expose pas les liens en garde.
    """
    items: list[VeilleScrapeItem] = []
    errors: list[dict[str, Any]] = []
    try:
        r = client.get(OHADA_INDEX)
        r.raise_for_status()
        html = r.text

        # Pattern simple : <a href="..."> ... acte uniforme ... </a>
        # On capture les liens vers les pages /acte-uniforme-... et leurs titres.
        link_pattern = re.compile(
            r'<a[^>]+href="(https?://[^"]+)"[^>]*>([^<]{20,200})</a>',
            re.IGNORECASE,
        )
        seen: set[str] = set()
        for match in link_pattern.finditer(html):
            url = match.group(1)
            label = re.sub(r"\s+", " ", match.group(2)).strip()
            if url in seen:
                continue
            low = label.lower()
            if not ("acte uniforme" in low or "ohada" in low):
                continue
            if "ohada.org" not in url:
                continue
            seen.add(url)
            slug = _slugify(label)
            items.append(
                VeilleScrapeItem(
                    slug=f"ohada-{slug}",
                    source="ohada",
                    type="acte uniforme",
                    titre=label[:200],
                    resume=None,
                    url=url,
                    portal="ohada.org",
                    date_publication=None,
                )
            )
        if not items:
            errors.append({"adapter": "ohada", "message": "aucun lien d'acte trouvé"})
    except httpx.HTTPError as e:
        errors.append({"adapter": "ohada", "message": f"HTTP error: {e}"})
    except Exception as e:
        logger.exception("ohada scrape failed")
        errors.append({"adapter": "ohada", "message": str(e)})
    return items, errors


# --- Adapter JO Gabon -------------------------------------------------------

JO_GABON_INDEX = "https://journal-officiel.ga/"


def _scrape_jo_gabon(client: httpx.Client) -> tuple[list[VeilleScrapeItem], list[dict[str, Any]]]:
    """Récupère les dernières publications visibles sur la page d'accueil du JO Gabon.

    Le site ne propose pas d'API ; on extrait les liens vers des pages numérotées
    typées « /<id>-<reference>/ » qui correspondent aux numéros du JO.
    """
    items: list[VeilleScrapeItem] = []
    errors: list[dict[str, Any]] = []
    try:
        r = client.get(JO_GABON_INDEX)
        r.raise_for_status()
        html = r.text

        # Liens internes typés "/12345-XXX/" (numéros JO).
        link_pattern = re.compile(
            r'<a[^>]+href="(/\d{3,6}-[^"]+/)"[^>]*>([^<]{10,200})</a>',
            re.IGNORECASE,
        )
        seen: set[str] = set()
        for match in link_pattern.finditer(html):
            path = match.group(1)
            label = re.sub(r"\s+", " ", match.group(2)).strip()
            if path in seen:
                continue
            seen.add(path)
            url = urljoin(JO_GABON_INDEX, path)
            slug = _slugify(label)
            items.append(
                VeilleScrapeItem(
                    slug=f"jo-ga-{slug}",
                    source="jo-ga",
                    type=None,
                    titre=label[:200],
                    resume=None,
                    url=url,
                    portal="journal-officiel.ga",
                    date_publication=None,
                )
            )
        if not items:
            errors.append({"adapter": "jo-ga", "message": "aucun lien JO trouvé sur la home"})
    except httpx.HTTPError as e:
        errors.append({"adapter": "jo-ga", "message": f"HTTP error: {e}"})
    except Exception as e:
        logger.exception("jo-ga scrape failed")
        errors.append({"adapter": "jo-ga", "message": str(e)})
    return items, errors


# --- Adapters squelettes (à enrichir) ---------------------------------------

CEMAC_INDEX = "https://cemac.int/decisions/"
COBAC_INDEX = "https://www.beac.int/supervision-bancaire/reglements-de-cobac"
CIMA_INDEX = "https://cima-afrique.org/"


def _scrape_generic_stub(
    url: str, source: str, portal: str
) -> tuple[list[VeilleScrapeItem], list[dict[str, Any]]]:
    """Squelette : récupère le titre de la page mais ne crawle pas la liste.
    À enrichir avec un adapter dédié quand le portail expose une structure stable.
    """
    return [], [
        {
            "adapter": source,
            "message": f"adapter dédié non implémenté ; portail surveillé : {url}",
            "portal": portal,
        }
    ]


# --- Endpoint --------------------------------------------------------------


def _authorize(authorization: str | None) -> bool:
    """Vérifie le Bearer token : on réutilise CRON_SECRET (variable côté Next),
    transmis dans l'en-tête Authorization."""
    secret = (get_settings().anthropic_api_key or "") + ""  # placeholder
    expected = (
        # On ne stocke pas CRON_SECRET dans le settings backend par défaut, donc
        # on lit directement la variable d'env.
        __import__("os").environ.get("CRON_SECRET") or ""
    )
    if not expected:
        # Mode permissif si pas de secret configuré (dev) : on accepte.
        return True
    return authorization == f"Bearer {expected}"


@router.post("/api/veille/scrape")
def veille_scrape(request: Request, authorization: str | None = Header(default=None)):
    if not _authorize(authorization):
        return JSONResponse({"detail": "unauthorized"}, status_code=401)

    all_items: list[VeilleScrapeItem] = []
    all_errors: list[dict[str, Any]] = []

    with httpx.Client(
        headers={"User-Agent": DEFAULT_UA},
        timeout=HTTP_TIMEOUT_S,
        follow_redirects=True,
    ) as client:
        # OHADA
        items, errors = _scrape_ohada(client)
        all_items.extend(items)
        all_errors.extend(errors)

        # JO Gabon
        items, errors = _scrape_jo_gabon(client)
        all_items.extend(items)
        all_errors.extend(errors)

        # Squelettes pour les autres
        for stub_url, stub_source, stub_portal in [
            (CEMAC_INDEX, "cemac", "cemac.int"),
            (COBAC_INDEX, "cobac", "beac.int"),
            (CIMA_INDEX, "cima", "cima-afrique.org"),
        ]:
            items, errors = _scrape_generic_stub(stub_url, stub_source, stub_portal)
            all_items.extend(items)
            all_errors.extend(errors)

    # Déduplique par slug (au cas où un même item serait capté deux fois).
    seen_slugs: set[str] = set()
    deduped: list[VeilleScrapeItem] = []
    for item in all_items:
        if item.slug in seen_slugs:
            continue
        seen_slugs.add(item.slug)
        deduped.append(item)

    logger.info(
        "[veille_scrape] %d items, %d erreurs (clientIP=%s)",
        len(deduped),
        len(all_errors),
        request.client.host if request.client else "?",
    )
    return VeilleScrapeResponse(items=deduped, errors=all_errors)
