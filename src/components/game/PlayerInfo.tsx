import React from "react";
import Avatar, { PlayerStatus } from "@/components/ui/Avatar";

export interface PlayerInfoProps {
  name: string;
  rating: number;
  title?: string;
  status?: PlayerStatus;
  capturedAdvantage?: number;
  materialScore?: string;
  isActiveTurn?: boolean;
  className?: string;
}

export default function PlayerInfo({
  name,
  rating,
  title,
  status = "online",
  capturedAdvantage,
  materialScore,
  isActiveTurn = false,
  className = "",
}: PlayerInfoProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-[var(--radius-md)] p-2.5 transition-all ${
        isActiveTurn
          ? "bg-[var(--color-surface-elevated)] border border-[var(--color-primary)]/40 shadow-xs"
          : "bg-transparent border border-transparent"
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={name} size="game" status={status} />

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {title && (
              <span className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-1 py-0.2 text-[9px] font-bold text-black uppercase">
                {title}
              </span>
            )}
            <span className="truncate text-xs sm:text-sm font-semibold text-[var(--color-text)]">
              {name}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] font-mono">
            <span>{rating}</span>
            {capturedAdvantage && capturedAdvantage > 0 ? (
              <span className="text-[var(--color-primary)] font-semibold">
                +{capturedAdvantage}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {materialScore && (
        <span className="text-xs font-mono text-[var(--color-text-secondary)]">
          {materialScore}
        </span>
      )}
    </div>
  );
}
