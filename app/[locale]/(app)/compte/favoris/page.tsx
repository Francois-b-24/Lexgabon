import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function FavorisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Compte");
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 md:px-9 md:py-10">
      <h1 className="font-app-serif text-xl text-white">{t("favoris")}</h1>
      <p className="mt-2 text-sm text-white/50">{t("wipFavoris")}</p>
    </div>
  );
}
