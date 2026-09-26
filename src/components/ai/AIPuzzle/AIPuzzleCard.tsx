"use client";

import React, { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { CheckCircle2, Lightbulb, RotateCcw, Sparkles, XCircle } from "lucide-react";
import type { AIPuzzle } from "@/types/ai";

interface AIPuzzleCardProps {
  puzzle: AIPuzzle;
  onSolve?: () => void;
}

export default function AIPuzzleCard({ puzzle, onSolve }: AIPuzzleCardProps) {
  const [game, setGame] = useState(() => new Chess(puzzle.fen));
  const [solved, setSolved] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [moveFeedback, setMoveFeedback] = useState<string>("");

  function handlePieceDrop(sourceSquare: string, targetSquare: string): boolean {
    if (solved) return false;

    const testGame = new Chess(game.fen());
    let move = null;
    try {
      move = testGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
    } catch {
      return false;
    }

    if (!move) return false;

    const uciMove = `${sourceSquare}${targetSquare}${move.promotion || ""}`.toLowerCase();
    const isCorrect =
      puzzle.targetMoveUci?.toLowerCase() === uciMove ||
      puzzle.solutionSan?.some(
        (san) => san.toLowerCase() === (move?.san?.toLowerCase() || "")
      );

    if (isCorrect) {
      setGame(testGame);
      setSolved(true);
      setMoveFeedback("Correct continuation!");
      if (onSolve) onSolve();
      return true;
    } else {
      setSolved(false);
      setMoveFeedback("Not the best move. Try again.");
      return false;
    }
  }

  function handleReset() {
    setGame(new Chess(puzzle.fen));
    setSolved(null);
    setMoveFeedback("");
    setShowHint(false);
  }

  return (
    <div className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-5 sm:p-6 shadow-[0_10px_35px_rgba(35,40,30,0.06)] space-y-4">
      <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-white/10 pb-3">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#69736C] dark:text-[#B5BDB5] flex items-center gap-1">
            <Sparkles size={11} className="text-[#B58A3A]" />
            AI Extracted Puzzle
          </span>
          <h3 className="text-sm font-serif font-bold text-[#18352B] dark:text-[#F4EFE3] tracking-tight">
            {puzzle.title}
          </h3>
        </div>

        <span className="rounded-[8px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-2.5 py-1 text-[11px] font-mono capitalize text-[#B58A3A] font-semibold">
          {puzzle.difficulty}
        </span>
      </div>

      <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
        {puzzle.description} ({puzzle.sideToMove === "white" ? "White" : "Black"} to move)
      </p>

      {/* Mini Puzzle Board */}
      <div className="mx-auto max-w-[340px] aspect-square rounded-[14px] overflow-hidden border border-[rgba(24,34,30,0.12)] dark:border-white/10 shadow-sm bg-[#EFECE3] p-1.5">
        <div className="w-full h-full rounded-[10px] overflow-hidden">
          <Chessboard
            options={{
              position: game.fen(),
              onPieceDrop: ({ sourceSquare, targetSquare }) => {
                if (!targetSquare) return false;
                return handlePieceDrop(sourceSquare, targetSquare);
              },
              boardOrientation: puzzle.sideToMove,
              darkSquareStyle: { backgroundColor: "#8B6D4C" },
              lightSquareStyle: { backgroundColor: "#F0D9B5" },
            }}
          />
        </div>
      </div>

      {/* Result feedback */}
      {moveFeedback && (
        <div
          className={`flex items-center gap-2 rounded-[12px] p-3 text-xs font-semibold ${
            solved
              ? "border border-[#27815D]/25 bg-[#27815D]/10 text-[#27815D]"
              : "border border-[#A94B45]/25 bg-[#A94B45]/10 text-[#A94B45]"
          }`}
        >
          {solved ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          <span>{moveFeedback}</span>
        </div>
      )}

      {/* Explanation when solved */}
      {solved && puzzle.explanation && (
        <p className="text-xs text-[#18221E] dark:text-[#F4EFE3] leading-relaxed rounded-[14px] bg-[#F7F4EC] dark:bg-[#1B2A24] p-3 border border-[rgba(24,34,30,0.08)] dark:border-white/10">
          {puzzle.explanation}
        </p>
      )}

      {/* Hint & Reset controls */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setShowHint((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18352B] dark:hover:text-[#F4EFE3] transition cursor-pointer"
        >
          <Lightbulb size={13} className={showHint ? "text-[#B58A3A]" : ""} />
          <span>{showHint ? `Hint: Motif is ${puzzle.motif}` : "Need a hint?"}</span>
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18352B] dark:hover:text-[#F4EFE3] transition cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
