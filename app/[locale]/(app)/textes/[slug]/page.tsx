import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { mockTexteDetail, resolveMockTexteDetail } from "@/lib/mock/veille";
import { getDb } from "@/lib/db";
import { textes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function TexteDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Textes");

  const db = getDb();
  let detail: (typeof mockTexteDetail) | null = null;

  if (db) {
    try {
      const rows = await db.select().from(textes).where(eq(textes.slug, slug)).limit(1);
      const row = rows[0];
      if (row) {
        detail = {
          slug: row.slug,
          reference: row.reference,
          titre: row.titre,
          datePublication: String(row.datePublication),
          sourceUrl: row.urlSource,
          resume: row.resume ?? "",
          articles: [{ id: "1", titre: row.titre, contenu: "Contenu indexé — voir le PDF officiel." }],
        };
      }
    } catch {
      /* Base indisponible ou schéma non migré : fallback mock ci-dessous */
    }
  }

  if (!detail) {
    detail = resolveMockTexteDetail(slug);
  }

  if (!detail) notFound();

  return (
    <div className="grid min-h-screen gap-8 p-5 lg:grid-cols-[280px_1fr]">
      <aside className="top-24 h-fit space-y-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 lg:sticky">
        <p className="text-[10px] uppercase tracking-wider text-lg-gold">{detail.reference}</p>
        <h1 className="font-app-serif text-lg font-semibold text-white">{detail.titre}</h1>
        <p className="text-xs text-white/45">{detail.datePublication}</p>
        <a
          href={detail.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-md bg-lg-gold px-3 py-2 text-xs font-semibold text-lg-navy"
        >
          {t("downloadPdf")}
        </a>
        <nav className="text-xs text-white/50">
          <p className="mb-2 font-medium text-white/70">{t("articles")}</p>
          <ul className="space-y-1">
            {detail.articles.map((a) => (
              <li key={a.id}>
                <a href={`#article-${a.id}`} className="hover:text-lg-gold">
                  {a.titre}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <article className="min-w-0">
        <p className="mb-6 text-sm text-white/60">{detail.resume}</p>
        {detail.articles.map((a) => (
          <section key={a.id} id={`article-${a.id}`} className="mb-10 scroll-mt-24">
            <h2 className="font-app-serif text-base font-semibold text-lg-gold">{a.titre}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{a.contenu}</p>
          </section>
        ))}
      </article>
    </div>
  );
}
