import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, products, orders, withdrawals } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface AdminPageProps {
  searchParams: { locale?: string };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect("/login");

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!currentUser || currentUser.role !== "admin") redirect("/");

  // Fetch real stats
  const allUsers = await db.select().from(users);
  const allProducts = await db.select().from(products);
  const allOrders = await db.select({ order: orders, buyer: users, product: products }).from(orders)
    .leftJoin(users, eq(orders.buyerId, users.id))
    .leftJoin(products, eq(orders.productId, products.id))
    .orderBy(desc(orders.createdAt));
  const allWithdrawals = await db.select().from(withdrawals);

  const stats = {
    totalUsers: allUsers.length,
    totalProducts: allProducts.length,
    totalOrders: allOrders.length,
    totalRevenue: allOrders.filter(o => o.order.status === "completed").reduce((sum, o) => sum + o.order.totalPrice, 0),
    pendingWithdrawals: allWithdrawals.filter(w => w.status === "pending").length,
    pendingKyc: allUsers.filter(u => u.kycStatus === "pending").length,
    recentOrders: allOrders.slice(0, 10).map(({ order: o, buyer: b, product: p }) => ({
      _id: o.id,
      totalPrice: o.totalPrice,
      status: o.status,
      createdAt: o.createdAt instanceof Date ? o.createdAt.getTime() : Number(o.createdAt),
      buyer: b ? { email: b.email, username: b.username || b.fullName || "" } : { email: "", username: "Unknown" },
      seller: { email: "", username: "Unknown" }, // Omitting seller join to simplify or can fetch if needed
      product: p ? { titleVi: p.titleVi, titleEn: p.titleEn } : { titleVi: "", titleEn: "" },
    })),
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
          {locale === "vi" ? "Bảng điều khiển" : "Admin Dashboard"}
        </h1>
        <p className="mt-1 text-slate-500">
          {locale === "vi" ? "Tổng quan hệ thống KHOMANGUON.IO.VN" : "KHOMANGUON.IO.VN System Overview"}
        </p>
      </div>
      <AdminDashboardClient stats={stats} locale={locale} />
    </>
  );
}
