"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { NotificationProvider } from "@/components/NotificationProvider";
import { ConfirmDialogWrapper } from "@/components/ConfirmDialogWrapper";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ""}>
      <NotificationProvider>
        {children}
        <ConfirmDialogWrapper />
      </NotificationProvider>
    </ClerkProvider>
  );
}
