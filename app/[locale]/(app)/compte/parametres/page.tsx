import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function ParametresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Compte");
  return (
    <div className="p-6">
      <h1 className="font-app-serif text-xl text-white">{t("parametres")}</h1>
      <p className="mt-2 text-sm text-white/50">{t("wipParametres")}</p>
    </div>
  );
}
