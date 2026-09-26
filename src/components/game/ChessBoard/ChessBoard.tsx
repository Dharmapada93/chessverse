"use client";

import React, { useMemo, useCallback } from "react";
import { Chess, Square } from "chess.js";
import { PieceIcon, PieceSetStyle, PieceColor, PieceType } from "./PieceSets";
import { ChessBoardProps } from "./types";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

const pieceNames: Record<string, string> = {
  p: "Pawn",
  n: "Knight",
  b: "Bishop",
  r: "Rook",
  q: "Queen",
  k: "King",
};

export default function ChessBoard({
  fen,
  orientation = "white",
  selectedSquare,
  legalDestinations = [],
  lastMove,
  checkSquare,
  isCheckmate = false,
  pieceSet = "classic",
  showCoordinates = true,
  showLegalMoves = true,
  interactive = true,
  onSquareClick,
  className = "",
}: ChessBoardProps) {
  const game = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);

  const isWhiteOrientation = orientation === "white";

  // Square order: for white orientation, ranks 8 down to 1, files a to h.
  // For black orientation, ranks 1 up to 8, files h down to a.
  const squares = useMemo(() => {
    const ranks = isWhiteOrientation
      ? [8, 7, 6, 5, 4, 3, 2, 1]
      : [1, 2, 3, 4, 5, 6, 7, 8];
    const orderedFiles = isWhiteOrientation ? files : [...files].reverse();

    return ranks.flatMap((rank) =>
      orderedFiles.map((file) => `${file}${rank}`)
    );
  }, [isWhiteOrientation]);

  // Screen reader accessible board status
  const textualPosition = useMemo(() => {
    try {
      const c = new Chess(fen);
      const turnStr = c.turn() === "w" ? "White to move" : "Black to move";
      const piecesSummary: string[] = [];
      const board = c.board();

      for (let r = 0; r < 8; r++) {
        for (let col = 0; col < 8; col++) {
          const piece = board[r][col];
          if (piece) {
            const sq = `${files[col]}${8 - r}`;
            const color = piece.color === "w" ? "White" : "Black";
            const name = pieceNames[piece.type] || piece.type;
            piecesSummary.push(`${color} ${name} on ${sq}`);
          }
        }
      }

      return `${turnStr}. Pieces: ${piecesSummary.join(", ")}.`;
    } catch {
      return "Chess match in progress.";
    }
  }, [fen]);

  // Keyboard navigation across the 8x8 grid
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, square: string) => {
      if (!interactive) return;

      const file = square[0];
      const rank = parseInt(square[1], 10);
      const fileIdx = files.indexOf(file);

      let targetSquare: string | null = null;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (isWhiteOrientation && rank < 8) targetSquare = `${file}${rank + 1}`;
          else if (!isWhiteOrientation && rank > 1) targetSquare = `${file}${rank - 1}`;
          break;
        case "ArrowDown":
          e.preventDefault();
          if (isWhiteOrientation && rank > 1) targetSquare = `${file}${rank - 1}`;
          else if (!isWhiteOrientation && rank < 8) targetSquare = `${file}${rank + 1}`;
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (isWhiteOrientation && fileIdx > 0) targetSquare = `${files[fileIdx - 1]}${rank}`;
          else if (!isWhiteOrientation && fileIdx < 7) targetSquare = `${files[fileIdx + 1]}${rank}`;
          break;
        case "ArrowRight":
          e.preventDefault();
          if (isWhiteOrientation && fileIdx < 7) targetSquare = `${files[fileIdx + 1]}${rank}`;
          else if (!isWhiteOrientation && fileIdx > 0) targetSquare = `${files[fileIdx - 1]}${rank}`;
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          onSquareClick?.(square);
          return;
        case "Escape":
          e.preventDefault();
          if (selectedSquare) {
            onSquareClick?.(selectedSquare);
          }
          return;
      }

      if (targetSquare) {
        const el = document.getElementById(`chess-sq-${targetSquare}`);
        if (el) el.focus();
      }
    },
    [isWhiteOrientation, interactive, onSquareClick, selectedSquare]
  );

  return (
    <div
      role="region"
      aria-label="Interactive Chessboard"
      className={`w-full max-w-[620px] aspect-square select-none overflow-hidden rounded-2xl border border-[rgba(30,40,30,0.12)] p-1.5 sm:p-2.5 bg-[#EAE4D7] shadow-[0_24px_60px_rgba(23,34,29,0.10)] transition-all ${className}`}
    >
      {/* Screen Reader Live Position Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {textualPosition}
      </div>

      <div
        className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-xl overflow-hidden shadow-inner"
        role="grid"
        aria-label="Chessboard squares"
      >
        {squares.map((square) => {
          const file = square[0];
          const rank = Number(square[1]);
          const piece = game.get(square as Square);
          const fileIndex = files.indexOf(file);
          const isLight = (fileIndex + rank) % 2 === 0;

          const isSelected = selectedSquare === square;
          const isLastMove = lastMove?.from === square || lastMove?.to === square;
          const isCheck = checkSquare === square;
          const isLegalTarget = showLegalMoves && legalDestinations.includes(square);
          const isCaptureTarget = isLegalTarget && !!piece;

          // Coordinate label display logic: left column shows ranks, bottom row shows files
          const isLeftEdge = isWhiteOrientation ? file === "a" : file === "h";
          const isBottomEdge = isWhiteOrientation ? rank === 1 : rank === 8;

          const pieceDescription = piece
            ? `${piece.color === "w" ? "White" : "Black"} ${pieceNames[piece.type] || piece.type}`
            : "Empty";

          const squareAria = `${square}: ${pieceDescription}${isSelected ? ", Selected" : ""}${
            isLastMove ? ", Last Move" : ""
          }${isCheck ? (isCheckmate ? ", Checkmate" : ", King in Check") : ""}${
            isLegalTarget ? ", Legal Destination" : ""
          }`;

          return (
            <button
              key={square}
              id={`chess-sq-${square}`}
              type="button"
              role="gridcell"
              tabIndex={0}
              aria-label={squareAria}
              aria-selected={isSelected}
              disabled={!interactive}
              onClick={() => interactive && onSquareClick?.(square)}
              onKeyDown={(e) => handleKeyDown(e, square)}
              className={[
                "relative flex items-center justify-center p-1 sm:p-2",
                "aspect-square select-none outline-none transition-colors duration-150",
                interactive ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-[#B78A3B] focus-visible:z-20" : "cursor-default",
                isLight ? "bg-[#F0E6D2]" : "bg-[#7A9A60]",
                isSelected && "ring-4 ring-inset ring-[#B78A3B] z-10",
                isLastMove && "after:absolute after:inset-0 after:bg-[#B78A3B]/20 after:pointer-events-none",
                isCheck && "!bg-[#8B2635]/80 after:absolute after:inset-0 after:bg-[radial-gradient(circle,rgba(139,38,53,0.5)_0%,rgba(139,38,53,0.15)_70%,transparent_100%)] after:animate-pulse after:pointer-events-none",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* PIECE RENDERING */}
              {piece && (
                <div
                  className={[
                    "relative z-10 w-[84%] h-[84%] flex items-center justify-center",
                    "transition-transform duration-150 active:scale-95",
                    isSelected ? "scale-105 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" : "drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <PieceIcon
                    color={piece.color as PieceColor}
                    type={piece.type as PieceType}
                    style={pieceSet}
                    className="w-full h-full"
                  />
                </div>
              )}

              {/* R3.10: LEGAL MOVE INDICATORS */}
              {isLegalTarget && !isCaptureTarget && (
                <span
                  className="absolute z-20 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-black/25 ring-1 ring-white/30 backdrop-blur-[1px] pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-75"
                  aria-hidden="true"
                />
              )}

              {isCaptureTarget && (
                <span
                  className="absolute inset-1 sm:inset-1.5 z-20 rounded-full border-2 sm:border-[2.5px] border-black/35 ring-1 ring-red-400/40 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-90"
                  aria-hidden="true"
                />
              )}

              {/* R3.7: BOARD COORDINATES */}
              {showCoordinates && isLeftEdge && (
                <span
                  aria-hidden="true"
                  className={`absolute left-1 top-0.5 text-[9px] sm:text-[10px] font-bold select-none leading-none ${
                    isLight ? "text-[#7a644f]/85" : "text-[#d8c5a4]/85"
                  }`}
                >
                  {rank}
                </span>
              )}

              {showCoordinates && isBottomEdge && (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0.5 right-1 text-[9px] sm:text-[10px] font-bold select-none leading-none ${
                    isLight ? "text-[#7a644f]/85" : "text-[#d8c5a4]/85"
                  }`}
                >
                  {file}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
