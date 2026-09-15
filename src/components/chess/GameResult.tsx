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

  onRematch: () => void;
};

export default function GameResult({
  result,
  reason,
  playerColor,
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
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11110f] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#d7b875]/30 bg-[#d7b875]/10">
          <Trophy
            size={24}
            className="text-[#d7b875]"
          />
        </div>

        <h2 className="text-3xl font-semibold">
          {title}
        </h2>

        <p className="mt-2 text-white/45">
          {reasonLabel}
        </p>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onRematch}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#d7b875] px-5 py-3 font-medium text-black transition hover:brightness-110"
          >
            <RotateCcw size={17} />
            Rematch
          </button>

          <button
            onClick={() => {
              window.location.href =
                "/dashboard";
            }}
            className="flex-1 rounded-xl border border-white/10 px-5 py-3 text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
