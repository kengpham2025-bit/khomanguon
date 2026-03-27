"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AuthModalInner } from "@/components/AuthModalInner";

type AuthModalMode = "login" | "register" | "forgot";

type AuthModalCtx = {
  open: (mode?: AuthModalMode) => void;
  close: () => void;
};

const ctx = createContext<AuthModalCtx>({ open: () => {}, close: () => {} });
export const useAuthModal = () => useContext(ctx);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultMode, setDefaultMode] = useState<AuthModalMode>("login");

  const open = useCallback((mode: AuthModalMode = "login") => {
    setDefaultMode(mode);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ctx.Provider value={{ open, close }}>
      {children}
      {isOpen && (
        <AuthModalInner defaultMode={defaultMode} onClose={close} />
      )}
    </ctx.Provider>
  );
}

