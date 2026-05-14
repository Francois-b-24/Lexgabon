import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import {
  Cormorant_Garamond,
  Montserrat,
  Outfit,
  Playfair_Display,
  Syne,
} from "next/font/google";
import { LangAttribute } from "@/components/lang-attribute";
import { ScrollToTopOnNavigation } from "@/components/layout/scroll-to-top-on-navigation";
import { routing } from "@/i18n/routing";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-landing-serif",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-landing-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-app-serif",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-app-sans",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-logo",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const raw = await params;
  const candidate = typeof raw?.locale === "string" ? raw.locale : routing.defaultLocale;
  const locale = routing.locales.includes(candidate as (typeof routing.locales)[number])
    ? candidate
    : routing.defaultLocale;
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <LangAttribute />
      <ScrollToTopOnNavigation />
      <div
        className={`${cormorant.variable} ${syne.variable} ${playfair.variable} ${outfit.variable} ${montserrat.variable}`}
      >
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
