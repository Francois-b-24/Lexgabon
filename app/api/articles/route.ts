/**
 * GET /api/articles?slug=<texte_slug>&numero=<numero>
 *
 * Aperçu d'un article unique pour le popover Ama'IA (T2.3). Renvoie 200 avec
 * `{ found: false }` si l'article n'est pas indexé, plutôt que 404, pour
 * permettre au client de basculer sur le mode « lien externe » sans gérer
 * une erreur HTTP.
 */
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { findArticleByTexteSlugAndNumero } from "@/lib/textes-service";

export const dynamic = "force-dynamic";

const MAX_SLUG_LEN = 128;
const MAX_NUMERO_LEN = 32;

export async function GET(req: Request) {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    if (!rateLimit(`articles:${ip}`, 60)) {
      return NextResponse.json({ found: false, error: "rate_limited" }, { status: 429 });
    }

    const url = new URL(req.url);
    const slug = (url.searchParams.get("slug") ?? "").trim().slice(0, MAX_SLUG_LEN);
    const numero = (url.searchParams.get("numero") ?? "").trim().slice(0, MAX_NUMERO_LEN);

    if (!slug || !numero) {
      return NextResponse.json({ found: false, error: "missing_params" }, { status: 400 });
    }

    const article = await findArticleByTexteSlugAndNumero(slug, numero);
    if (!article) {
      return NextResponse.json({ found: false });
    }

    // On tronque le contenu pour le popover ; le permalien renvoie vers la fiche complète.
    const PREVIEW_MAX = 600;
    const contenuPreview =
      article.contenu.length > PREVIEW_MAX
        ? article.contenu.slice(0, PREVIEW_MAX - 1).trimEnd() + "…"
        : article.contenu;

    return NextResponse.json({
      found: true,
      numero: article.numero,
      titre: article.titre,
      titreSection: article.titreSection,
      contenu: contenuPreview,
      texteSlug: article.texteSlug,
      texteTitre: article.texteTitre,
      texteReference: article.texteReference,
      source: article.source,
      permalink: article.permalink,
    });
  } catch (e) {
    console.error("[api/articles]", e);
    return NextResponse.json({ found: false, error: "server_error" }, { status: 200 });
  }
}
