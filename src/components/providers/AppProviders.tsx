"use client";

import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NextTopLoader
        color="#2d7cf1"
        height={3}
        showSpinner={false}
        shadow="0 0 14px rgba(45,124,241,0.35)"
        zIndex={99998}
      />
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={4500}
        toastOptions={{
          classNames: {
            toast: "font-ui",
            title: "font-medium",
            description: "text-slate-600",
          },
        }}
      />
    </>
  );
}
