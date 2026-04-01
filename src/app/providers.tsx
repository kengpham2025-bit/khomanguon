"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { NotificationProvider } from "@/components/NotificationProvider";
import { ConfirmDialogWrapper } from "@/components/ConfirmDialogWrapper";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function Providers({ children }: { children: React.ReactNode }) {
  const inner = (
    <NotificationProvider>
      {children}
      <ConfirmDialogWrapper />
    </NotificationProvider>
  );

  // Skip ClerkProvider when key is missing (e.g. during Netlify static build)
  if (!clerkKey) {
    return inner;
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      {inner}
    </ClerkProvider>
  );
}
