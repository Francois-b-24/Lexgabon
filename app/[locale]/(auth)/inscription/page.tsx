import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function InscriptionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");

  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.04] p-8 text-center font-app-sans text-white">
      <h1 className="font-app-serif text-2xl font-semibold">{t("signUp")}</h1>
      <p className="mt-3 text-sm text-white/50">{t("signUpMagicLinkHint")}</p>
      <Link href="/connexion" className="mt-6 inline-block text-lg-gold hover:underline">
        {t("signIn")} →
      </Link>
    </div>
  );
}
