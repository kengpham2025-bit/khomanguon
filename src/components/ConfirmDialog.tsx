"use client";

import { useEffect, useCallback, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle2, HelpCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ConfirmVariant = "danger" | "warning" | "success" | "info";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ConfirmDialogProps {
  options: ConfirmOptions | null;
  onClose: () => void;
}

// ─── Variant Config ──────────────────────────────────────────────────────────

const variantConfig: Record<
  ConfirmVariant,
  { icon: React.ComponentType<{ className?: string }>; iconBg: string; iconColor: string; confirmBtn: string }
> = {
  danger: {
    icon: AlertTriangle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmBtn: "bg-red-600 hover:bg-red-700 focus:ring-red-500/30",
  },
  warning: {
    icon: AlertCircle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    confirmBtn: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/30",
  },
  success: {
    icon: CheckCircle2,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    confirmBtn: "bg-green-600 hover:bg-green-700 focus:ring-green-500/30",
  },
  info: {
    icon: HelpCircle,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    confirmBtn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/30",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

function ConfirmDialog({ options, onClose }: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleConfirm = useCallback(() => {
    options?.onConfirm?.();
    onClose();
  }, [options, onClose]);

  const handleCancel = useCallback(() => {
    options?.onCancel?.();
    onClose();
  }, [options, onClose]);

  useEffect(() => {
    if (!options) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [options, handleCancel]);

  if (!options) return null;

  const {
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "info",
  } = options;

  const cfg = variantConfig[variant];
  const Icon = cfg.icon;

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === overlayRef.current) handleCancel();
        }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-soft-xl"
        >
          {/* Header */}
          <div className="relative flex items-center justify-between p-5 pb-0">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", cfg.iconBg)}>
                <Icon className={cn("h-5 w-5", cfg.iconColor)} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            </div>
            <button
              onClick={handleCancel}
              className="flex-shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Description */}
          {description && (
            <div className="px-5 pb-4 pt-1">
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-4">
            <button
              onClick={handleCancel}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-1",
                cfg.confirmBtn
              )}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Confirm Dialog Manager ───────────────────────────────────────────────────

interface DialogState {
  options: ConfirmOptions | null;
}

let dialogResolver: ((value: boolean) => void) | null = null;

const _dialogState: DialogState = { options: null };

function notifyDialogChange() {
  // Trigger re-render via a custom event
  window.dispatchEvent(new CustomEvent("__dialog_update", { detail: _dialogState }));
}

/**
 * Show a confirmation dialog and return a Promise<boolean>.
 * Resolves true if confirmed, false if cancelled.
 */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    dialogResolver = resolve;
    _dialogState.options = { ...options };
    notifyDialogChange();
  });
}

export { ConfirmDialog };
