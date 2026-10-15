"use client";

import {
  createContext, useContext, useState, useCallback,
  type ReactNode,
} from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id:       string;
  type:     ToastType;
  title:    string;
  message?: string;
}

interface ToastCtxValue {
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastCtx = createContext<ToastCtxValue>({
  toast:   () => {},
  success: () => {},
  error:   () => {},
  warning: () => {},
  info:    () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const success = useCallback((title: string, msg?: string) => toast("success", title, msg), [toast]);
  const error   = useCallback((title: string, msg?: string) => toast("error",   title, msg), [toast]);
  const warning = useCallback((title: string, msg?: string) => toast("warning", title, msg), [toast]);
  const info    = useCallback((title: string, msg?: string) => toast("info",    title, msg), [toast]);

  return (
    <ToastCtx.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className={cn(
          "fixed z-90 flex flex-col gap-2 pointer-events-none",
          // Mobile: bottom centre; Desktop: top-right
          "bottom-20 start-4 end-4 md:bottom-auto md:top-4 md:start-auto md:end-4 md:w-80"
        )}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}

// ─── Toast Item ───────────────────────────────────────────────────────────────
const TOAST_STYLES: Record<ToastType, { bg: string; icon: ReactNode }> = {
  success: {
    bg:   "bg-white border-success",
    icon: <CheckCircle  className="w-5 h-5 text-success flex-shrink-0" />,
  },
  error: {
    bg:   "bg-white border-danger",
    icon: <AlertCircle  className="w-5 h-5 text-danger flex-shrink-0" />,
  },
  warning: {
    bg:   "bg-white border-warning",
    icon: <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />,
  },
  info: {
    bg:   "bg-white border-info",
    icon: <Info          className="w-5 h-5 text-info flex-shrink-0" />,
  },
};

function ToastItem({
  item,
  onDismiss,
}: {
  item:      ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { bg, icon } = TOAST_STYLES[item.type];

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto flex items-start gap-3 px-4 py-3",
        "rounded-xl border-l-4 shadow-modal bg-white animate-slide-up",
        bg
      )}
    >
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-navy leading-tight">{item.title}</p>
        {item.message && (
          <p className="text-xs text-navy-400 mt-0.5">{item.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(item.id)}
        aria-label={t("common.dismiss")}
        className="w-6 h-6 flex items-center justify-center rounded text-navy-300 hover:text-navy hover:bg-navy-50 transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
