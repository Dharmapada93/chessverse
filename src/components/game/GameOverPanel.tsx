"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, RotateCcw, Award, X } from "lucide-react";
import ShareGameButton from "./ShareGameButton";

export default function GameOverPanel({
  result,
  reason,
  gameId,
  roomCode,
  ratingDelta = 18,
  onRematchSuccess,
  onReviewBoard,
}: {
  result: string;
  reason?: string;
  gameId?: string;
  roomCode?: string;
  ratingDelta?: number;
  onRematchSuccess?: (newGameId: string) => void;
  onReviewBoard?: () => void;
}) {
  const [rematching, setRematching] = useState(false);
  const [rematchStatus, setRematchStatus] = useState("");

  async function requestRematch() {
    if (!gameId) return;
    setRematching(true);

    try {
      let resolvedUserId = "CURRENT_USER_ID";
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("chessverse-token");
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload?.userId) {
              resolvedUserId = payload.userId;
            }
          } catch {}
        }
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      const res = await fetch(`${apiUrl}/api/games/${gameId}/rematch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: resolvedUserId,
        }),
      });

      const data = await res.json();
      if (data.rematchGameId) {
        setRematchStatus("Rematch accepted! Starting new game...");
        if (onRematchSuccess) {
          onRematchSuccess(data.rematchGameId);
        }
      } else {
        setRematchStatus("Rematch requested. Waiting for opponent...");
      }
    } catch {
      setRematchStatus("Failed to request rematch");
    }
  }

  const isCheckmate = reason?.toLowerCase().includes("checkmate");
  const isDraw = result.toLowerCase().includes("draw");
  const isWin =
    result.toLowerCase().includes("white") ||
    result.toLowerCase().includes("black") ||
    result.toLowerCase().includes("win");

  return (
    <section className="relative rounded-3xl border border-[rgba(30,30,20,0.12)] bg-[#FAF8F2]/95 p-6 sm:p-8 shadow-[0_16px_50px_rgba(35,30,20,0.12)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      {/* Review Board Close Button (Step 79.4) */}
      {onReviewBoard && (
        <button
          type="button"
          onClick={onReviewBoard}
          title="Review Board (Keep board visible)"
          className="absolute right-5 top-5 rounded-full p-2 text-[#68706A] hover:bg-[rgba(30,30,20,0.06)] hover:text-[#171A18] transition cursor-pointer"
        >
          <X size={18} />
        </button>
      )}

      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#B88A32] font-bold">
          Game Over
        </span>
        {isCheckmate && (
          <span className="rounded-full bg-rose-100 border border-rose-300 px-2 py-0.5 text-[10px] font-bold text-rose-800 tracking-wider">
            CHECKMATE
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-3">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#171A18] capitalize">
          {result}
        </h2>
        {ratingDelta !== undefined && (
          <div className="inline-flex items-center gap-1 rounded-xl bg-[#FAF6EE] border border-[#B88A32]/30 px-3 py-1 text-xs font-semibold text-[#B88A32]">
            <Award size={13} />
            <span>Rating {ratingDelta >= 0 ? `+${ratingDelta}` : `${ratingDelta}`}</span>
          </div>
        )}
      </div>

      {reason && (
        <p className="mt-1 text-sm text-[#68706A] capitalize font-medium">
          {reason}
        </p>
      )}

      <p className="mt-3 text-xs sm:text-sm leading-6 text-[#68706A] max-w-xl">
        The match has concluded. You can inspect the final position on the board, request a rematch with reversed colors, or analyze the game.
      </p>

      {rematchStatus && (
        <p className="mt-3 text-xs font-semibold text-emerald-700">
          {rematchStatus}
        </p>
      )}

      <div className="mt-7 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={requestRematch}
          disabled={rematching}
          className="rounded-xl bg-[#B88A32] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-[#A07628] disabled:opacity-40 cursor-pointer shadow-sm"
        >
          {rematching ? "Rematch Requested" : "Request Rematch"}
        </button>

        {onReviewBoard && (
          <button
            type="button"
            onClick={onReviewBoard}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[rgba(30,30,20,0.12)] bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#171A18] transition hover:bg-[#FAF8F2] shadow-sm cursor-pointer"
          >
            <Eye size={14} />
            <span>Review Board</span>
          </button>
        )}

        {gameId && (
          <Link
            href={`/analysis/${gameId}`}
            className="rounded-xl border border-[#B88A32]/40 bg-[#FAF6EE] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#B88A32] transition hover:bg-[#B88A32]/15 shadow-sm"
          >
            Analyze Game
          </Link>
        )}

        <ShareGameButton gameId={gameId} roomCode={roomCode} />
      </div>
    </section>
  );
}
