import { getTranslations, setRequestLocale } from "next-intl/server";

function paragraphs(text: string) {
  return text
    .trim()
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default async function CguPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Legal");

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 md:px-9 md:py-20">
      <h1 className="font-landing-serif text-3xl font-semibold text-lg-ink">{t("cguTitle")}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-lg-ink-mute">
        {paragraphs(t("cguBody")).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </main>
  );
}
