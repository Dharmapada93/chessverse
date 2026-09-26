"use client";

import React from "react";
import type { OnlineStatusProps } from "./types";

function formatRelativeTime(date?: string | Date): string {
  if (!date) return "Recently";
  const then = new Date(date).getTime();
  if (isNaN(then)) return "Recently";
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

export function OnlineStatus({
  presence,
  opponentName,
  lastSeen,
  size = "md",
  showText = true,
}: OnlineStatusProps) {
  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  if (presence === "playing") {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs font-medium">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        {showText && (
          <span className="text-amber-400">
            Playing{opponentName ? ` vs ${opponentName}` : ""}
          </span>
        )}
      </div>
    );
  }

  if (presence === "online") {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs font-medium">
        <span className={`rounded-full bg-emerald-500 ${dotSizes[size]} ring-2 ring-emerald-500/20`} />
        {showText && <span className="text-emerald-400">Online</span>}
      </div>
    );
  }

  if (presence === "away") {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs font-medium">
        <span className={`rounded-full bg-indigo-400 ${dotSizes[size]}`} />
        {showText && <span className="text-zinc-400">Away</span>}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 text-xs">
      <span className={`rounded-full bg-zinc-600 ${dotSizes[size]}`} />
      {showText && (
        <span className="text-zinc-400">
          Last seen {formatRelativeTime(lastSeen)}
        </span>
      )}
    </div>
  );
}

export default OnlineStatus;
