import { ProductsAdminClient } from "@/components/admin/ProductsAdminClient";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, products, variants, categories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: { locale?: string };
}

export default async function ProductsAdminPage({ searchParams }: ProductsPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect("/login");

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!currentUser || currentUser.role !== "admin") redirect("/");

  const allProducts = await db
    .select({
      product: products,
      seller: users,
      category: categories,
    })
    .from(products)
    .leftJoin(users, eq(products.sellerId, users.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));

  const allVariants = await db.select().from(variants).orderBy(variants.sortOrder);

  const mappedProducts = allProducts.map(({ product: p, seller: s, category: c }) => {
    let demoImages: string[] = [];
    try { demoImages = JSON.parse(p.demoImages || "[]"); } catch {}

    const productVariants = allVariants
      .filter(v => v.productId === p.id)
      .map(v => ({ price: v.price, stock: v.stock }));

    return {
      _id: p.id,
      titleVi: p.titleVi,
      titleEn: p.titleEn,
      category: c ? (locale === "vi" ? c.nameVi : c.nameEn) : "Unknown",
      sellerName: s ? (s.username || s.fullName || s.email) : "Unknown",
      sellerId: s?.id || "",
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

  return <ProductsAdminClient locale={locale} products={mappedProducts} />;
}
