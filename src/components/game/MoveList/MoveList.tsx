"use client";

import React, { useEffect, useRef } from "react";
import { ChevronFirst, ChevronLeft, ChevronRight, ChevronLast } from "lucide-react";
import { MoveListProps } from "./types";

export default function MoveList({
  moves = [],
  currentMoveIndex,
  onSelectMove,
  onFirst,
  onPrev,
  onNext,
  onLast,
  canNavigate = false,
  className = "",
}: MoveListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as new moves are played
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves]);

  const totalHalfMoves = moves.reduce((acc, m) => acc + (m.white ? 1 : 0) + (m.black ? 1 : 0), 0);
  const isLatest = currentMoveIndex === undefined || currentMoveIndex === totalHalfMoves - 1;

  return (
    <section className={`flex flex-col rounded-[14px] border border-[rgba(24,34,30,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] dark:border-[rgba(255,255,255,0.08)] overflow-hidden shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] px-4 py-2.5 bg-[#F7F4EC] dark:bg-[#1B2A24]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#18221E] dark:text-[#F4EFE3]">
            Move History
          </span>
          <span className="text-[11px] font-mono text-[#69736C] dark:text-[#B5BDB5]">
            ({totalHalfMoves} plies)
          </span>
        </div>
      </div>

      {/* Moves Scroll Container */}
      <div
        ref={scrollRef}
        role="log"
        aria-label="Chess move list"
        className="max-h-[260px] min-h-[140px] overflow-y-auto p-2"
      >
        {moves.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-xs text-[#69736C]/70 dark:text-[#B5BDB5]/70">
            Game started. Waiting for first move...
          </div>
        ) : (
          <div className="space-y-0.5 font-mono text-xs">
            {moves.map((entry, index) => {
              const whiteIndex = entry.whiteMoveIndex ?? index * 2;
              const blackIndex = entry.blackMoveIndex ?? index * 2 + 1;

              const isWhiteSelected = currentMoveIndex === whiteIndex;
              const isBlackSelected = currentMoveIndex === blackIndex;
              const isWhiteLatest = isLatest && !entry.black && index === moves.length - 1;
              const isBlackLatest = isLatest && !!entry.black && index === moves.length - 1;

              return (
                <div
                  key={entry.number}
                  className="grid grid-cols-[42px_1fr_1fr] items-center rounded-lg px-2 py-1 transition-colors hover:bg-[#F7F4EC]/60 dark:hover:bg-[#1B2A24]/60"
                >
                  <span className="text-[#69736C] dark:text-[#B5BDB5] select-none font-mono text-[11px] font-semibold">
                    {String(entry.number).padStart(2, "0")}.
                  </span>

                  {/* White Move */}
                  {entry.white ? (
                    <button
                      type="button"
                      onClick={() => onSelectMove?.(whiteIndex)}
                      className={[
                        "text-left px-2 py-0.5 rounded transition-colors select-none cursor-pointer",
                        isWhiteSelected
                          ? "bg-[#B58A3A]/15 text-[#B58A3A] font-bold dark:bg-[#D3AA58]/20 dark:text-[#D3AA58]"
                          : isWhiteLatest
                            ? "text-[#18221E] font-bold bg-[#EDE9DE] dark:text-[#F4EFE3] dark:bg-[#1B2A24]"
                            : "text-[#18221E] hover:bg-[#F7F4EC] dark:text-[#F4EFE3] dark:hover:bg-[#1B2A24]",
                      ].join(" ")}
                    >
                      {entry.white}
                    </button>
                  ) : (
                    <span />
                  )}

                  {/* Black Move */}
                  {entry.black ? (
                    <button
                      type="button"
                      onClick={() => onSelectMove?.(blackIndex)}
                      className={[
                        "text-left px-2 py-0.5 rounded transition-colors select-none cursor-pointer",
                        isBlackSelected
                          ? "bg-[#B58A3A]/15 text-[#B58A3A] font-bold dark:bg-[#D3AA58]/20 dark:text-[#D3AA58]"
                          : isBlackLatest
                            ? "text-[#18221E] font-bold bg-[#EDE9DE] dark:text-[#F4EFE3] dark:bg-[#1B2A24]"
                            : "text-[#18221E] hover:bg-[#F7F4EC] dark:text-[#F4EFE3] dark:hover:bg-[#1B2A24]",
                      ].join(" ")}
                    >
                      {entry.black}
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Move Navigation Bar */}
      {canNavigate && moves.length > 0 && (
        <div className="flex items-center justify-center gap-1 border-t border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] p-2 bg-[#F7F4EC] dark:bg-[#1B2A24]">
          <button
            type="button"
            onClick={onFirst}
            title="First Move"
            aria-label="First Move"
            className="rounded-lg p-1.5 text-[#69736C] hover:bg-[#FBF9F3] hover:text-[#18221E] dark:text-[#B5BDB5] dark:hover:bg-[#21332B] dark:hover:text-[#F4EFE3] transition cursor-pointer"
          >
            <ChevronFirst size={15} />
          </button>
          <button
            type="button"
            onClick={onPrev}
            title="Previous Move"
            aria-label="Previous Move"
            className="rounded-lg p-1.5 text-[#69736C] hover:bg-[#FBF9F3] hover:text-[#18221E] dark:text-[#B5BDB5] dark:hover:bg-[#21332B] dark:hover:text-[#F4EFE3] transition cursor-pointer"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={onNext}
            title="Next Move"
            aria-label="Next Move"
            className="rounded-lg p-1.5 text-[#69736C] hover:bg-[#FBF9F3] hover:text-[#18221E] dark:text-[#B5BDB5] dark:hover:bg-[#21332B] dark:hover:text-[#F4EFE3] transition cursor-pointer"
          >
            <ChevronRight size={15} />
          </button>
          <button
            type="button"
            onClick={onLast}
            title="Current Position"
            aria-label="Current Position"
            className="rounded-lg p-1.5 text-[#69736C] hover:bg-[#FBF9F3] hover:text-[#18221E] dark:text-[#B5BDB5] dark:hover:bg-[#21332B] dark:hover:text-[#F4EFE3] transition cursor-pointer"
          >
            <ChevronLast size={15} />
          </button>
        </div>
      )}
    </section>
  );
}
