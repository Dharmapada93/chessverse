"use client";

import React from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";

interface GameEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  winnerColor: "white" | "black" | null;
  result?: string;
  reason?: string;
  whitePlayer: { name: string; rating?: number };
  blackPlayer: { name: string; rating?: number };
  onRematch?: () => void;
  onReviewBoard?: () => void;
  gameId: string;
  rematchStatus?: string | null;
}

export default function GameEndModal({
  isOpen,
  onClose,
  winnerColor,
  result,
  reason,
  whitePlayer,
  blackPlayer,
  onRematch,
  onReviewBoard,
  gameId,
  rematchStatus,
}: GameEndModalProps) {
  if (!isOpen) return null;

  const isDraw = winnerColor === null;
  const isCheckmate = reason === "checkmate";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18352B]/40 dark:bg-[#13201B]/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-[20px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-6 sm:p-8 shadow-[0_24px_64px_rgba(24,34,30,0.14)] space-y-6 text-[#18221E] dark:text-[#F4EFE3]">
        {/* Close Button to view board */}
        <button
          type="button"
          onClick={onClose}
          title="Dismiss result modal to view board"
          aria-label="Dismiss result modal"
          className="absolute right-5 top-5 rounded-full p-2 text-[#69736C] hover:bg-[rgba(24,34,30,0.06)] hover:text-[#18352B] dark:hover:text-[#F4EFE3] transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#B58A3A]">
            Game Over
          </span>
          {isCheckmate && (
            <span className="rounded-full bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:text-rose-300 tracking-wider">
              CHECKMATE
            </span>
          )}
        </div>

        {/* Title & Result */}
        <div>
          <h2 id="game-over-title" className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#18352B] dark:text-[#F4EFE3] capitalize">
            {isDraw ? "Draw" : `${winnerColor === "white" ? whitePlayer.name : blackPlayer.name} Wins!`}
          </h2>
          {reason && (
            <p className="mt-1 text-sm text-[#69736C] dark:text-[#B5BDB5] capitalize font-medium">
              by {reason.replace(/_/g, " ")}
            </p>
          )}
        </div>

        {/* Players Scoreboard */}
        <div className="grid grid-cols-2 gap-3 rounded-[14px] bg-[#F7F4EC] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.08)] dark:border-white/10 p-4 shadow-xs">
          {/* White Player */}
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] font-bold text-[#69736C] dark:text-[#B5BDB5] uppercase">White</span>
            <span className="truncate text-sm font-semibold text-[#18352B] dark:text-[#F4EFE3]">{whitePlayer.name}</span>
            <span className="font-mono text-xs text-[#69736C] dark:text-[#B5BDB5]">{whitePlayer.rating}</span>
          </div>

          {/* Black Player */}
          <div className="flex flex-col gap-1 min-w-0 text-right">
            <span className="text-[10px] font-bold text-[#69736C] dark:text-[#B5BDB5] uppercase">Black</span>
            <span className="truncate text-sm font-semibold text-[#18352B] dark:text-[#F4EFE3]">{blackPlayer.name}</span>
            <span className="font-mono text-xs text-[#69736C] dark:text-[#B5BDB5]">{blackPlayer.rating}</span>
          </div>
        </div>

        {/* Rematch Status Message */}
        {rematchStatus && (
          <div className="rounded-[12px] bg-[#B58A3A]/10 border border-[#B58A3A]/30 p-2.5 text-xs text-[#B58A3A] text-center font-medium animate-pulse">
            {rematchStatus}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={onRematch}
            className="flex-1 rounded-[12px] bg-[#18352B] dark:bg-[#285443] hover:bg-[#285443] py-2.5 px-4 text-xs sm:text-sm font-bold text-white transition cursor-pointer shadow-xs"
          >
            Rematch
          </button>

          {/* Post-game Analysis Entry Point */}
          <Link
            href={`/analysis`}
            className="flex items-center justify-center gap-1.5 rounded-[12px] bg-[#B58A3A] hover:bg-[#D6B66A] py-2.5 px-4 text-xs sm:text-sm font-bold text-[#18352B] transition text-center shadow-xs"
          >
            <span>Analysis</span>
            <ArrowRight size={14} />
          </Link>

          {onReviewBoard && (
            <button
              type="button"
              onClick={onReviewBoard}
              className="rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] hover:bg-[#FAF8F2] py-2.5 px-3 text-xs sm:text-sm font-semibold text-[#69736C] hover:text-[#18352B] dark:hover:text-[#F4EFE3] transition cursor-pointer shadow-xs"
            >
              Review Board
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
