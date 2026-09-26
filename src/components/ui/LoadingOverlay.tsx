import React from "react";

export interface LoadingOverlayProps {
  isLoading: boolean;
  label?: string;
  sublabel?: string;
}

export default function LoadingOverlay({
  isLoading,
  label = "Connecting to game...",
  sublabel,
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18352B]/40 dark:bg-[#0E1713]/70 backdrop-blur-[2px] animate-in fade-in duration-120"
    >
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-6 py-5 shadow-modal">
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
          <span className="text-sm font-semibold text-[var(--color-text)]">
            {label}
          </span>
        </div>
        {sublabel && (
          <p className="text-xs text-[var(--color-text-secondary)]">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}
