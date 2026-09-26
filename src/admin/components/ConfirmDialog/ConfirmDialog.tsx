"use client";

import React, { useState } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  requiredTypedConfirmation?: string; // e.g. "BAN" or "DELETE"
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDangerous = false,
  requiredTypedConfirmation,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const [typedInput, setTypedInput] = useState("");

  if (!isOpen) return null;

  const canConfirm = requiredTypedConfirmation
    ? typedInput.trim().toUpperCase() === requiredTypedConfirmation.toUpperCase()
    : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--color-text)] flex items-center gap-2">
            {isDangerous && <span className="text-red-400">⚠️</span>}
            {title}
          </h3>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] text-sm"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs md:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {message}
          </p>

          {requiredTypedConfirmation && (
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-medium text-[var(--color-text)]">
                Type <span className="font-bold text-red-400 select-all">{requiredTypedConfirmation}</span> to confirm:
              </label>
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder={requiredTypedConfirmation}
                className="w-full px-3 py-2 text-xs rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:border-red-500"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-3.5 py-1.5 text-xs font-medium rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm || isLoading}
            className={`px-4 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] text-white shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDangerous
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)]"
            }`}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
