/**
 * Flux RSS 2.0 public — T2.4.
 * Route /<locale>/veille/rss.xml avec filtres ?source=&domaine=.
 * Lecture via le même service que la page SSR pour garantir la cohérence.
 */
import { listVeilleItems, parseVeilleQuery } from "@/lib/veille-service";
import { getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<string, string> = {
  "jo-ga": "Journal officiel du Gabon",
  ohada: "OHADA",
  cemac: "CEMAC",
  cobac: "COBAC",
  cima: "CIMA",
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(date: string | null): string {
  if (!date) return new Date().toUTCString();
  const d = new Date(date.length === 10 ? `${date}T00:00:00Z` : date);
  return Number.isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const url = new URL(req.url);
  const query = parseVeilleQuery(url.searchParams);
  // Limite plus généreuse pour le RSS, mais on garde un plafond pour ne pas exploser le payload.
  const { items } = await listVeilleItems({ ...query, limit: Math.min(100, query.limit) });

  const site = getSiteUrl();
  const channelLink = `${site}/${locale}/veille`;
  const selfLink = `${site}/${locale}/veille/rss.xml${url.search}`;

  const title =
    query.sources.length === 1
      ? `LexGabon — Veille ${SOURCE_LABEL[query.sources[0]] ?? query.sources[0]}`
      : "LexGabon — Veille juridique";

  const description =
    "Publications officielles suivies par LexGabon (Journal officiel du Gabon, OHADA, CEMAC, COBAC, CIMA).";

  const itemsXml = items
    .map((item) => {
      const itemTitle = item.titre;
      const link = item.url;
      const pubDate = rfc822(item.datePublication ?? item.dateIngest);
      const guid = `${site}/${locale}/veille/${item.slug}`;
      const sourceLabel = SOURCE_LABEL[item.source] ?? item.source;
      const desc = [
        item.resume ?? "",
        item.type ? `Type : ${item.type}.` : "",
        `Source : ${sourceLabel} (${item.portal}).`,
      ]
        .filter(Boolean)
        .join(" ");
      return `    <item>
      <title>${escapeXml(itemTitle)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">${escapeXml(guid)}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(sourceLabel)}</category>
      <description>${escapeXml(desc)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(channelLink)}</link>
    <atom:link href="${escapeXml(selfLink)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(description)}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml}
  </channel>
</rss>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=900", // 15 min
    },
  });
}
