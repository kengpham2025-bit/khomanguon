import { OrdersClient } from "@/components/OrdersClient";
import { db } from "@/lib/db";
import { orders, products, variants, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

interface OrdersPageProps {
  searchParams: { locale?: string };
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";

  const { userId: clerkId } = await auth();

  let orderList: any[] = [];

  if (clerkId) {
    // Find internal user by Clerk ID
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (currentUser) {
      const rawOrders = await db
        .select({
          order: orders,
          product: products,
          variant: variants,
          seller: users,
        })
        .from(orders)
        .leftJoin(products, eq(orders.productId, products.id))
        .leftJoin(variants, eq(orders.variantId, variants.id))
        .leftJoin(users, eq(orders.sellerId, users.id))
        .where(eq(orders.buyerId, currentUser.id))
        .orderBy(desc(orders.createdAt));

      orderList = rawOrders.map(({ order: o, product: p, variant: v, seller: s }) => {
        let demoImages: string[] = [];
        try { demoImages = JSON.parse(p?.demoImages || "[]"); } catch {}

        return {
          _id: o.id,
          totalPrice: o.totalPrice,
          unitPrice: o.unitPrice,
          quantity: o.quantity,
          status: o.status,
          createdAt: o.createdAt instanceof Date ? o.createdAt.getTime() : Number(o.createdAt),
          deliveredAt: o.deliveredAt ? (o.deliveredAt instanceof Date ? o.deliveredAt.getTime() : Number(o.deliveredAt)) : undefined,
          completedAt: o.completedAt ? (o.completedAt instanceof Date ? o.completedAt.getTime() : Number(o.completedAt)) : undefined,
          product: p ? {
            titleVi: p.titleVi,
            titleEn: p.titleEn,
            demoImages,
          } : undefined,
          variant: v ? {
            labelVi: v.labelVi,
            labelEn: v.labelEn,
          } : undefined,
          seller: s ? {
            _id: s.id,
            username: s.username ?? undefined,
            fullName: s.fullName ?? undefined,
          } : undefined,
        };
      });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <OrdersClient orders={orderList} locale={locale} />
    </div>
  );
}

