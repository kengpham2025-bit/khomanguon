import { WithdrawalsAdminClient } from "@/components/admin/WithdrawalsAdminClient";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, withdrawals } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface WithdrawalsPageProps {
  searchParams: { locale?: string };
}

export default async function WithdrawalsAdminPage({ searchParams }: WithdrawalsPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect("/login");

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!currentUser || currentUser.role !== "admin") redirect("/");

  const allWithdrawalsRaw = await db
    .select({
      withdrawal: withdrawals,
      user: users,
    })
    .from(withdrawals)
    .innerJoin(users, eq(withdrawals.userId, users.id))
    .orderBy(desc(withdrawals.createdAt));

  const mappedWithdrawals = allWithdrawalsRaw.map(({ withdrawal: w, user: u }) => ({
    _id: w.id,
    userId: u.id,
    userName: u.fullName || u.username || "Unknown",
    userEmail: u.email,
    bankName: w.bankName,
    accountNumber: w.accountNumber,
    accountHolder: w.accountHolder,
    amount: w.amount,
    status: w.status as "pending" | "approved" | "rejected",
    createdAt: w.createdAt instanceof Date ? w.createdAt.getTime() : Number(w.createdAt),
    note: w.adminNote || undefined,
  }));

  return <WithdrawalsAdminClient locale={locale} withdrawals={mappedWithdrawals} />;
}
