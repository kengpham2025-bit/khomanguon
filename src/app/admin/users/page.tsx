import { UsersAdminClient } from "@/components/admin/UsersAdminClient";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface AdminUsersPageProps {
  searchParams: { locale?: string };
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect("/login");

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!currentUser || currentUser.role !== "admin") redirect("/");

  const allUsersRaw = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));

  const mappedUsers = allUsersRaw.map(u => ({
    _id: u.id,
    email: u.email,
    username: u.username || "",
    fullName: u.fullName || undefined,
    role: u.role,
    kycStatus: u.kycStatus,
    balance: u.balance,
    totalEarnings: u.totalEarnings,
    createdAt: u.createdAt instanceof Date ? u.createdAt.getTime() : Number(u.createdAt),
    referralCode: u.referralCode,
  }));

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {locale === "vi" ? "Quản lý người dùng" : "User Management"}
        </h1>
      </div>
      <UsersAdminClient users={mappedUsers} locale={locale} />
    </>
  );
}
