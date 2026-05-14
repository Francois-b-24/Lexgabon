import { getTranslations } from "next-intl/server";
import ChatbotPanel from "@/components/chatbot/chatbot-panel";

export default async function ChatbotPage() {
  const t = await getTranslations("Chatbot");
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatbotPanel welcome={t("welcome")} />
    </div>
  );
}
