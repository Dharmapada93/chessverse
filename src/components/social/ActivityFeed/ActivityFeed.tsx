"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Swords, Flame, Sparkles, Clock } from "lucide-react";
import type { ActivityFeedProps } from "./types";

export function ActivityFeed({ activities = [], loading = false }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-14 rounded-[14px] bg-[#FBF9F3]/60 dark:bg-[#21332B]/60 border border-[var(--color-border)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-6 text-center rounded-[14px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[var(--color-border)]">
        <Sparkles className="w-5 h-5 text-[#B58A3A] mx-auto mb-2" />
        <p className="text-xs text-[var(--color-text-secondary)]">No recent friend activity yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {activities.map((act) => (
        <div
          key={act.id}
          className="flex items-center justify-between p-3 rounded-[14px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[var(--color-border)] hover:bg-[#F7F4EC] dark:hover:bg-[#283E34] transition-colors text-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-[8px] bg-[#EDE9DE] dark:bg-[#18352B] text-[#B58A3A] flex-shrink-0">
              {act.type === "game_win" ? (
                <Trophy className="w-3.5 h-3.5 text-[#B58A3A]" />
              ) : act.type === "streak" ? (
                <Flame className="w-3.5 h-3.5 text-[#B58A3A]" />
              ) : (
                <Swords className="w-3.5 h-3.5 text-[#18352B] dark:text-[#D3AA58]" />
              )}
            </div>

            <div className="min-w-0">
              <span className="text-[var(--color-text-secondary)]">
                <Link
                  href={`/player/${encodeURIComponent(act.actorUsername)}`}
                  className="font-semibold text-[var(--color-text)] hover:text-[#B58A3A] transition-colors"
                >
                  {act.actorUsername}
                </Link>{" "}
                {act.description}
                {act.opponentUsername && (
                  <>
                    {" "}
                    against{" "}
                    <Link
                      href={`/player/${encodeURIComponent(act.opponentUsername)}`}
                      className="font-medium text-[var(--color-text)] hover:text-[#B58A3A]"
                    >
                      {act.opponentUsername}
                    </Link>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)] font-mono flex-shrink-0 ml-3">
            <Clock className="w-3 h-3" />
            <span>{act.timeAgo}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityFeed;
