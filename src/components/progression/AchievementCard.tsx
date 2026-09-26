"use client";

import { Check, Lock } from "lucide-react";

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category?: string;
  xpReward: number;
  unlocked?: boolean;
  unlockedAt?: string | Date | null;
}

interface AchievementCardProps {
  achievement: AchievementItem;
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const isUnlocked = !!achievement.unlocked;

  return (
    <div
      className={`relative flex items-start gap-3.5 rounded-2xl border p-4 transition-all duration-200 ${
        isUnlocked
          ? "border-[#d7b875]/30 bg-[#141411] shadow-md hover:border-[#d7b875]/50"
          : "border-white/5 bg-white/[0.015] opacity-50 hover:opacity-75"
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-serif ${
          isUnlocked
            ? "bg-[#d7b875]/15 text-[#d7b875] border border-[#d7b875]/30 shadow-inner"
            : "bg-white/[0.04] text-white/30 border border-white/5"
        }`}
      >
        {achievement.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4
            className={`text-xs font-bold truncate ${
              isUnlocked ? "text-white" : "text-white/60"
            }`}
          >
            {achievement.title}
          </h4>

          <span
            className={`font-mono text-[10px] font-semibold shrink-0 ${
              isUnlocked ? "text-emerald-400" : "text-white/30"
            }`}
          >
            +{achievement.xpReward} XP
          </span>
        </div>

        <p className="mt-0.5 text-[11px] text-white/45 line-clamp-2 leading-relaxed">
          {achievement.description}
        </p>

        <div className="mt-2 flex items-center gap-1.5 text-[10px]">
          {isUnlocked ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <Check size={11} />
              <span>Unlocked</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-white/30">
              <Lock size={10} />
              <span>Locked</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
