import { DepositClient } from "@/components/DepositClient";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface DepositPageProps {
  searchParams: { locale?: string };
}

export default async function DepositPage({ searchParams }: DepositPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/login");
  }

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!currentUser) {
    redirect("/login");
  }

  return <DepositClient locale={locale} currentBalance={currentUser.balance} />;
}
