"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Swords, Eye } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function LiveMatchPreview() {
  const [liveGame, setLiveGame] = useState<any | null>(null);

  useEffect(() => {
    async function fetchActive() {
      try {
        const res = await apiFetch("/api/games/live/active");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.games) && data.games.length > 0) {
            setLiveGame(data.games[0]);
          }
        }
      } catch {}
    }
    fetchActive();
  }, []);

  if (!liveGame) {
    return (
      <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-8 text-center shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
        <p className="text-sm font-semibold text-[#171A18]">No live games currently active</p>
        <p className="mt-1 text-xs text-[#68706A]">
          When matches begin, live boards and spectators will appear here.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/90 backdrop-blur-md p-6 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#B88A32]">Live Match</span>
        </div>
        <Link
          href={`/game/${liveGame.roomId || liveGame._id}`}
          className="text-xs font-semibold text-[#B88A32] hover:text-[#A07628] hover:underline"
        >
          Watch live
        </Link>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#171A18]">{liveGame.whitePlayerName || "White"} vs {liveGame.blackPlayerName || "Black"}</p>
          <p className="text-xs text-[#68706A] font-mono">Rating: {liveGame.whiteRating || 1500} - {liveGame.blackRating || 1500}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#68706A] font-mono">
          <Eye size={13} className="text-[#B88A32]" />
          <span>{liveGame.spectators || 0}</span>
        </div>
      </div>
    </section>
  );
}
