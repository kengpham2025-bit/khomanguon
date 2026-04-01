import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { db } from "@/lib/db";
import { products, variants, users, reviews, categories } from "@/lib/db/schema";
import { eq, and, ne, inArray, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: { id: string };
  searchParams: { locale?: string };
}

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";

  // Fetch the product
  const [productRow] = await db
    .select({ product: products, seller: users, category: categories })
    .from(products)
    .leftJoin(users, eq(products.sellerId, users.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, params.id))
    .limit(1);

  if (!productRow) return notFound();

  const { product: p, seller, category } = productRow;

  // Fetch variants
  const productVariants = await db
    .select()
    .from(variants)
    .where(eq(variants.productId, p.id))
    .orderBy(variants.sortOrder);

  // Fetch reviews with buyer info
  const productReviews = await db
    .select({ review: reviews, buyer: users })
    .from(reviews)
    .leftJoin(users, eq(reviews.buyerId, users.id))
    .where(and(eq(reviews.productId, p.id), eq(reviews.isVisible, true)))
    .orderBy(desc(reviews.createdAt))
    .limit(20);

  // Parse JSON fields
  let demoImages: string[] = [];
  let downloadLinks: string[] = [];
  try { demoImages = JSON.parse(p.demoImages); } catch {}
  try { downloadLinks = JSON.parse(p.downloadLinks); } catch {}

  const productData = {
    _id: p.id,
    titleVi: p.titleVi,
    titleEn: p.titleEn,
    descriptionVi: p.descriptionVi,
    descriptionEn: p.descriptionEn,
    demoImages,
    downloadLinks,
    isHot: p.isHot,
    isSale: p.isSale,
    isNew: p.isNew,
    rating: p.rating,
    reviewCount: p.reviewCount,
    sales: p.sales,
    views: p.views,
    sellerId: p.sellerId,
    seller: seller ? {
      _id: seller.id,
      username: seller.username ?? undefined,
      fullName: seller.fullName ?? undefined,
      avatarUrl: seller.avatarUrl ?? undefined,
      kycStatus: seller.kycStatus ?? undefined,
      rating: undefined as number | undefined,
      reviewCount: undefined as number | undefined,
    } : undefined,
    variants: productVariants.map((v) => ({
      _id: v.id,
      labelVi: v.labelVi,
      labelEn: v.labelEn,
      price: v.price,
      originalPrice: v.originalPrice ?? undefined,
      stock: v.stock,
    })),
    reviews: productReviews.map(({ review: r, buyer: b }) => ({
      _id: r.id,
      rating: r.rating,
      commentVi: r.commentVi ?? undefined,
      commentEn: r.commentEn ?? undefined,
      createdAt: r.createdAt instanceof Date ? r.createdAt.getTime() : Number(r.createdAt),
      buyer: b ? {
        username: b.username ?? undefined,
        fullName: b.fullName ?? undefined,
        avatarUrl: b.avatarUrl ?? undefined,
      } : undefined,
    })),
    category: category ? {
      nameVi: category.nameVi,
      nameEn: category.nameEn,
      slug: category.slug,
    } : undefined,
  };

  // Fetch related products (same category, different product)
  let relatedProducts: any[] = [];
  if (p.categoryId) {
    const relatedRows = await db
      .select({ product: products, seller: users })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .where(and(
        eq(products.categoryId, p.categoryId),
        eq(products.isActive, true),
        ne(products.id, p.id)
      ))
      .orderBy(desc(products.sales))
      .limit(5);

    if (relatedRows.length > 0) {
      const relatedIds = relatedRows.map((r) => r.product.id);
      const relatedVars = await db
        .select()
        .from(variants)
        .where(inArray(variants.productId, relatedIds));

      relatedProducts = relatedRows.map(({ product: rp, seller: rs }) => {
        let imgs: string[] = [];
        try { imgs = JSON.parse(rp.demoImages); } catch {}
        const rpVariants = relatedVars
          .filter((v) => v.productId === rp.id)
          .map((v) => ({
            _id: v.id, labelVi: v.labelVi, labelEn: v.labelEn,
            price: v.price, originalPrice: v.originalPrice ?? undefined, stock: v.stock,
          }));
        return {
          _id: rp.id, titleVi: rp.titleVi, titleEn: rp.titleEn,
          demoImages: imgs, isHot: rp.isHot, isSale: rp.isSale, isNew: rp.isNew,
          rating: rp.rating, reviewCount: rp.reviewCount, sales: rp.sales,
          views: rp.views, variants: rpVariants,
          seller: rs ? { username: rs.username, fullName: rs.fullName, kycStatus: rs.kycStatus } : undefined,
        };
      });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-primary-300 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === "vi" ? "Quay lại" : "Back to Products"}
        </Link>
      </div>
      <ProductDetailClient
        product={productData}
        relatedProducts={relatedProducts as any[]}
        locale={locale}
      />
    </div>
  );
}
