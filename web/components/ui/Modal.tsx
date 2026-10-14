"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

// ─── Shared overlay ───────────────────────────────────────────────────────────
function Overlay({ onClick }: { onClick?: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-navy/40 backdrop-blur-[2px] z-50 animate-fade-in"
      aria-hidden="true"
      onClick={onClick}
    />
  );
}

// =============================================================================
// MODAL (desktop-style centred dialog)
// =============================================================================
interface ModalProps {
  open:       boolean;
  onClose:    () => void;
  title?:     string;
  children:   ReactNode;
  footer?:    ReactNode;
  size?:      "sm" | "md" | "lg" | "xl";
  className?: string;
}

const MODAL_SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size      = "md",
  className,
}: ModalProps) {
  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <Overlay onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          className={cn(
            "relative w-full bg-white rounded-2xl shadow-modal",
            "pointer-events-auto animate-slide-down",
            "flex flex-col max-h-[90dvh]",
            MODAL_SIZES[size],
            className
          )}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-navy-50 flex-shrink-0">
              <h2 id="modal-title" className="text-lg font-heading font-semibold text-navy">
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-navy-300 hover:bg-navy-50 hover:text-navy transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-navy-50 flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// =============================================================================
// BOTTOM SHEET (mobile-style slide-up sheet)
// =============================================================================
interface BottomSheetProps {
  open:       boolean;
  onClose:    () => void;
  title?:     string;
  children:   ReactNode;
  footer?:    ReactNode;
  snapPoints?: "auto" | "half" | "full";
  className?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
  snapPoints = "auto",
  className,
}: BottomSheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else       document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const heightClass =
    snapPoints === "full" ? "h-[95dvh]" :
    snapPoints === "half" ? "h-[50dvh]" :
    "max-h-[92dvh]";

  return (
    <>
      <Overlay onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "sheet-title" : undefined}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-white rounded-t-3xl shadow-modal",
          "flex flex-col animate-slide-up",
          heightClass,
          className
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-navy-100" aria-hidden="true" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 pt-2 pb-4 flex-shrink-0">
            <h2 id="sheet-title" className="text-base font-heading font-semibold text-navy">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-navy-300 hover:bg-navy-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-navy-50 flex-shrink-0 flex gap-2">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

// =============================================================================
// CONFIRM DIALOG (convenience wrapper)
// =============================================================================
interface ConfirmDialogProps {
  open:         boolean;
  onClose:      () => void;
  onConfirm:    () => void;
  title?:       string;
  message:      string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  loading?:     boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title         = "Confirm",
  message,
  confirmLabel  = "Confirm",
  confirmVariant = "primary",
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant={confirmVariant} size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-navy-400">{message}</p>
    </Modal>
  );
}
