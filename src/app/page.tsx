import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeClient } from "@/components/HomeClient";
import { db } from "@/lib/db";
import { products, variants, users } from "@/lib/db/schema";
import { eq, inArray, desc, and, SQL } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getProductsByConditions(isHotCheck: boolean, isSaleCheck: boolean) {
  const conditions: SQL[] = [eq(products.isActive, true)];
  if (isHotCheck) conditions.push(eq(products.isHot, true));
  if (isSaleCheck) conditions.push(eq(products.isSale, true));

  const results = await db
    .select({
      product: products,
      seller: users,
    })
    .from(products)
    .leftJoin(users, eq(products.sellerId, users.id))
    .where(and(...conditions))
    .orderBy(desc(products.createdAt))
    .limit(10);

  if (results.length === 0) return [];

  const productIds = results.map((r) => r.product.id);
  const vars = await db
    .select()
    .from(variants)
    .where(inArray(variants.productId, productIds));

  return results.map(({ product, seller }) => {
    let images = [];
    try {
      images = JSON.parse(product.demoImages);
    } catch (e) {}
    const coverImage = images.length > 0 ? images[0] : "";

    const productVariants = vars
      .filter((v) => v.productId === product.id)
      .map((v) => ({
        _id: v.id,
        labelVi: v.labelVi,
        labelEn: v.labelEn,
        price: v.price,
        originalPrice: v.originalPrice ?? undefined,
        stock: v.stock,
      }));

    let salePercent = 0;
    if (product.isSale && productVariants.length > 0) {
      const v = productVariants[0];
      if (v.originalPrice && v.originalPrice > v.price) {
        salePercent = Math.round(((v.originalPrice - v.price) / v.originalPrice) * 100);
      }
    }

    return {
      _id: product.id,
      titleVi: product.titleVi,
      titleEn: product.titleEn,
      image: coverImage,
      variants: productVariants,
      isHot: product.isHot,
      isSale: product.isSale,
      salePercent: salePercent > 0 ? salePercent : undefined,
      rating: product.rating,
      reviewCount: product.reviewCount,
      sales: product.sales,
      sellerName: seller?.username || seller?.fullName || "Seller",
      isVerified: seller?.kycStatus === "approved",
    };
  });
}

export default async function HomePage() {
  const hotProducts = await getProductsByConditions(true, false);
  const saleProducts = await getProductsByConditions(false, true);

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale="vi" cartCount={0} />
      <main className="flex-1">
        <HomeClient locale="vi" hotProducts={hotProducts} saleProducts={saleProducts} />
      </main>
      <Footer locale="vi" />
    </div>
  );
}
