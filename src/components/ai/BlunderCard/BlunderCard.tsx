"use client";

import React from "react";
import type { PositionAnalysis } from "@/types/ai";
import { AlertOctagon, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";

interface BlunderCardProps {
  position: PositionAnalysis;
  onJumpToBestMove?: () => void;
}

export default function BlunderCard({
  position,
  onJumpToBestMove,
}: BlunderCardProps) {
  const isBlunder = position.classification === "blunder";
  const isMistake = position.classification === "mistake";
  const isBrilliant = position.classification === "brilliant";

  let title = "Significant Inaccuracy";
  let icon = <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />;
  let badgeColor = "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";

  if (isBlunder) {
    title = "Blunder Alert";
    icon = <AlertOctagon size={16} className="text-[#A94B45]" />;
    badgeColor = "border-[#A94B45]/30 bg-[#A94B45]/10 text-[#A94B45]";
  } else if (isMistake) {
    title = "Tactical Mistake";
    icon = <AlertTriangle size={16} className="text-orange-600 dark:text-orange-400" />;
    badgeColor = "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300";
  } else if (isBrilliant) {
    title = "Brilliant Move";
    icon = <Sparkles size={16} className="text-[#27815D]" />;
    badgeColor = "border-[#27815D]/30 bg-[#27815D]/10 text-[#27815D]";
  }

  const evalBeforeStr =
    position.evaluationBefore > 0
      ? `+${position.evaluationBefore.toFixed(1)}`
      : position.evaluationBefore.toFixed(1);
  const evalAfterStr =
    position.evaluationAfter > 0
      ? `+${position.evaluationAfter.toFixed(1)}`
      : position.evaluationAfter.toFixed(1);

  const moveLabel = `${Math.ceil(position.moveNumber / 2)}${
    position.color === "white" ? "." : "..."
  } ${position.playedMove}`;

  return (
    <div
      className={`rounded-[20px] border p-5 shadow-[0_10px_35px_rgba(35,40,30,0.06)] space-y-3 transition ${
        isBlunder
          ? "border-[#A94B45]/30 bg-[#A94B45]/[0.05]"
          : isMistake
          ? "border-orange-500/30 bg-orange-500/[0.05]"
          : isBrilliant
          ? "border-[#27815D]/30 bg-[#27815D]/[0.05]"
          : "border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B]"
      }`}
    >
      {/* Title & Classification Marker */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-semibold tracking-wide uppercase font-mono text-[#18352B] dark:text-[#F4EFE3]">
            {title}
          </span>
          <span className="text-xs font-mono font-bold text-[#69736C] dark:text-[#B5BDB5]">
            [{position.qualityIndicator}]
          </span>
        </div>

        <span
          className={`rounded-[8px] px-2 py-0.5 text-[11px] font-mono uppercase font-semibold border ${badgeColor}`}
        >
          {position.classification.replace("_", " ")}
        </span>
      </div>

      {/* Move & Evaluation Swing */}
      <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] p-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-[#69736C] dark:text-[#B5BDB5] uppercase font-mono">Move played</p>
          <p className="text-sm font-bold font-mono text-[#18352B] dark:text-[#F4EFE3]">{moveLabel}</p>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-[#69736C] dark:text-[#B5BDB5] uppercase font-mono">Evaluation changed</p>
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#18221E] dark:text-[#F4EFE3]">
            <span>{evalBeforeStr}</span>
            <ArrowRight size={12} className="text-[#69736C] dark:text-[#B5BDB5]" />
            <span
              className={
                isBlunder
                  ? "text-[#A94B45]"
                  : isMistake
                  ? "text-orange-600 dark:text-orange-400"
                  : isBrilliant
                  ? "text-[#27815D]"
                  : "text-[#B58A3A]"
              }
            >
              {evalAfterStr}
            </span>
          </div>
        </div>
      </div>

      {/* Rationale explanation */}
      <p className="text-xs sm:text-sm text-[#18221E] dark:text-[#F4EFE3] leading-relaxed">
        {position.whyExplanation}
      </p>

      {/* Recommended Best Move action */}
      {position.bestMove && (
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-[#69736C] dark:text-[#B5BDB5]">
            Engine continuation: <strong className="text-[#27815D] font-mono font-bold">{position.bestMoveSan || position.bestMove}</strong>
          </span>
          {onJumpToBestMove && (
            <button
              onClick={onJumpToBestMove}
              className="text-[#27815D] hover:underline font-semibold text-xs cursor-pointer"
            >
              Show move →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
