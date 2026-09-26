"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  durationMs?: number;
}

export interface ToastProps {
  toast: ToastMessage;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  const { type, message, title } = toast;

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />,
    warning: <AlertTriangle size={16} className="text-amber-400 shrink-0" />,
    error: <AlertCircle size={16} className="text-red-400 shrink-0" />,
    info: <Info size={16} className="text-sky-400 shrink-0" />,
  };

  const borderStyles: Record<ToastType, string> = {
    success: "border-emerald-500/20 bg-[var(--color-surface)]",
    warning: "border-amber-500/20 bg-[var(--color-surface)]",
    error: "border-red-500/20 bg-[var(--color-surface)]",
    info: "border-sky-500/20 bg-[var(--color-surface)]",
  };

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 rounded-[var(--radius-md)] border p-3.5 shadow-lg backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${borderStyles[type]}`}
    >
      <div className="mt-0.5">{icons[type]}</div>

      <div className="min-w-0 flex-1">
        {title && (
          <h4 className="text-xs font-semibold text-[var(--color-text)]">
            {title}
          </h4>
        )}
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition p-0.5 rounded cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
}
