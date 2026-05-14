import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";

export default async function AuthLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Landing");
  return (
    <div className="flex min-h-screen flex-col bg-lg-navy font-app-sans text-white">
      <header className="flex shrink-0 items-center justify-between border-b border-[var(--lg-gold-faint)] bg-lg-navy px-6 py-4 md:px-9">
        <Link href="/">
          <Logo tagline={t("tagline")} />
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-12">{children}</div>
    </div>
  );
}
