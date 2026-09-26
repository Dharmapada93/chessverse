"use client";

import React, { useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import { X } from "lucide-react";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export default function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isDangerous = false,
  isLoading = false,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-desc" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18352B]/40 dark:bg-[#0E1713]/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-modal)] p-6 shadow-modal animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3
              id="dialog-title"
              className="text-base sm:text-lg font-semibold text-[var(--color-text)] tracking-tight"
            >
              {title}
            </h3>
            {description && (
              <p
                id="dialog-desc"
                className="mt-1 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed"
              >
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition p-1 rounded cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Custom content */}
        {children && <div className="mt-4">{children}</div>}

        {/* Actions */}
        {(onConfirm || cancelLabel) && (
          <div className="mt-6 flex items-center justify-end gap-2.5">
            {cancelLabel && (
              <Button variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
                {cancelLabel}
              </Button>
            )}
            {onConfirm && (
              <Button
                variant={isDangerous ? "danger" : "primary"}
                size="md"
                onClick={onConfirm}
                isLoading={isLoading}
              >
                {confirmLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
