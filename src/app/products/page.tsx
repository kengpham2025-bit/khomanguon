import { ProductsClient } from "@/components/ProductsClient";
import { db } from "@/lib/db";
import { products, variants, users } from "@/lib/db/schema";
import { eq, inArray, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getAllActiveProducts() {
  const results = await db
    .select({
      product: products,
      seller: users,
    })
    .from(products)
    .leftJoin(users, eq(products.sellerId, users.id))
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt));

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

export default async function ProductsPage() {
  const products = await getAllActiveProducts();
  return <ProductsClient locale="vi" products={products} />;
}
