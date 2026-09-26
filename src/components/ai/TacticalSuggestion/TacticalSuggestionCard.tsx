"use client";

import React, { useState } from "react";
import type { PositionAnalysis } from "@/types/ai";
import { Crosshair, Eye, EyeOff, Lightbulb } from "lucide-react";

interface TacticalSuggestionCardProps {
  position: PositionAnalysis;
}

export default function TacticalSuggestionCard({
  position,
}: TacticalSuggestionCardProps) {
  const [showOpportunity, setShowOpportunity] = useState(true);

  const motif = position.tacticalMotif;
  const missed = position.missedOpportunity;

  if (!motif && !missed) {
    return null;
  }

  return (
    <div className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-5 sm:p-6 shadow-[0_10px_35px_rgba(35,40,30,0.06)] space-y-4">
      {/* Tactical Motif section */}
      {motif && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Crosshair size={15} className="text-[#B58A3A]" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#69736C] dark:text-[#B5BDB5]">
              Tactical Pattern
            </span>
          </div>

          <div className="rounded-[14px] border border-[#B58A3A]/25 bg-[#B58A3A]/[0.08] p-3.5 space-y-1">
            <h4 className="text-sm font-serif font-bold text-[#18352B] dark:text-[#F4EFE3]">
              {motif.title}
            </h4>
            <p className="text-xs text-[#18221E] dark:text-[#F4EFE3]/80 leading-relaxed">
              {motif.description}
            </p>
          </div>
        </div>
      )}

      {/* Missed Opportunities section */}
      {missed && (
        <div className="space-y-2 border-t border-[rgba(24,34,30,0.06)] dark:border-white/10 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb size={14} className="text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#69736C] dark:text-[#B5BDB5]">
                Missed Opportunity
              </span>
            </div>

            <button
              onClick={() => setShowOpportunity((prev) => !prev)}
              className="flex items-center gap-1 text-[11px] text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18352B] dark:hover:text-[#F4EFE3] transition cursor-pointer"
              title={showOpportunity ? "Hide opportunity" : "Show opportunity"}
            >
              {showOpportunity ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showOpportunity ? "Hide" : "Show"}</span>
            </button>
          </div>

          {showOpportunity && (
            <div className="rounded-[14px] border border-amber-600/20 bg-amber-500/[0.08] dark:bg-amber-500/10 p-3.5 space-y-1">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Stronger continuation existed:
              </p>
              <p className="font-mono text-xs font-bold text-[#18352B] dark:text-[#F4EFE3]">
                {missed.continuation}
              </p>
              <p className="text-[11px] text-[#69736C] dark:text-[#B5BDB5]">
                {missed.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
