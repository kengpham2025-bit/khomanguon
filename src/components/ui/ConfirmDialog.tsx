"use client";

import {
  Action,
  Cancel,
  Content,
  Description,
  Overlay,
  Portal,
  Root,
  Title,
} from "@radix-ui/react-alert-dialog";
import { ModalSurface } from "@/components/ui/ModalSurface";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
  variant = "default",
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Portal>
        <Overlay className="ui-overlay" />
        <Content className="ui-modal-content ui-modal--framed">
          <ModalSurface>
            <Title style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 600, color: "var(--text-primary)" }}>
              {title}
            </Title>
            {description ? (
              <Description style={{ marginTop: "var(--space-2)", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                {description}
              </Description>
            ) : null}
            <div className="flex flex-wrap justify-end gap-2" style={{ marginTop: "var(--space-6)" }}>
              <Cancel className="btn btn-secondary">
                {cancelLabel}
              </Cancel>
              <Action
                className={variant === "danger" ? "btn btn-danger" : "btn btn-blue"}
                onClick={() => { void Promise.resolve(onConfirm()); }}
              >
                {confirmLabel}
              </Action>
            </div>
          </ModalSurface>
        </Content>
      </Portal>
    </Root>
  );
}
