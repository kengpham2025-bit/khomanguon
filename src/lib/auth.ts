import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { generateAffiliateCode } from "./utils";

// ─── Get user by Clerk ID ────────────────────────────────────────────────────
export async function getUserByClerkId(clerkId: string) {
  return db.select().from(users).where(eq(users.clerkId, clerkId)).get();
}

// ─── Get user by ID ──────────────────────────────────────────────────────────
export async function getUserById(userId: string) {
  return db.select().from(users).where(eq(users.id, userId)).get();
}

// ─── Get user by email ────────────────────────────────────────────────────────
export async function getUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email)).get();
}

// ─── Get user by referral code ───────────────────────────────────────────────
export async function getUserByReferralCode(code: string) {
  return db.select().from(users).where(eq(users.referralCode, code)).get();
}

// ─── Upsert user from Clerk webhook ─────────────────────────────────────────
export async function upsertUserFromClerk(data: {
  clerkId: string;
  email: string;
  username?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
}) {
  const existing = await getUserByClerkId(data.clerkId);

  if (existing) {
    await db
      .update(users)
      .set({
        email: data.email,
        username: data.username ?? existing.username,
        fullName: data.fullName ?? existing.fullName,
        avatarUrl: data.avatarUrl ?? existing.avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id));
    return existing;
  }

  // Create new user
  const referralCode = generateAffiliateCode();
  const newUser = {
    id: crypto.randomUUID(),
    clerkId: data.clerkId,
    email: data.email,
    username: data.username ?? null,
    fullName: data.fullName ?? null,
    avatarUrl: data.avatarUrl ?? null,
    balance: 0,
    role: "user" as const,
    language: "vi" as const,
    referralCode,
    referredBy: null,
    kycStatus: "none" as const,
    kycCccdFront: null,
    kycCccdBack: null,
    kycCccdNumber: null,
    kycSubmittedAt: null,
    bankName: null,
    bankCode: null,
    bankAccountNumber: null,
    bankAccountHolder: null,
    isAffiliateActive: false,
    totalEarnings: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(users).values(newUser);
  return { ...newUser, kycStatus: newUser.kycStatus as "none" | "pending" | "approved" | "rejected" };
}

// ─── Update user KYC ─────────────────────────────────────────────────────────
export async function updateUserKyc(
  userId: string,
  kycData: {
    cccdFront: string;
    cccdBack: string;
    cccdNumber: string;
  }
) {
  await db
    .update(users)
    .set({
      kycCccdFront: kycData.cccdFront,
      kycCccdBack: kycData.cccdBack,
      kycCccdNumber: kycData.cccdNumber,
      kycSubmittedAt: new Date(),
      kycStatus: "pending",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

// ─── Approve user KYC ─────────────────────────────────────────────────────────
export async function approveUserKyc(userId: string) {
  await db
    .update(users)
    .set({
      kycStatus: "approved",
      kycSubmittedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

// ─── Reject user KYC ─────────────────────────────────────────────────────────
export async function rejectUserKyc(userId: string) {
  await db
    .update(users)
    .set({
      kycStatus: "rejected",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

// ─── Update user bank account ────────────────────────────────────────────────
export async function updateUserBankAccount(
  userId: string,
  bank: { bankName: string; bankCode: string; accountNumber: string; accountHolder: string }
) {
  await db
    .update(users)
    .set({
      bankName: bank.bankName,
      bankCode: bank.bankCode,
      bankAccountNumber: bank.accountNumber,
      bankAccountHolder: bank.accountHolder,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

// ─── Credit user balance ──────────────────────────────────────────────────────
export async function creditBalance(userId: string, amount: number) {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");
  await db
    .update(users)
    .set({
      balance: user.balance + amount,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

// ─── Debit user balance ──────────────────────────────────────────────────────
export async function debitBalance(userId: string, amount: number) {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");
  if (user.balance < amount) throw new Error("Insufficient balance");
  await db
    .update(users)
    .set({
      balance: user.balance - amount,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

// ─── Update user role ─────────────────────────────────────────────────────────
export async function updateUserRole(userId: string, role: "user" | "seller" | "vendor" | "admin") {
  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

// ─── Toggle affiliate status ─────────────────────────────────────────────────
export async function toggleAffiliate(userId: string, active: boolean) {
  await db
    .update(users)
    .set({ isAffiliateActive: active, updatedAt: new Date() })
    .where(eq(users.id, userId));
}
