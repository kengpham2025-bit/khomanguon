import { UserDashboardClient } from "@/components/UserDashboardClient";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, orders, products, variants, deposits, withdrawals, affiliateLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: { locale?: string };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/login");
  }

  // 1. Get currentUser
  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!currentUser) {
    // If not found in DB but logged into Clerk, might need redirect to setup or login
    redirect("/login");
  }

  // 2. Map user correctly
  const user = {
    _id: currentUser.id,
    email: currentUser.email,
    username: currentUser.username || currentUser.fullName || "User",
    fullName: currentUser.fullName || "",
    avatarUrl: currentUser.avatarUrl || undefined,
    balance: currentUser.balance,
    role: currentUser.role,
    kycStatus: currentUser.kycStatus,
    referralCode: currentUser.referralCode,
    totalEarnings: currentUser.totalEarnings,
    isAffiliateActive: currentUser.isAffiliateActive,
    bankAccount: currentUser.bankAccountNumber ? {
      bankName: currentUser.bankName || "",
      bankCode: currentUser.bankCode || "",
      accountNumber: currentUser.bankAccountNumber || "",
      accountHolder: currentUser.bankAccountHolder || "",
    } : undefined,
  };

  // 3. User Orders
  const rawOrders = await db
    .select({
      order: orders,
      product: products,
      variant: variants,
    })
    .from(orders)
    .leftJoin(products, eq(orders.productId, products.id))
    .leftJoin(variants, eq(orders.variantId, variants.id))
    .where(eq(orders.buyerId, currentUser.id))
    .orderBy(desc(orders.createdAt));

  const fetchedOrders = rawOrders.map(({ order: o, product: p, variant: v }) => {
    let demoImages: string[] = [];
    try { demoImages = JSON.parse(p?.demoImages || "[]"); } catch {}
    
    return {
      _id: o.id,
      totalPrice: o.totalPrice,
      status: o.status,
      createdAt: o.createdAt instanceof Date ? o.createdAt.getTime() : Number(o.createdAt),
      product: p ? {
        titleVi: p.titleVi,
        titleEn: p.titleEn,
        demoImages,
      } : undefined,
      variant: v ? {
        labelVi: v.labelVi,
        labelEn: v.labelEn,
      } : undefined,
    };
  });

  // 4. Deposits
  const rawDeposits = await db
    .select()
    .from(deposits)
    .where(eq(deposits.userId, currentUser.id))
    .orderBy(desc(deposits.createdAt));
  
  const fetchedDeposits = rawDeposits.map(d => ({
    _id: d.id,
    amount: d.amount,
    status: d.status,
    payosOrderCode: d.payosOrderCode,
    createdAt: d.createdAt instanceof Date ? d.createdAt.getTime() : Number(d.createdAt),
    completedAt: d.completedAt ? (d.completedAt instanceof Date ? d.completedAt.getTime() : Number(d.completedAt)) : undefined,
  }));

  // 5. Withdrawals
  const rawWithdrawals = await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.userId, currentUser.id))
    .orderBy(desc(withdrawals.createdAt));

  const fetchedWithdrawals = rawWithdrawals.map(w => ({
    _id: w.id,
    amount: w.amount,
    bankName: w.bankName,
    accountNumber: w.accountNumber,
    accountHolder: w.accountHolder,
    status: w.status,
    adminNote: w.adminNote || undefined,
    createdAt: w.createdAt instanceof Date ? w.createdAt.getTime() : Number(w.createdAt),
  }));

  // 6. Affiliate Logs
  const rawAffiliateLogs = await db
    .select()
    .from(affiliateLogs)
    .where(eq(affiliateLogs.userId, currentUser.id))
    .orderBy(desc(affiliateLogs.createdAt));

  const fetchedAffiliateLogs = rawAffiliateLogs.map(a => ({
    _id: a.id,
    commissionAmount: a.commissionAmount,
    depositAmount: a.depositAmount,
    referredUserId: a.referredUserId,
    createdAt: a.createdAt instanceof Date ? a.createdAt.getTime() : Number(a.createdAt),
  }));

  const stats = {
    totalSpent: fetchedOrders.filter((o) => o.status === "completed").reduce((s, o) => s + o.totalPrice, 0),
    totalOrders: fetchedOrders.length,
    pendingOrders: fetchedOrders.filter((o) => o.status === "pending" || o.status === "paid").length,
    completedOrders: fetchedOrders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <UserDashboardClient
        user={user}
        orders={fetchedOrders}
        deposits={fetchedDeposits}
        withdrawals={fetchedWithdrawals}
        affiliateLogs={fetchedAffiliateLogs}
        locale={locale}
        stats={stats}
      />
    </div>
  );
}
