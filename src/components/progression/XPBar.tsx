"use client";

import { Award, Flame } from "lucide-react";

interface XPBarProps {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
  streak?: number;
  className?: string;
}

export default function XPBar({
  level,
  currentXp,
  nextLevelXp,
  progressPercent,
  streak = 7,
  className = "",
}: XPBarProps) {
  return (
    <div className={`rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-5 shadow-[0_8px_30px_rgba(35,30,20,0.04)] ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF6EE] text-[#B88A32] font-extrabold text-xs font-mono border border-[#B88A32]/30 shadow-xs">
            L{level}
          </div>

          <div>
            <span className="text-xs font-semibold text-[#171A18] block">
              Level {level} Progress
            </span>
            <span className="font-mono text-[11px] text-[#68706A]">
              {currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
            </span>
          </div>
        </div>

        {streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 font-mono">
            <Flame size={14} className="fill-amber-500 text-amber-600" />
            <span>{streak} day streak</span>
          </div>
        )}
      </div>

      {/* Progress Track */}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#FAF8F2] border border-[rgba(30,30,20,0.06)]">
        <div
          style={{ width: `${Math.min(100, Math.max(2, progressPercent))}%` }}
          className="h-full rounded-full bg-gradient-to-r from-[#B88A32] via-[#C59A45] to-[#285C4D] transition-all duration-500"
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-[#68706A] font-mono">
        <span>Level {level}</span>
        <span>{progressPercent}% to Level {level + 1}</span>
      </div>
    </div>
  );
}
