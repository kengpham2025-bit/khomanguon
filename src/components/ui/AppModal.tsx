"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { IconX } from "@/components/Icons";
import { ModalSurface } from "@/components/ui/ModalSurface";

export type AppModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AppModal({ open, onOpenChange, title, description, children, footer }: AppModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="ui-overlay" />
        <Dialog.Content className="ui-modal-content ui-modal--framed">
          <ModalSurface>
            <div className="flex items-start justify-between gap-4">
              <Dialog.Title style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {title}
              </Dialog.Title>
              <Dialog.Close className="btn-icon btn-ghost" aria-label="Đóng">
                <IconX size={20} />
              </Dialog.Close>
            </div>
            {description ? (
              <Dialog.Description style={{ marginTop: "var(--space-2)", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                {description}
              </Dialog.Description>
            ) : null}
            <div style={{ marginTop: "var(--space-4)" }}>{children}</div>
            {footer ? (
              <div className="flex flex-wrap justify-end gap-2" style={{ marginTop: "var(--space-6)", borderTop: "1px solid var(--border-light)", paddingTop: "var(--space-4)" }}>
                {footer}
              </div>
            ) : null}
          </ModalSurface>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
