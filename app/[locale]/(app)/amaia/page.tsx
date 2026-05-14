import AmaiaClient from "./amaia-client";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function AmaiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Amaia");
  return <AmaiaClient welcome={t("welcome")} />;
}
