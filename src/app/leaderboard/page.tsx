"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

type Player = {
  _id: string;
  username: string;
  avatar?: string;
  rating: number;
  rank: number;
};

export default function LeaderboardPage() {
  const [
    players,
    setPlayers,
  ] = useState<Player[]>([]);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const response =
          await fetch(
            "http://localhost:4000/api/leaderboard/global",
          );

        const data =
          await response.json();

        if (data.success) {
          setPlayers(
            data.leaderboard,
          );
        }
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      }
    }

    loadLeaderboard();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-[#f4f1e9]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <Trophy
              size={22}
              className="text-[#d7b875]"
            />

            <span className="text-sm uppercase tracking-[0.2em] text-white/40">
              ChessVerse
            </span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight">
            Leaderboard
          </h1>

          <p className="mt-2 text-white/45">
            The strongest players in the
            ChessVerse community.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#11110f]">
          <div className="grid grid-cols-[80px_1fr_140px] border-b border-white/10 px-6 py-4 text-xs uppercase tracking-wider text-white/35">
            <span>Rank</span>
            <span>Player</span>
            <span className="text-right">
              Rating
            </span>
          </div>

          {players.map((player) => (
            <div
              key={player._id}
              className="grid grid-cols-[80px_1fr_140px] items-center border-b border-white/[0.06] px-6 py-5 transition hover:bg-white/[0.025]"
            >
              <span className="text-white/45">
                #{player.rank}
              </span>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm">
                  {player.username
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <span className="font-medium">
                  {player.username}
                </span>
              </div>

              <span className="text-right font-semibold text-[#d7b875]">
                {player.rating}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
