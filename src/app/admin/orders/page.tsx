import { OrdersAdminClient } from "@/components/admin/OrdersAdminClient";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, orders, products, variants } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface AdminOrdersPageProps {
  searchParams: { locale?: string };
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect("/login");

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!currentUser || currentUser.role !== "admin") redirect("/");

  // Need alias for buyer and seller
  const allOrdersRaw = await db
    .select({
      order: orders,
      product: products,
      variant: variants,
      buyer: users,
      // Cannot join users twice natively easily without aliases in drizzle, so fetch all users and map in TS
    })
    .from(orders)
    .leftJoin(products, eq(orders.productId, products.id))
    .leftJoin(variants, eq(orders.variantId, variants.id))
    .leftJoin(users, eq(orders.buyerId, users.id))
    .orderBy(desc(orders.createdAt));

  const allUsers = await db.select().from(users);

  const mappedOrders = allOrdersRaw.map(({ order: o, product: p, variant: v, buyer: b }) => {
    let demoImages: string[] = [];
    try { demoImages = JSON.parse(p?.demoImages || "[]"); } catch {}
    
    const seller = allUsers.find(u => u.id === o.sellerId);

    return {
      _id: o.id,
      totalPrice: o.totalPrice,
      unitPrice: o.unitPrice,
      quantity: o.quantity,
      status: o.status,
      paymentMethod: o.paymentMethod || undefined,
      payosTransactionNo: o.payosTransactionNo || undefined,
      createdAt: o.createdAt instanceof Date ? o.createdAt.getTime() : Number(o.createdAt),
      deliveredAt: o.deliveredAt ? (o.deliveredAt instanceof Date ? o.deliveredAt.getTime() : Number(o.deliveredAt)) : undefined,
      completedAt: o.completedAt ? (o.completedAt instanceof Date ? o.completedAt.getTime() : Number(o.completedAt)) : undefined,
      cancellationReason: o.cancellationReason || undefined,
      product: p ? { titleVi: p.titleVi, titleEn: p.titleEn, demoImages } : { titleVi: "Unknown", titleEn: "Unknown", demoImages: [] },
      variant: v ? { labelVi: v.labelVi, labelEn: v.labelEn } : { labelVi: "Unknown", labelEn: "Unknown" },
      buyer: b ? { email: b.email, username: b.username || undefined, fullName: b.fullName || undefined } : { email: "Unknown", username: undefined, fullName: undefined },
      seller: seller ? { email: seller.email, username: seller.username || undefined, fullName: seller.fullName || undefined } : { email: "Unknown", username: undefined, fullName: undefined },
    };
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {locale === "vi" ? "Quản lý đơn hàng" : "Order Management"}
        </h1>
      </div>
      <OrdersAdminClient orders={mappedOrders} locale={locale} />
    </>
  );
}
