import { KycClient } from "@/components/KycClient";

interface KycPageProps {
  searchParams: { locale?: string };
}

export default function KycPage({ searchParams }: KycPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";
  return <KycClient locale={locale} />;
}
