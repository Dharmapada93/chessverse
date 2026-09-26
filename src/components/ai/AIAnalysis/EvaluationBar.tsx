"use client";

import React, { useMemo } from "react";
import { calculateEvaluationBarPercentage, formatEvaluationDisplay } from "@/services/ai/evaluation";

interface EvaluationBarProps {
  evaluation: number; // In pawns, e.g. +0.8, -1.4
  mateInMoves?: number | null;
  orientation?: "white" | "black";
  className?: string;
}

export default function EvaluationBar({
  evaluation,
  mateInMoves,
  orientation = "white",
  className = "",
}: EvaluationBarProps) {
  const whitePercent = useMemo(() => {
    return calculateEvaluationBarPercentage(evaluation, mateInMoves);
  }, [evaluation, mateInMoves]);

  const display = useMemo(() => {
    return formatEvaluationDisplay(evaluation, mateInMoves);
  }, [evaluation, mateInMoves]);

  // If orientation is black, flip bar presentation
  const isFlipped = orientation === "black";
  const effectiveWhitePct = isFlipped ? 100 - whitePercent : whitePercent;
  const isWhiteAdvantage = mateInMoves ? mateInMoves > 0 : evaluation >= 0;

  return (
    <div
      className={`relative flex flex-col items-center justify-between w-7 sm:w-8 h-full rounded-full overflow-hidden bg-[#18352B] dark:bg-[#13201B] border border-[rgba(24,34,30,0.12)] dark:border-white/10 select-none shadow-sm ${className}`}
      title={`Engine Evaluation: ${display}`}
      aria-label={`Evaluation: ${display}`}
    >
      {/* Black's portion of evaluation bar (Deep Forest) */}
      <div
        className="w-full bg-[#18352B] dark:bg-[#13201B] transition-all duration-300 ease-out flex items-start justify-center pt-2"
        style={{ height: `${100 - effectiveWhitePct}%` }}
      >
        {!isWhiteAdvantage && (
          <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-tight text-[#FAF8F2] drop-shadow-md">
            {display}
          </span>
        )}
      </div>

      {/* White's portion of evaluation bar (Warm Ivory) */}
      <div
        className="w-full bg-[#FAF8F2] dark:bg-[#23372F] transition-all duration-300 ease-out flex items-end justify-center pb-2"
        style={{ height: `${effectiveWhitePct}%` }}
      >
        {isWhiteAdvantage && (
          <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-tight text-[#18352B] dark:text-[#F4EFE3] drop-shadow-xs">
            {display}
          </span>
        )}
      </div>
    </div>
  );
}
