"use client";

import { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Lightbulb, RotateCcw, ArrowRight, Check, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface PuzzleBoardProps {
  puzzle: {
    _id: string;
    fen: string;
    moves?: string[];
    solution?: string;
    rating: number;
    title?: string;
    themes?: string[];
  };
  onSolved?: (xp: number) => void;
  onNext?: () => void;
  isDaily?: boolean;
}

export default function PuzzleBoard({
  puzzle,
  onSolved,
  onNext,
  isDaily = false,
}: PuzzleBoardProps) {
  const [game, setGame] = useState(() => new Chess(puzzle.fen));
  const [moveIndex, setMoveIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isSolved, setIsSolved] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);

  // Determine whose turn it is in the puzzle
  const orientation = puzzle.fen.split(" ")[1] === "b" ? "black" : "white";

  useEffect(() => {
    setGame(new Chess(puzzle.fen));
    setMoveIndex(0);
    setIsSolved(false);
    setIsError(false);
    setShowHint(false);
    setStatusMessage(`${orientation === "white" ? "White" : "Black"} to move`);
  }, [puzzle, orientation]);

  const verifyMove = async (uciMove: string, beforeFen: string, nextFen: string) => {
    setLoading(true);
    setIsError(false);

    try {
      const res = await apiFetch(`/api/puzzles/${puzzle._id}/check`, {
        method: "POST",
        body: JSON.stringify({
          move: uciMove,
          moveIndex,
        }),
      });

      const data = await res.json();

      if (data.correct) {
        if (data.completed) {
          setIsSolved(true);
          setStatusMessage("✓ Correct");
          if (onSolved) onSolved(data.xpEarned || (isDaily ? 25 : 15));
        } else if (data.opponentMove) {
          // Play opponent response after 400ms delay
          setStatusMessage("Best continuation. Opponent responding...");
          setTimeout(() => {
            const oppFrom = data.opponentMove.slice(0, 2);
            const oppTo = data.opponentMove.slice(2, 4);
            const oppProm = data.opponentMove.length > 4 ? data.opponentMove[4] : undefined;

            const finalGame = new Chess(nextFen);
            try {
              finalGame.move({ from: oppFrom, to: oppTo, promotion: oppProm });
              setGame(finalGame);
              setMoveIndex((prev) => prev + 1);
              setStatusMessage("Your move.");
            } catch {}
          }, 400);
        }
      } else {
        setIsError(true);
        setStatusMessage("Try again.");
        setTimeout(() => {
          setGame(new Chess(beforeFen));
        }, 400);
      }
    } catch {
      setIsError(true);
      setStatusMessage("Try again.");
      setGame(new Chess(beforeFen));
    } finally {
      setLoading(false);
    }
  };

  const handlePieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    if (isSolved || loading) return false;

    const testGame = new Chess(game.fen());
    let moveResult = null;
    try {
      moveResult = testGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
    } catch {
      return false;
    }

    if (!moveResult) return false;

    const uciMove = `${sourceSquare}${targetSquare}${moveResult.promotion || ""}`;
    const beforeFen = game.fen();
    const nextGame = new Chess(beforeFen);
    nextGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    const nextFen = nextGame.fen();
    setGame(nextGame);

    void verifyMove(uciMove, beforeFen, nextFen);
    return true;
  };

  const handleReset = () => {
    setGame(new Chess(puzzle.fen));
    setMoveIndex(0);
    setIsError(false);
    setIsSolved(false);
    setStatusMessage(`${orientation === "white" ? "White" : "Black"} to move`);
  };

  return (
    <div className="flex flex-col items-center text-[#18221E] dark:text-[#F4EFE3]">
      {/* Focused Tactical Header */}
      <div className="mb-4 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B58A3A] dark:text-[#D3AA58]">
          TACTICS
        </span>
        <h2 className="text-xl font-serif font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3] mt-0.5">
          Your move.
        </h2>
        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5] mt-0.5">
          Find the strongest continuation.
        </p>
      </div>

      {/* Status Bar */}
      <div className="mb-3 flex w-full max-w-[480px] items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              orientation === "white" ? "bg-[#FAF8F2] border-2 border-[#18221E]" : "bg-[#18352B] dark:bg-[#13201B]"
            }`}
          />
          <span className="font-semibold text-[#18221E] dark:text-[#F4EFE3]">
            {orientation === "white" ? "White" : "Black"} to move
          </span>
          {isDaily && (
            <span className="rounded-full bg-[#B58A3A]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#B58A3A] dark:text-[#D3AA58] border border-[#B58A3A]/30">
              Daily Challenge
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="text-[#69736C] dark:text-[#B5BDB5]">Rating {puzzle.rating}</span>
        </div>
      </div>

      {/* Dynamic Feedback Message */}
      <div className="mb-3 h-6 flex items-center justify-center">
        <span
          className={`text-xs font-semibold transition-colors ${
            isError
              ? "text-[#A94B45] font-bold"
              : isSolved
              ? "text-[#27815D] font-bold"
              : "text-[#69736C] dark:text-[#B5BDB5]"
          }`}
        >
          {statusMessage}
        </span>
      </div>

      {/* Board Container */}
      <div className="relative aspect-square w-full max-w-[480px] overflow-hidden rounded-[14px] p-2 bg-[#F7F4EC] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.1)] dark:border-[rgba(255,255,255,0.08)] shadow-[0_16px_50px_rgba(35,40,30,0.06)]">
        <div className="w-full h-full rounded-[10px] overflow-hidden shadow-inner">
          <Chessboard
            options={{
              position: game.fen(),
              onPieceDrop: ({ sourceSquare, targetSquare }) => {
                if (!targetSquare) return false;
                return handlePieceDrop(sourceSquare, targetSquare);
              },
              boardOrientation: orientation,
              darkSquareStyle: { backgroundColor: "#7A9A60" },
              lightSquareStyle: { backgroundColor: "#F0E6D2" },
              allowDragging: !isSolved && !loading,
            }}
          />
        </div>

        {/* Success Overlay on solve */}
        {isSolved && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FBF9F3]/95 dark:bg-[#21332B]/95 backdrop-blur-xs p-6 animate-in fade-in duration-200 text-[#18221E] dark:text-[#F4EFE3]">
            <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-[#27815D]/20 text-[#27815D] border border-[#27815D]/40 shadow-xs">
              <Check size={28} />
            </div>
            <h4 className="mt-3 text-lg font-serif font-bold text-[#18221E] dark:text-[#F4EFE3]">Puzzle Solved!</h4>
            <p className="text-xs text-[#27815D] font-bold mt-0.5">
              +{isDaily ? 25 : 15} XP awarded
            </p>

            {onNext && (
              <button
                onClick={onNext}
                className="mt-5 flex items-center gap-2 rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] px-5 py-2.5 text-xs font-bold text-[#F7F4EC] transition shadow-xs cursor-pointer"
              >
                <span>Next Puzzle</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="mt-5 flex w-full max-w-[480px] items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-[#F7F4EC] dark:bg-[#1B2A24] px-3.5 py-2 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:bg-[#EDE9DE] transition shadow-xs cursor-pointer"
            title="Reset to initial position"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          <button
            onClick={() => setShowHint((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-[#F7F4EC] dark:bg-[#1B2A24] px-3.5 py-2 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:bg-[#EDE9DE] transition shadow-xs cursor-pointer"
          >
            <Lightbulb size={14} className={showHint ? "text-[#B58A3A] dark:text-[#D3AA58]" : "text-[#69736C] dark:text-[#B5BDB5]"} />
            <span>{showHint ? "Hide Hint" : "Hint"}</span>
          </button>
        </div>

        {onNext && !isSolved && (
          <button
            onClick={onNext}
            className="flex items-center gap-1.5 text-xs text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3] transition cursor-pointer"
          >
            <span>Skip Puzzle</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* Hint reveal */}
      {showHint && (
        <div className="mt-3 w-full max-w-[480px] rounded-[10px] border border-[#B58A3A]/30 bg-[#B58A3A]/10 p-3 text-xs text-[#18221E] dark:text-[#F4EFE3]">
          💡 Focus on piece vulnerability and forcing tactical moves (checks, captures, forks).
        </div>
      )}
    </div>
  );
}
