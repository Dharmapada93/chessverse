import React from "react";

export interface DividerProps {
  className?: string;
  label?: string;
}

export default function Divider({ className = "", label }: DividerProps) {
  if (label) {
    return (
      <div className={`relative my-4 flex items-center ${className}`}>
        <div className="flex-grow border-t border-[var(--color-border)]" />
        <span className="mx-3 shrink-0 text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          {label}
        </span>
        <div className="flex-grow border-t border-[var(--color-border)]" />
      </div>
    );
  }

  return (
    <hr
      className={`my-3 border-0 border-t border-[var(--color-border)] ${className}`}
    />
  );
}
