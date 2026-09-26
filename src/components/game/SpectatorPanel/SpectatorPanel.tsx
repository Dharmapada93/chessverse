"use client";

import React from "react";
import { Eye, ShieldAlert } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { SpectatorPanelProps } from "./types";

export default function SpectatorPanel({
  count = 0,
  spectators = [],
  isSpectator = false,
  className = "",
}: SpectatorPanelProps) {
  return (
    <div className={`flex flex-col gap-3 p-4 rounded-[14px] border border-[rgba(24,34,30,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] dark:border-[rgba(255,255,255,0.08)] shadow-xs ${className}`}>
      {/* Header with Viewer Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#18221E] dark:text-[#F4EFE3]">
          <Eye size={15} className="text-[#B58A3A] dark:text-[#D3AA58]" />
          <span>Spectators</span>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EDE9DE] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] px-2.5 py-0.5 text-xs font-mono text-[#18221E] dark:text-[#F4EFE3]">
          <span className="font-bold text-[#B58A3A] dark:text-[#D3AA58]">{count}</span>
          <span className="text-[10px] text-[#69736C] dark:text-[#B5BDB5]">watching</span>
        </div>
      </div>

      {/* Spectator Role Banner */}
      {isSpectator && (
        <div className="flex items-center gap-2 rounded-[10px] bg-[#F7F4EC] dark:bg-[#1B2A24] border border-[#B58A3A]/30 px-3 py-2 text-xs text-[#18352B] dark:text-[#F4EFE3]">
          <ShieldAlert size={15} className="shrink-0 text-[#B58A3A] dark:text-[#D3AA58]" />
          <span>You are watching in spectator mode. Controls are view-only.</span>
        </div>
      )}

      {/* Spectators List */}
      {spectators.length > 0 ? (
        <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
          {spectators.map((spec) => (
            <div
              key={spec.id}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-[#F7F4EC] dark:hover:bg-[#1B2A24] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Avatar name={spec.name} size="sm" />
                <span className="truncate text-xs font-medium text-[#18221E] dark:text-[#F4EFE3]">
                  {spec.name}
                </span>
              </div>
              {spec.rating && (
                <span className="text-[10px] font-mono text-[#69736C] dark:text-[#B5BDB5]">
                  {spec.rating}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-xs text-[#69736C]/70 dark:text-[#B5BDB5]/70">
          No other spectators right now.
        </div>
      )}
    </div>
  );
}
