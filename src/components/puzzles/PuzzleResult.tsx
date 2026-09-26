"use client";

import { Sparkles, Trophy, ArrowRight, Tag } from "lucide-react";

interface PuzzleResultProps {
  rating: number;
  xpEarned: number;
  themes?: string[];
  onNext?: () => void;
}

export default function PuzzleResult({
  rating,
  xpEarned,
  themes = ["tactics"],
  onNext,
}: PuzzleResultProps) {
  return (
    <div className="w-full rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-5 text-left shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400">
          <Trophy size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">
            Puzzle Solved
          </span>
        </div>

        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-400">
          +{xpEarned} XP
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-white/60">
        <span>
          Rating: <strong className="font-mono text-white">{rating}</strong>
        </span>
        <span>·</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag size={12} className="text-[#d7b875]" />
          {themes.map((t) => (
            <span
              key={t}
              className="rounded bg-white/[0.05] px-1.5 py-0.2 text-[10px] text-white/70 capitalize"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {onNext && (
        <div className="mt-4 border-t border-white/5 pt-3">
          <button
            onClick={onNext}
            className="flex items-center gap-2 text-xs font-bold text-[#d7b875] hover:underline"
          >
            <span>Continue Training</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
