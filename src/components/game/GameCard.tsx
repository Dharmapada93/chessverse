import React from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { Eye } from "lucide-react";

export interface GameCardPlayer {
  id?: string;
  name: string;
  rating: number;
}

export interface GameCardProps {
  gameId: string;
  whitePlayer: GameCardPlayer;
  blackPlayer: GameCardPlayer;
  timeControl?: string;
  spectatorCount?: number;
  isLive?: boolean;
  statusText?: string;
  className?: string;
}

export default function GameCard({
  gameId,
  whitePlayer,
  blackPlayer,
  timeControl = "10 min",
  spectatorCount = 0,
  isLive = true,
  statusText,
  className = "",
}: GameCardProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs transition-all duration-120 hover:border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)] ${className}`}
    >
      {/* Top Meta: LIVE Badge + Spectator Count + Time Control */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLive ? (
            <Badge variant="live">LIVE</Badge>
          ) : (
            <Badge variant="neutral">{statusText || "COMPLETED"}</Badge>
          )}
          <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
            {timeControl}
          </span>
        </div>

        {spectatorCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] font-mono">
            <Eye size={13} className="text-[var(--color-primary)]" />
            <span>{spectatorCount}</span>
          </div>
        )}
      </div>

      {/* Players Lineup */}
      <div className="my-5 flex items-center justify-between gap-4">
        {/* White Player */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Avatar name={whitePlayer.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-xs sm:text-sm font-semibold text-[var(--color-text)]">
              {whitePlayer.name}
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)] font-mono">
              {whitePlayer.rating}
            </p>
          </div>
        </div>

        {/* VS Divider */}
        <div className="shrink-0 text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
          VS
        </div>

        {/* Black Player */}
        <div className="flex items-center justify-end gap-2.5 min-w-0 flex-1 text-right">
          <div className="min-w-0">
            <p className="truncate text-xs sm:text-sm font-semibold text-[var(--color-text)]">
              {blackPlayer.name}
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)] font-mono">
              {blackPlayer.rating}
            </p>
          </div>
          <Avatar name={blackPlayer.name} size="sm" />
        </div>
      </div>

      {/* Watch Action */}
      <Link href={`/watch/${gameId}`} className="block w-full">
        <Button variant="secondary" size="sm" className="w-full justify-center">
          Watch Game
        </Button>
      </Link>
    </div>
  );
}
