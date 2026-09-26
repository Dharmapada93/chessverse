"use client";

import React from "react";
import { PieceIcon, PieceSetStyle, PieceColor, PieceType } from "@/components/game/ChessBoard/PieceSets";

interface PromotionModalProps {
  color: PieceColor;
  pieceSet?: PieceSetStyle;
  onSelect: (promotionPiece: "q" | "r" | "b" | "n") => void;
  onCancel: () => void;
}

const PROMOTION_CHOICES: { type: "q" | "r" | "b" | "n"; label: string }[] = [
  { type: "q", label: "Queen" },
  { type: "r", label: "Rook" },
  { type: "b", label: "Bishop" },
  { type: "n", label: "Knight" },
];

export default function PromotionModal({
  color,
  pieceSet = "classic",
  onSelect,
  onCancel,
}: PromotionModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="promote-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18352B]/40 dark:bg-[#0E1713]/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xs rounded-[20px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-5 shadow-[0_24px_64px_rgba(24,34,30,0.14)] text-center space-y-4">
        <h3 id="promote-title" className="text-sm font-serif font-bold uppercase tracking-wider text-[#18352B] dark:text-[#F4EFE3]">
          Promote Pawn
        </h3>
        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
          Choose a piece to replace your pawn:
        </p>

        <div className="grid grid-cols-4 gap-2 py-2">
          {PROMOTION_CHOICES.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              title={`Promote to ${label}`}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] hover:bg-[#B58A3A]/15 hover:border-[#B58A3A]/50 transition group cursor-pointer"
            >
              <div className="w-10 h-10 transition-transform group-hover:scale-110 drop-shadow-xs">
                <PieceIcon color={color} type={type as PieceType} style={pieceSet} className="w-full h-full" />
              </div>
              <span className="text-[10px] font-semibold text-[#18352B] dark:text-[#F4EFE3] group-hover:text-[#B58A3A]">
                {label}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 px-4 py-2 text-xs font-semibold text-[#18352B] dark:text-[#F4EFE3] hover:bg-[#F7F4EC] dark:hover:bg-[#1B2A24] transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
