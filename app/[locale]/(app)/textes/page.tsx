import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { mockVeille } from "@/lib/mock/veille";

export default async function TextesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Nav");

  return (
    <div className="p-6">
      <h1 className="font-app-serif text-xl font-semibold text-white">{t("textes")}</h1>
      <ul className="mt-4 space-y-2">
        {mockVeille.map((m) => (
          <li key={m.id}>
            <Link href={`/textes/${m.slug}`} className="text-sm text-lg-gold hover:underline">
              {m.titre}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
