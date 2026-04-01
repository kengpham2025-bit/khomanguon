import { SellerDashboardClient } from "@/components/SellerDashboardClient";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, products, variants, orders } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface SellerPageProps {
  searchParams: { locale?: string };
}

export default async function SellerPage({ searchParams }: SellerPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/login");
  }

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!currentUser || currentUser.role !== "seller" && currentUser.role !== "admin") {
    redirect("/"); // Not a seller
  }

  // Fetch Seller Products with variants
  const rawProducts = await db
    .select()
    .from(products)
    .where(eq(products.sellerId, currentUser.id))
    .orderBy(desc(products.createdAt));

  const allVariants = await db
    .select()
    .from(variants)
    .orderBy(variants.sortOrder);

  const fetchedProducts = rawProducts.map(p => {
    let demoImages: string[] = [];
    try { demoImages = JSON.parse(p.demoImages || "[]"); } catch {}
    
    const productVariants = allVariants
      .filter(v => v.productId === p.id)
      .map(v => ({
        price: v.price,
        stock: v.stock,
      }));

    return {
      _id: p.id,
      titleVi: p.titleVi,
      titleEn: p.titleEn,
      demoImages,
      variants: productVariants,
      isHot: p.isHot,
      isSale: p.isSale,
      isNew: p.isNew,
      isActive: p.isActive,
      rating: p.rating,
      reviewCount: p.reviewCount,
      sales: p.sales,
      views: p.views,
      createdAt: p.createdAt instanceof Date ? p.createdAt.getTime() : Number(p.createdAt),
    };
  });

  // Fetch seller orders for stats
  const sellerOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.sellerId, currentUser.id));

  const stats = {
    totalRevenue: sellerOrders.filter(o => o.status === "completed").reduce((sum, o) => sum + o.totalPrice, 0),
    pendingOrders: sellerOrders.filter(o => o.status === "paid" || o.status === "pending").length,
    totalProducts: fetchedProducts.length,
    totalSales: fetchedProducts.reduce((sum, p) => sum + p.sales, 0),
  };

  return (
    <SellerDashboardClient
      products={fetchedProducts}
      locale={locale}
      stats={stats}
    />
  );
}
