"use client";

import React, { useState } from "react";
import type { ExplanationLevel, PositionAnalysis } from "@/types/ai";
import { generateMoveExplanation } from "@/services/ai/explanation";

interface MoveExplanationCardProps {
  position: PositionAnalysis;
  onSelectAlternative?: (san: string) => void;
}

export default function MoveExplanationCard({
  position,
  onSelectAlternative,
}: MoveExplanationCardProps) {
  const [level, setLevel] = useState<ExplanationLevel>("intermediate");

  const explanation = generateMoveExplanation({
    playedMove: position.playedMove,
    bestMove: position.bestMoveSan || position.bestMove,
    alternativeMove: position.alternativeMoveSan || position.alternativeMove,
    evaluationBefore: position.evaluationBefore,
    evaluationAfter: position.evaluationAfter,
    classification: position.classification,
    level,
    tacticalMotif: position.tacticalMotif,
  });

  const bestMove = position.bestMoveSan || position.bestMove;
  const altMove = position.alternativeMoveSan || position.alternativeMove;

  return (
    <div className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-5 sm:p-6 shadow-[0_10px_35px_rgba(35,40,30,0.06)] space-y-4">
      {/* Header with Explanation Level Switcher */}
      <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-white/10 pb-3">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#69736C] dark:text-[#B5BDB5]">
            Engine & AI Explanation
          </span>
          <h3 className="text-base font-serif font-bold text-[#18352B] dark:text-[#F4EFE3] tracking-tight">
            Move {Math.ceil(position.moveNumber / 2)}{position.color === "white" ? "." : "..."} {position.playedMove}
          </h3>
        </div>

        {/* Explanation Level switch: Beginner / Intermediate / Advanced */}
        <div className="flex rounded-[12px] bg-[#F7F4EC] dark:bg-[#1B2A24] p-0.5 border border-[rgba(24,34,30,0.08)] dark:border-white/10 text-[11px]">
          {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`rounded-[10px] px-2.5 py-1 capitalize transition cursor-pointer ${
                level === lvl
                  ? "bg-[#18352B] dark:bg-[#285443] font-semibold text-[#FBF9F3] shadow-xs"
                  : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18352B] dark:hover:text-[#F4EFE3]"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Best Move & Alternative section */}
      <div className="grid grid-cols-2 gap-3">
        {/* Best Move */}
        <div className="rounded-[14px] border border-[#27815D]/25 bg-[#27815D]/[0.06] p-3.5">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#27815D] font-bold">
            Best move
          </p>
          <p className="mt-1 text-xl font-bold font-mono text-[#27815D]">
            {bestMove}
          </p>
          <p className="mt-0.5 text-[10px] text-[#27815D]/75">
            Engine verified choice
          </p>
        </div>

        {/* Alternative move */}
        <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] p-3.5">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5]">
            Alternative
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-xl font-bold font-mono text-[#B58A3A]">
              {altMove || "—"}
            </p>
            {altMove && onSelectAlternative && (
              <button
                onClick={() => onSelectAlternative(altMove)}
                className="text-[10px] text-[#B58A3A] hover:underline font-semibold cursor-pointer"
              >
                Inspect
              </button>
            )}
          </div>
          <p className="mt-0.5 text-[10px] text-[#69736C] dark:text-[#B5BDB5]">
            Playable candidate
          </p>
        </div>
      </div>

      {/* Why? Explanation grounded in position */}
      <div className="rounded-[14px] border border-[rgba(24,34,30,0.06)] dark:border-white/10 bg-[#F7F4EC]/60 dark:bg-[#1B2A24]/60 p-4">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold text-[#18352B] dark:text-[#F4EFE3]">
            Why is this {position.classification === "best" ? "strong" : "significant"}?
          </p>
          <span className="text-[10px] font-mono text-[#69736C] dark:text-[#B5BDB5]">
            Level: {level}
          </span>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-[#18221E] dark:text-[#F4EFE3]">
          {explanation}
        </p>

        {/* Usage transparency note */}
        <div className="mt-3 pt-2.5 border-t border-[rgba(24,34,30,0.06)] dark:border-white/10 flex items-center justify-between text-[10px] text-[#69736C] dark:text-[#B5BDB5]">
          <span>Engine eval: <strong className="font-mono text-[#18352B] dark:text-[#F4EFE3]">{position.evalDisplay}</strong></span>
          <span className="text-[9px] uppercase tracking-wider text-[#69736C]/60 dark:text-[#B5BDB5]/60 font-mono">Stockfish 18 + AI</span>
        </div>
      </div>
    </div>
  );
}
