"use client";

import React, { useMemo } from "react";

interface MiniBoardProps {
  fen?: string;
  flipped?: boolean;
  className?: string;
}

const PIECE_UNICODE: Record<string, string> = {
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
  k: "♚",
  P: "♟",
  N: "♞",
  B: "♝",
  R: "♜",
  Q: "♛",
  K: "♚",
};

export function parseFen(fen?: string): string[][] {
  const defaultFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const fenStr = (fen && fen.trim().length > 5) ? fen.trim() : defaultFen;
  const placement = fenStr.split(" ")[0] || defaultFen.split(" ")[0];
  const rows = placement.split("/");

  const board: string[][] = [];

  for (let r = 0; r < 8; r++) {
    const rowStr = rows[r] || "8";
    const row: string[] = [];
    for (const char of rowStr) {
      if (char >= "1" && char <= "8") {
        const count = parseInt(char, 10);
        for (let i = 0; i < count; i++) {
          row.push("");
        }
      } else {
        row.push(char);
      }
    }
    board.push(row);
  }

  return board;
}

export default function MiniBoard({
  fen,
  flipped = false,
  className = "",
}: MiniBoardProps) {
  const board = useMemo(() => parseFen(fen), [fen]);

  const displayBoard = useMemo(() => {
    if (!flipped) return board;
    return [...board].reverse().map((row) => [...row].reverse());
  }, [board, flipped]);

  return (
    <div
      className={`grid grid-cols-8 aspect-square select-none overflow-hidden rounded-xl border border-[rgba(30,30,20,0.12)] shadow-sm ${className}`}
    >
      {displayBoard.map((row, rIdx) =>
        row.map((piece, cIdx) => {
          const isLight = (rIdx + cIdx) % 2 === 0;
          const isWhitePiece = piece !== "" && piece === piece.toUpperCase();
          const symbol = piece ? PIECE_UNICODE[piece] || "" : "";

          return (
            <div
              key={`${rIdx}-${cIdx}`}
              className={`flex aspect-square items-center justify-center font-serif text-[clamp(14px,3.2vw,24px)] leading-none transition-colors ${
                isLight ? "bg-[#F0E6D2]" : "bg-[#7A9A60]"
              }`}
            >
              {symbol && (
                <span
                  className={
                    isWhitePiece
                      ? "text-[#FFFFFF] drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.65)]"
                      : "text-[#171A18] drop-shadow-[0_0.5px_0.5px_rgba(255,255,255,0.4)]"
                  }
                >
                  {symbol}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
