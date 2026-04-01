import { CartPageClient } from "@/components/CartPageClient";

interface CartPageProps {
  searchParams: { locale?: string };
}

export default function CartPage({ searchParams }: CartPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";
  return (
    <div className="min-h-screen bg-slate-50">
      <CartPageClient locale={locale} />
    </div>
  );
}
