"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Game = {
  _id: string;
  whitePlayerName?: string;
  blackPlayerName?: string;
  result?: "white" | "black" | "draw";
  resultReason?: string;
  createdAt: string;
};

export default function GamesPage() {
  const [games, setGames] =
    useState<Game[]>([]);

  useEffect(() => {
    async function loadGames() {
      try {
        const response =
          await apiFetch(
            "/api/games/history",
          );

        const data =
          await response.json();

        if (data.success) {
          setGames(data.games);
        }
      } catch {
        // Handled silently
      }
    }

    loadGames();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-[#f4f1e9]">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-[0.2em] text-[#d7b875]">
          Archive
        </p>

        <h1 className="mt-2 text-3xl font-semibold">
          Game History
        </h1>

        <div className="mt-8 space-y-3">
          {games.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#11110f] p-8 text-white/40">
              No completed games yet.
            </div>
          ) : (
            games.map((game) => (
              <div
                key={game._id}
                className="rounded-xl border border-white/10 bg-[#11110f] p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {game.whitePlayerName}{" "}
                      vs{" "}
                      {game.blackPlayerName}
                    </p>

                    <p className="mt-1 text-sm text-white/40">
                      {game.resultReason}
                    </p>
                  </div>

                  <div className="text-sm text-[#d7b875]">
                    {game.result ===
                    "draw"
                      ? "Draw"
                      : game.result ===
                        "white"
                        ? "White won"
                        : "Black won"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
