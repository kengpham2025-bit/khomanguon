"use client";

import React, { lazy, Suspense } from "react";
import { NotificationProvider } from "@/components/NotificationProvider";
import { ConfirmDialogWrapper } from "@/components/ConfirmDialogWrapper";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Only import ClerkProvider when the key exists (avoids module-level throw during build)
const ClerkProviderLazy = clerkKey
  ? lazy(() =>
      import("@clerk/nextjs").then((mod) => ({
        default: mod.ClerkProvider,
      }))
    )
  : null;

export function Providers({ children }: { children: React.ReactNode }) {
  const inner = (
    <NotificationProvider>
      {children}
      <ConfirmDialogWrapper />
    </NotificationProvider>
  );

  if (!ClerkProviderLazy) {
    return inner;
  }

  return (
    <Suspense fallback={inner}>
      <ClerkProviderLazy publishableKey={clerkKey!}>
        {inner}
      </ClerkProviderLazy>
    </Suspense>
  );
}
