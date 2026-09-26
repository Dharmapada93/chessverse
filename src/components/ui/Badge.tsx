import React from "react";

export type BadgeVariant =
  | "live"
  | "online"
  | "offline"
  | "draw"
  | "win"
  | "loss"
  | "admin"
  | "ai"
  | "spectator"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children?: React.ReactNode;
}

const variantConfig: Record<BadgeVariant, { style: string; defaultText: string; dot?: boolean }> = {
  live: {
    style: "bg-red-500/15 text-red-400 border border-red-500/30",
    defaultText: "LIVE",
    dot: true,
  },
  online: {
    style: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    defaultText: "ONLINE",
    dot: true,
  },
  offline: {
    style: "bg-zinc-500/15 text-[var(--color-text-muted)] border border-zinc-500/20",
    defaultText: "OFFLINE",
  },
  win: {
    style: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold",
    defaultText: "WIN",
  },
  draw: {
    style: "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold",
    defaultText: "DRAW",
  },
  loss: {
    style: "bg-red-500/15 text-red-400 border border-red-500/30 font-bold",
    defaultText: "LOSS",
  },
  admin: {
    style: "bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold",
    defaultText: "ADMIN",
  },
  ai: {
    style: "bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold",
    defaultText: "AI",
  },
  spectator: {
    style: "bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary)]/30",
    defaultText: "SPECTATOR",
  },
  neutral: {
    style: "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border)]",
    defaultText: "",
  },
};

export default function Badge({
  variant = "neutral",
  children,
  className = "",
  ...props
}: BadgeProps) {
  const config = variantConfig[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase select-none ${config.style} ${className}`}
      {...props}
    >
      {config.dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            variant === "live" ? "bg-red-400 animate-ping" : "bg-emerald-400"
          }`}
          aria-hidden="true"
        />
      )}
      {children || config.defaultText}
    </span>
  );
}
