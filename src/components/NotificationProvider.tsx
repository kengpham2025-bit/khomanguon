"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationOptions {
  title: string;
  message?: string;
  duration?: number;
}

export interface Notification extends NotificationOptions {
  id: string;
  type: NotificationType;
}

interface NotificationContextValue {
  notify: (type: NotificationType, options: NotificationOptions) => void;
  success: (options: NotificationOptions) => void;
  error: (options: NotificationOptions) => void;
  warning: (options: NotificationOptions) => void;
  info: (options: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ─── Icons Map ────────────────────────────────────────────────────────────────

const icons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles: Record<
  NotificationType,
  { container: string; icon: string; progress: string }
> = {
  success: {
    container: "bg-white border border-green-200",
    icon: "text-green-500",
    progress: "bg-green-500",
  },
  error: {
    container: "bg-white border border-red-200",
    icon: "text-red-500",
    progress: "bg-red-500",
  },
  warning: {
    container: "bg-white border border-amber-200",
    icon: "text-amber-500",
    progress: "bg-amber-500",
  },
  info: {
    container: "bg-white border border-blue-200",
    icon: "text-blue-500",
    progress: "bg-blue-500",
  },
};

// ─── Single Toast Item ────────────────────────────────────────────────────────

function ToastItem({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
}) {
  const Icon = icons[notification.type];
  const style = styles[notification.type];
  const duration = notification.duration ?? 4000;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onDismiss(notification.id), duration);
    return () => clearTimeout(timer);
  }, [notification.id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "relative flex w-80 flex-col overflow-hidden rounded-2xl shadow-soft-xl",
        style.container
      )}
    >
      {/* Progress bar */}
      {duration > 0 && (
        <div
          className={cn("absolute bottom-0 left-0 h-0.5", style.progress)}
          style={{
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      )}

      <div className="flex items-start gap-3 p-4">
        <Icon className={cn("mt-0.5 h-5 w-5 flex-shrink-0", style.icon)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
          {notification.message && (
            <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
              {notification.message}
            </p>
          )}
        </div>
        <button
          onClick={() => onDismiss(notification.id)}
          className="flex-shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (type: NotificationType, options: NotificationOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setNotifications((prev) => [...prev, { ...options, id, type }]);
    },
    []
  );

  const ctx: NotificationContextValue = {
    notify,
    success: (o) => notify("success", o),
    error: (o) => notify("error", o),
    warning: (o) => notify("warning", o),
    info: (o) => notify("info", o),
  };

  return (
    <NotificationContext.Provider value={ctx}>
      {children}

      {/* Global keyframes for progress bar */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      {/* Toast Container */}
      {mounted && (
        <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2 pointer-events-none">
          <AnimatePresence mode="popLayout">
            {notifications.map((n) => (
              <ToastItem
                key={n.id}
                notification={n}
                onDismiss={dismiss}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return ctx;
}
