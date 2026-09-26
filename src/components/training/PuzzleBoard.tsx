"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";

type PuzzleBoardProps = {
  fen: string;
  solution: string;
  puzzleId: string;
};

export default function PuzzleBoard({
  fen,
  solution,
  puzzleId,
}: PuzzleBoardProps) {
  const [game, setGame] = useState(() => new Chess(fen));

  const [selectedSquare, setSelectedSquare] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    setGame(new Chess(fen));
    setSelectedSquare(null);
    setMessage("");
  }, [fen, puzzleId]);

  function handleSquare(square: string) {
    if (!selectedSquare) {
      // Only select if there is a piece on this square
      const piece = game.get(square as any);
      if (piece) {
        setSelectedSquare(square);
      }
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    const move = `${selectedSquare}${square}`;

    if (move === solution) {
      setMessage(
        "Excellent. You found the tactical move.",
      );
      try {
        const nextGame = new Chess(game.fen());
        nextGame.move({
          from: selectedSquare,
          to: square,
          promotion: "q",
        });
        setGame(nextGame);
      } catch {
        // Safe fallback
      }
    } else {
      setMessage(
        "Not quite. Look for the strongest forcing move.",
      );
    }

    setSelectedSquare(null);
  }

  const board = game.board();

  return (
    <div className="flex flex-col items-center">
      <div className="grid aspect-square w-full max-w-[560px] grid-cols-8 overflow-hidden rounded-xl border border-white/10 shadow-2xl">
        {board.flatMap(
          (row, rowIndex) =>
            row.map((piece, colIndex) => {
              const square =
                `${String.fromCharCode(
                  97 + colIndex,
                )}${8 - rowIndex}`;

              const light =
                (rowIndex + colIndex) % 2 === 0;

              const isSelected =
                selectedSquare === square;

              return (
                <button
                  type="button"
                  key={square}
                  onClick={() =>
                    handleSquare(square)
                  }
                  className={`relative flex aspect-square items-center justify-center text-4xl transition-colors select-none ${
                    light
                      ? "bg-[#d8c7a0] text-[#1c1c1a]"
                      : "bg-[#806b52] text-[#f4f0e6]"
                  } ${
                    isSelected
                      ? "ring-4 ring-inset ring-amber-300 brightness-110"
                      : "hover:brightness-105"
                  }`}
                >
                  {piece && (
                    <span className="drop-shadow-sm font-serif">
                      {getPieceSymbol(
                        piece.color,
                        piece.type,
                      )}
                    </span>
                  )}
                </button>
              );
            }),
        )}
      </div>

      <p className="mt-5 min-h-6 text-sm font-medium transition-opacity text-white/70">
        {message}
      </p>
    </div>
  );
}

function getPieceSymbol(
  color: "w" | "b",
  type:
    | "p"
    | "n"
    | "b"
    | "r"
    | "q"
    | "k",
) {
  const symbols = {
    w: {
      p: "♙",
      n: "♘",
      b: "♗",
      r: "♖",
      q: "♕",
      k: "♔",
    },
    b: {
      p: "♟",
      n: "♞",
      b: "♝",
      r: "♜",
      q: "♛",
      k: "♚",
    },
  };

  return symbols[color][type];
}
