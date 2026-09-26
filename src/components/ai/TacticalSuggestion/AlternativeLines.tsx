"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, GitBranch } from "lucide-react";

interface AlternativeLinesProps {
  lines?: string[];
  startingMoveNumber?: number;
  startingColor?: "white" | "black";
}

export default function AlternativeLines({
  lines = [],
  startingMoveNumber = 1,
  startingColor = "white",
}: AlternativeLinesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!lines || lines.length === 0) {
    return null;
  }

  // Format PV moves into paired move turns
  const formattedMoves: { moveNumber: number; white: string; black?: string }[] = [];
  let currentNum = Math.ceil(startingMoveNumber / 2);
  let isWhiteTurn = startingColor === "white";

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i];
    if (isWhiteTurn) {
      formattedMoves.push({ moveNumber: currentNum, white: m });
      isWhiteTurn = false;
    } else {
      if (formattedMoves.length > 0 && !formattedMoves[formattedMoves.length - 1].black) {
        formattedMoves[formattedMoves.length - 1].black = m;
      } else {
        formattedMoves.push({ moveNumber: currentNum, white: "...", black: m });
      }
      isWhiteTurn = true;
      currentNum++;
    }
  }

  const displayedPairs = isExpanded ? formattedMoves : formattedMoves.slice(0, 3);

  return (
    <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch size={14} className="text-[#B58A3A]" />
          <h4 className="text-[10px] uppercase font-mono tracking-wider text-[#69736C] dark:text-[#B5BDB5]">
            Best Engine Line
          </h4>
        </div>

        {formattedMoves.length > 3 && (
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-[11px] text-[#B58A3A] hover:underline font-semibold cursor-pointer"
          >
            <span>{isExpanded ? "Collapse" : `+${formattedMoves.length - 3} more`}</span>
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-mono">
        {displayedPairs.map((pair, idx) => (
          <span
            key={idx}
            className="rounded-[8px] bg-[#F7F4EC] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.08)] dark:border-white/10 px-2 py-1 text-[#18221E] dark:text-[#F4EFE3]"
          >
            <span className="text-[#69736C] dark:text-[#B5BDB5] mr-1">{pair.moveNumber}.</span>
            <span className="font-semibold text-[#27815D]">{pair.white}</span>
            {pair.black && (
              <span className="ml-1 text-[#18221E] dark:text-[#F4EFE3]">{pair.black}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
