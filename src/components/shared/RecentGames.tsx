"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swords } from "lucide-react";
import { apiFetch } from "@/lib/api";

type RecentGameItem = {
  id: string;
  opponent: string;
  result: "Win" | "Loss" | "Draw";
  date: string;
};

export default function RecentGames() {
  const [games, setGames] = useState<RecentGameItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/games/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.games)) {
          setGames(
            data.games.slice(0, 5).map((g: any) => {
              const res = g.result === "1-0" || g.result === "white" ? "Win" : g.result === "draw" || g.result === "1/2-1/2" ? "Draw" : "Loss";
              return {
                id: g._id,
                opponent: g.blackPlayerName || g.whitePlayerName || "Opponent",
                result: res,
                date: new Date(g.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              };
            })
          );
        }
      })
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88A32]">
          Archive
        </span>
        <h2 className="mt-1 text-xl font-serif font-semibold tracking-tight text-[#171A18]">
          Recent games
        </h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
        {loading ? (
          <div className="p-6 text-center text-xs text-[#68706A]">Loading game archive...</div>
        ) : games.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#68706A] space-y-2">
            <p className="text-[#171A18] font-semibold text-sm">No games recorded yet.</p>
            <p>Your completed matches will appear here with instant review access.</p>
            <div className="pt-2">
              <Link
                href="/play"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B88A32] hover:text-[#A07628] hover:underline"
              >
                <Swords size={13} />
                Play chess
              </Link>
            </div>
          </div>
        ) : (
          games.map((game, index) => (
            <Link
              key={game.id}
              href={`/analysis/${game.id}`}
              className={`flex items-center justify-between p-4.5 hover:bg-[#FAF8F2] transition ${
                index !== games.length - 1 ? "border-b border-[rgba(30,30,20,0.06)]" : ""
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-[#171A18]">vs {game.opponent}</p>
                <p className="mt-0.5 text-xs text-[#68706A]">{game.date}</p>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    game.result === "Win"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-500/20"
                      : game.result === "Loss"
                        ? "bg-rose-50 text-rose-700 border border-rose-500/20"
                        : "bg-[rgba(30,30,20,0.05)] text-[#68706A] border border-[rgba(30,30,20,0.08)]"
                  }`}
                >
                  {game.result}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
