import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ChatbotPanel from "@/components/chatbot/chatbot-panel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Chatbot" });
  return {
    title: `${t("title")} — LexGabon`,
    description: t("subtitle"),
  };
}

export default async function ChatbotPage() {
  const t = await getTranslations("Chatbot");
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatbotPanel welcome={t("welcome")} />
    </div>
  );
}
