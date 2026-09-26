"use client";

import React from "react";
import type { CriticalMoment } from "@/types/ai";
import { Zap, ChevronRight } from "lucide-react";

interface CriticalMomentsListProps {
  moments: CriticalMoment[];
  currentMoveNumber?: number;
  onSelectMoment: (moveNumber: number) => void;
}

export default function CriticalMomentsList({
  moments,
  currentMoveNumber,
  onSelectMoment,
}: CriticalMomentsListProps) {
  if (!moments || moments.length === 0) {
    return (
      <div className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-5 text-center text-xs text-[#69736C] dark:text-[#B5BDB5]">
        No major critical blunders or decisive tactical opportunities detected in this game.
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-5 sm:p-6 shadow-[0_10px_35px_rgba(35,40,30,0.06)] space-y-4">
      <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Zap size={15} className="text-[#B58A3A]" />
          <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-[#18352B] dark:text-[#F4EFE3]">
            Critical Moments
          </h4>
        </div>
        <span className="text-[10px] font-mono text-[#69736C] dark:text-[#B5BDB5]">
          {moments.length} moments identified
        </span>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {moments.map((km, idx) => {
          const isSelected = currentMoveNumber === km.moveNumber;
          const isBlunder = km.classification === "blunder";
          const isMistake = km.classification === "mistake";
          const isBrilliant = km.classification === "brilliant";

          let badgeColor = "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
          if (isBlunder) {
            badgeColor = "border-[#A94B45]/30 bg-[#A94B45]/10 text-[#A94B45]";
          } else if (isMistake) {
            badgeColor = "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300";
          } else if (isBrilliant) {
            badgeColor = "border-[#27815D]/30 bg-[#27815D]/10 text-[#27815D]";
          }

          return (
            <div
              key={idx}
              onClick={() => onSelectMoment(km.moveNumber)}
              className={`flex items-center justify-between rounded-[14px] border p-3 cursor-pointer transition ${
                isSelected
                  ? "border-[#B58A3A] bg-[#B58A3A]/10 shadow-xs"
                  : "border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] hover:border-[#B58A3A]/50 hover:bg-[#FAF8F2] dark:hover:bg-[#23372F]"
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3]">
                    Move {Math.ceil(km.moveNumber / 2)}
                  </span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[9px] uppercase font-mono font-semibold border ${badgeColor}`}
                  >
                    {km.classification.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-[#69736C] dark:text-[#B5BDB5]">
                  {km.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 text-[#69736C] dark:text-[#B5BDB5]">
                <span className="text-[11px] font-mono text-[#27815D] font-bold">
                  {km.bestMove}
                </span>
                <ChevronRight size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
