import React from "react";

export type AvatarSize = "sm" | "md" | "lg" | "game" | "profile";
export type PlayerStatus = "online" | "away" | "offline" | "in-game";

export interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: AvatarSize;
  status?: PlayerStatus;
  className?: string;
}

const sizeConfig: Record<AvatarSize, { box: string; text: string; dot: string }> = {
  sm: { box: "h-6 w-6 min-w-[24px]", text: "text-[10px]", dot: "h-1.5 w-1.5 ring-1" },
  md: { box: "h-8 w-8 min-w-[32px]", text: "text-xs", dot: "h-2 w-2 ring-2" },
  game: { box: "h-10 w-10 min-w-[40px]", text: "text-sm font-semibold", dot: "h-2.5 w-2.5 ring-2" },
  lg: { box: "h-11 w-11 min-w-[44px]", text: "text-base font-semibold", dot: "h-2.5 w-2.5 ring-2" },
  profile: { box: "h-16 w-16 min-w-[64px]", text: "text-xl font-bold", dot: "h-3.5 w-3.5 ring-2" },
};

const statusColors: Record<PlayerStatus, string> = {
  online: "bg-emerald-400",
  away: "bg-amber-400",
  offline: "bg-[var(--color-text-muted)]",
  "in-game": "bg-[var(--color-primary)] animate-pulse",
};

export default function Avatar({
  name,
  imageUrl,
  size = "md",
  status,
  className = "",
}: AvatarProps) {
  const currentSize = sizeConfig[size];

  // Derive up to 2 initials
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join("")
    : "U";

  return (
    <div className={`relative inline-flex shrink-0 ${currentSize.box} ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full rounded-[var(--radius-md)] object-cover border border-[var(--color-border)]"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text)] font-sans ${currentSize.text}`}
          aria-label={name}
        >
          {initials}
        </div>
      )}

      {status && (
        <span
          title={`Status: ${status}`}
          aria-label={`Status: ${status}`}
          className={`absolute -bottom-0.5 -right-0.5 rounded-full ring-[var(--color-bg)] ${currentSize.dot} ${statusColors[status]}`}
        />
      )}
    </div>
  );
}
