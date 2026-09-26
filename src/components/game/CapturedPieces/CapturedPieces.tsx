"use client";

import React from "react";
import { CapturedPiecesProps } from "./types";

export default function CapturedPieces({
  pieces = [],
  advantage = 0,
  label,
  className = "",
}: CapturedPiecesProps) {
  if (pieces.length === 0 && advantage <= 0) {
    return null;
  }

  return (
    <div
      aria-label={`Captured pieces: ${pieces.join(" ")}${advantage > 0 ? `, advantage +${advantage}` : ""}`}
      className={`flex items-center gap-1.5 py-1 select-none flex-wrap ${className}`}
    >
      {label && (
        <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider mr-1">
          {label}
        </span>
      )}

      <div className="flex items-center gap-0.5 text-base sm:text-lg leading-none text-white/60">
        {pieces.map((piece, index) => (
          <span
            key={`${piece}-${index}`}
            className="inline-block transition-transform hover:scale-110"
            aria-hidden="true"
          >
            {piece}
          </span>
        ))}
      </div>

      {advantage > 0 && (
        <span className="ml-1 rounded bg-[#d7b875]/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#d7b875]">
          +{advantage}
        </span>
      )}
    </div>
  );
}
