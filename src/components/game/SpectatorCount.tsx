import React from "react";
import { Eye } from "lucide-react";

export interface SpectatorCountProps {
  count: number;
  className?: string;
}

export default function SpectatorCount({ count, className = "" }: SpectatorCountProps) {
  if (count <= 0) return null;

  return (
    <div
      title={`${count} spectator${count === 1 ? "" : "s"} watching`}
      className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)] font-mono ${className}`}
    >
      <Eye size={13} className="text-[var(--color-primary)] shrink-0" />
      <span>{count}</span>
      <span className="hidden sm:inline text-[10px] text-[var(--color-text-muted)] font-sans">
        watching
      </span>
    </div>
  );
}
