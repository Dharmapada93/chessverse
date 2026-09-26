"use client";

import React from "react";
import type { GameAnalysis } from "@/types/ai";
import { BookOpen, HelpCircle } from "lucide-react";

interface GameSummaryCardProps {
  analysis: GameAnalysis;
  whitePlayerName?: string;
  blackPlayerName?: string;
}

export default function GameSummaryCard({
  analysis,
  whitePlayerName = "White",
  blackPlayerName = "Black",
}: GameSummaryCardProps) {
  const isUnclassified =
    !analysis.opening ||
    analysis.opening.name === "Unclassified" ||
    analysis.opening.confidence === 0;

  return (
    <div className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-5 sm:p-6 shadow-[0_10px_35px_rgba(35,40,30,0.06)] space-y-5">
      {/* Opening Detection */}
      <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen size={15} className="text-[#B58A3A]" />
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#69736C] dark:text-[#B5BDB5]">
            Opening
          </span>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-2.5 py-1 text-xs font-semibold text-[#18352B] dark:text-[#F4EFE3]">
            {isUnclassified ? "Unclassified" : analysis.opening.name}
            {analysis.opening.eco && (
              <span className="font-mono text-[10px] text-[#B58A3A]">
                ({analysis.opening.eco})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Accuracy Scores with Disclaimer */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold tracking-wide text-[#18352B] dark:text-[#F4EFE3]">
            Game Accuracy
          </span>
          <div className="flex items-center gap-1 text-[10px] text-[#69736C] dark:text-[#B5BDB5]" title={analysis.accuracyMetricDisclaimer}>
            <HelpCircle size={11} />
            <span>ChessVerse Metric</span>
          </div>
        </div>

        <div className="space-y-3">
          {/* White Accuracy */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#18221E] dark:text-[#F4EFE3]/80 font-medium">
                {whitePlayerName} (White)
              </span>
              <span className="font-mono font-bold text-[#B58A3A]">
                {analysis.whiteAccuracy.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(24,34,30,0.08)] dark:bg-white/10">
              <div
                className="h-full rounded-full bg-[#B58A3A] transition-all duration-700"
                style={{ width: `${Math.min(100, analysis.whiteAccuracy)}%` }}
              />
            </div>
          </div>

          {/* Black Accuracy */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#18221E] dark:text-[#F4EFE3]/80 font-medium">
                {blackPlayerName} (Black)
              </span>
              <span className="font-mono font-bold text-[#18352B] dark:text-[#F4EFE3]">
                {analysis.blackAccuracy.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(24,34,30,0.08)] dark:bg-white/10">
              <div
                className="h-full rounded-full bg-[#18352B] dark:bg-[#396E5A] transition-all duration-700"
                style={{ width: `${Math.min(100, analysis.blackAccuracy)}%` }}
              />
            </div>
          </div>
        </div>

        <p className="mt-2 text-[10px] text-[#69736C]/60 dark:text-[#B5BDB5]/60 italic">
          {analysis.accuracyMetricDisclaimer}
        </p>
      </div>

      {/* Narrative Game Summary */}
      <div className="rounded-[14px] border border-[rgba(24,34,30,0.06)] dark:border-white/10 bg-[#F7F4EC]/60 dark:bg-[#1B2A24]/60 p-4 space-y-2">
        <p className="text-[10px] uppercase font-mono tracking-wider text-[#69736C] dark:text-[#B5BDB5]">
          Game Summary
        </p>
        <p className="text-xs sm:text-sm text-[#18221E] dark:text-[#F4EFE3] leading-relaxed">
          {analysis.summary}
        </p>
      </div>
    </div>
  );
}
