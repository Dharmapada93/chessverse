import React from "react";
import Link from "next/link";
import Avatar, { PlayerStatus } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { Swords } from "lucide-react";

export interface PlayerCardProps {
  id?: string;
  name: string;
  rating: number;
  status?: PlayerStatus;
  winRate?: number;
  onChallenge?: () => void;
  className?: string;
}

export default function PlayerCard({
  id,
  name,
  rating,
  status = "online",
  winRate,
  onChallenge,
  className = "",
}: PlayerCardProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs hover:border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)] transition ${className}`}
    >
      <Link
        href={`/profile/${name}`}
        className="flex items-center gap-3.5 min-w-0 flex-1 hover:opacity-90 transition"
      >
        <Avatar name={name} size="md" status={status} />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--color-text)]">
            {name}
          </p>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-mono">
            <span>Rating {rating}</span>
            {winRate !== undefined && (
              <span className="text-emerald-400">
                {winRate}% win
              </span>
            )}
          </div>
        </div>
      </Link>

      {onChallenge && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onChallenge}
          className="ml-3 shrink-0 gap-1.5"
        >
          <Swords size={13} className="text-[var(--color-primary)]" />
          <span>Challenge</span>
        </Button>
      )}
    </div>
  );
}
