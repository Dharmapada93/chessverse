"use client";

import React from "react";
import Badge, { BadgeVariant } from "@/components/ui/Badge";
import { GameStatusType, GameStatusProps } from "./types";

const statusConfig: Record<GameStatusType, { variant: BadgeVariant; label: string }> = {
  live: { variant: "live", label: "LIVE" },
  waiting: { variant: "neutral", label: "WAITING" },
  completed: { variant: "neutral", label: "GAME OVER" },
  draw: { variant: "draw", label: "DRAW" },
  checkmate: { variant: "win", label: "CHECKMATE" },
  resigned: { variant: "loss", label: "RESIGNED" },
  timeout: { variant: "loss", label: "TIME OUT" },
  stalemate: { variant: "draw", label: "STALEMATE" },
  abandoned: { variant: "offline", label: "ABANDONED" },
};

export default function GameStatus({ status, className = "" }: GameStatusProps) {
  const current = statusConfig[status] || statusConfig.live;

  return (
    <Badge variant={current.variant} className={className}>
      {current.label}
    </Badge>
  );
}
