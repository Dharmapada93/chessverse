"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FlipHorizontal, Play, Pause } from "lucide-react";

interface MoveNavigatorProps {
  currentIndex: number;
  totalMoves: number;
  onNavigate: (index: number) => void;
  onFlipBoard?: () => void;
  isFlipped?: boolean;
}

export default function MoveNavigator({
  currentIndex,
  totalMoves,
  onNavigate,
  onFlipBoard,
  isFlipped = false,
}: MoveNavigatorProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play interval for move review
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (currentIndex >= totalMoves - 1) {
        setIsPlaying(false);
      } else {
        onNavigate(currentIndex + 1);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, totalMoves, onNavigate]);

  // Global keyboard arrow navigation listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIsPlaying(false);
        onNavigate(Math.max(0, currentIndex - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setIsPlaying(false);
        onNavigate(Math.min(totalMoves - 1, currentIndex + 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setIsPlaying(false);
        onNavigate(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setIsPlaying(false);
        onNavigate(Math.max(0, totalMoves - 1));
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, totalMoves, onNavigate]);

  const moveNumber = currentIndex === 0 ? "Start" : `Move ${Math.ceil(currentIndex / 2)} / ${Math.ceil(totalMoves / 2)}`;

  return (
    <div className="flex items-center justify-between gap-2 rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-2.5 sm:p-3 shadow-xs">
      {/* First / Prev navigation buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onNavigate(0)}
          disabled={currentIndex <= 0}
          className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#18352B] dark:text-[#F4EFE3] transition hover:bg-[#FAF8F2] dark:hover:bg-[#23372F] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          title="First Move (Home)"
          aria-label="First Move"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          onClick={() => onNavigate(Math.max(0, currentIndex - 1))}
          disabled={currentIndex <= 0}
          className="flex h-9 px-3 items-center gap-1 rounded-[12px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] text-xs font-semibold text-[#18352B] dark:text-[#F4EFE3] transition hover:bg-[#FAF8F2] dark:hover:bg-[#23372F] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          title="Previous Move (←)"
          aria-label="Previous Move"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Prev</span>
        </button>
      </div>

      {/* Position Status indicator & Play/Pause */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className={`flex h-9 w-9 items-center justify-center rounded-[12px] border transition cursor-pointer ${
            isPlaying
              ? "bg-[#B58A3A] text-[#18352B] border-[#B58A3A] shadow-xs font-bold"
              : "bg-[#F7F4EC] dark:bg-[#1B2A24] border-[rgba(24,34,30,0.10)] dark:border-white/10 text-[#18352B] dark:text-[#F4EFE3] hover:bg-[#FAF8F2] dark:hover:bg-[#23372F]"
          }`}
          title={isPlaying ? "Pause playback (Space)" : "Play moves (Space)"}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>

        <div className="text-center font-mono text-xs sm:text-sm font-semibold tracking-wide text-[#18352B] dark:text-[#F4EFE3]">
          {moveNumber}
          <span className="ml-2 text-[10px] text-[#69736C] dark:text-[#B5BDB5] font-sans font-normal hidden sm:inline">
            ({currentIndex} of {totalMoves})
          </span>
        </div>
      </div>

      {/* Next / Last navigation buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onNavigate(Math.min(totalMoves - 1, currentIndex + 1))}
          disabled={currentIndex >= totalMoves - 1}
          className="flex h-9 px-3 items-center gap-1 rounded-[12px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] text-xs font-semibold text-[#18352B] dark:text-[#F4EFE3] transition hover:bg-[#FAF8F2] dark:hover:bg-[#23372F] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          title="Next Move (→)"
          aria-label="Next Move"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>

        <button
          onClick={() => onNavigate(Math.max(0, totalMoves - 1))}
          disabled={currentIndex >= totalMoves - 1}
          className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#18352B] dark:text-[#F4EFE3] transition hover:bg-[#FAF8F2] dark:hover:bg-[#23372F] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          title="Last Move (End)"
          aria-label="Last Move"
        >
          <ChevronsRight size={16} />
        </button>

        {onFlipBoard && (
          <button
            onClick={onFlipBoard}
            className={`flex h-9 w-9 items-center justify-center rounded-[12px] border transition cursor-pointer ${
              isFlipped
                ? "bg-[#B58A3A]/20 text-[#B58A3A] border-[#B58A3A]/40"
                : "bg-[#F7F4EC] dark:bg-[#1B2A24] border-[rgba(24,34,30,0.10)] dark:border-white/10 text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18352B] dark:hover:text-[#F4EFE3]"
            }`}
            title="Flip Board"
            aria-label="Flip Board"
          >
            <FlipHorizontal size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
