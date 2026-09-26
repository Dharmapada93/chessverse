"use client";

import {
  RotateCcw,
  Trophy,
} from "lucide-react";

type GameResultProps = {
  result:
    | "white"
    | "black"
    | "draw";

  reason:
    | "checkmate"
    | "timeout"
    | "resignation"
    | "draw";

  playerColor:
    | "white"
    | "black"
    | null;

  gameId?: string;

  onRematch: () => void;
};

export default function GameResult({
  result,
  reason,
  playerColor,
  gameId,
  onRematch,
}: GameResultProps) {
  const playerWon =
    playerColor === result;

  const isDraw =
    result === "draw";

  let title = "Game Over";

  if (isDraw) {
    title = "Draw";
  } else if (playerWon) {
    title = "Victory";
  } else {
    title = "Defeat";
  }

  const reasonLabel =
    reason === "checkmate"
      ? "Checkmate"
      : reason === "timeout"
        ? "Time expired"
        : reason ===
            "resignation"
          ? "Resignation"
          : "Draw agreed";

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#18352B]/40 dark:bg-[#13201B]/70 p-6 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-[20px] border border-[rgba(24,34,30,0.12)] bg-[#FBF9F3] dark:bg-[#1B2A24] dark:border-[rgba(255,255,255,0.08)] p-8 text-center shadow-[0_20px_60px_rgba(24,53,43,0.15)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#B58A3A]/30 bg-[#F7F4EC] dark:bg-[#21332B] text-[#B58A3A] dark:text-[#D3AA58]">
          <Trophy size={24} />
        </div>

        <h2 className="text-3xl font-serif font-bold text-[#18221E] dark:text-[#F4EFE3]">
          {title}
        </h2>

        <p className="mt-2 text-sm text-[#69736C] dark:text-[#B5BDB5]">
          {reasonLabel}
        </p>

        <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
          <button
            onClick={onRematch}
            className="flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-[#18352B] hover:bg-[#285443] px-4 py-3 font-semibold text-[#F7F4EC] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] transition shadow-xs cursor-pointer"
          >
            <RotateCcw size={16} />
            Rematch
          </button>

          {gameId && (
            <button
              onClick={() => {
                window.location.href = `/analysis/${gameId}`;
              }}
              className="flex-1 rounded-[12px] border border-[#B58A3A]/40 bg-[#F7F4EC] dark:bg-[#21332B] px-4 py-3 font-semibold text-[#B58A3A] dark:text-[#D3AA58] transition hover:bg-[#B58A3A]/10 shadow-xs cursor-pointer"
            >
              Analyze Game
            </button>
          )}

          <button
            onClick={() => {
              window.location.href = "/play";
            }}
            className="flex-1 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-[#F7F4EC] dark:bg-[#21332B] px-4 py-3 font-semibold text-[#18221E] dark:text-[#F4EFE3] transition hover:bg-[#EDE9DE] dark:hover:bg-[#1B2A24] shadow-xs cursor-pointer"
          >
            Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
