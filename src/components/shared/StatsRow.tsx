"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type UserStats = {
  rating: number;
  games: number;
  winRate: string;
  bestRating: number;
};

export default function StatsRow() {
  const [stats, setStats] = useState<UserStats>({
    rating: 1500,
    games: 0,
    winRate: "0%",
    bestRating: 1500,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [meRes, progRes] = await Promise.all([
          apiFetch("/api/auth/me"),
          apiFetch("/api/progression/me"),
        ]);

        let rating = 1500;
        let games = 0;
        let winRate = "0%";
        let bestRating = 1500;

        if (meRes.ok) {
          const m = await meRes.json();
          if (m.user) {
            rating = m.user.rating || 1500;
          }
        }

        if (progRes.ok) {
          const p = await progRes.json();
          if (p.progression) {
            games = p.progression.totalGames || 0;
            const wins = p.progression.wins || 0;
            winRate = games > 0 ? `${Math.round((wins / games) * 100)}%` : "0%";
            bestRating = p.progression.peakRating || rating;
          }
        }

        setStats({ rating, games, winRate, bestRating });
      } catch {}
    }

    loadStats();
  }, []);

  const items = [
    { label: "Current rating", value: stats.rating.toString(), note: "Active Elo" },
    { label: "Games played", value: stats.games.toString(), note: "Completed" },
    { label: "Win rate", value: stats.winRate, note: "Overall" },
    { label: "Best rating", value: stats.bestRating.toString(), note: "Peak Elo" },
  ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[rgba(30,30,20,0.08)] bg-[rgba(30,30,20,0.08)] shadow-[0_8px_30px_rgba(35,30,20,0.04)] lg:grid-cols-4">
      {items.map((stat) => (
        <div key={stat.label} className="bg-white/95 p-5">
          <p className="text-[10px] font-semibold text-[#68706A] uppercase tracking-wider">{stat.label}</p>
          <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-[#171A18]">
            {stat.value}
          </p>
          <p className="mt-1 text-xs text-[#68706A]">{stat.note}</p>
        </div>
      ))}
    </div>
  );
}
