import { ChatPageClient } from "@/components/ChatPageClient";

export const dynamic = "force-dynamic";

interface ChatPageProps {
  searchParams: { locale?: string };
}

export default function ChatPage({ searchParams }: ChatPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";
  return (
    <div className="min-h-screen bg-slate-50">
      <ChatPageClient locale={locale} />
    </div>
  );
}
