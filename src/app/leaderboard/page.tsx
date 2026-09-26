"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Users,
  Search,
  Swords,
  Trophy,
} from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { apiFetch } from "@/lib/api";

type MainTab = "global" | "friends";
type CategoryFilter = "all" | "blitz" | "rapid" | "bullet";

type LeaderboardPlayer = {
  _id: string;
  rank: number;
  username: string;
  avatar?: string;
  rating: number;
  games: number;
  winRate: number;
  isCurrentUser?: boolean;
};

export default function LeaderboardPage() {
  const [mainTab, setMainTab] = useState<MainTab>("global");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const catQuery = category !== "all" ? `?category=${category}` : "";
        const endpoint = mainTab === "global" ? `/api/leaderboard/global${catQuery}` : `/api/leaderboard/friends${catQuery}`;
        const res = await apiFetch(endpoint);

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.leaderboard)) {
            setPlayers(data.leaderboard);
          } else {
            setPlayers([]);
          }
        } else {
          setPlayers([]);
        }
      } catch {
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [mainTab, category]);

  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return players;
    const q = searchQuery.toLowerCase().trim();
    return players.filter((p) => p.username.toLowerCase().includes(q));
  }, [players, searchQuery]);

  return (
    <div className="flex min-h-screen bg-transparent text-[#18221E] dark:text-[#F4EFE3] animate-pageEnter">
      <AppSidebar />

      <div className="min-w-0 flex-1 pb-16 md:pb-0">
        <AppHeader />

        <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 space-y-8">
          {/* Header */}
          <div className="border-b border-[rgba(24,34,30,0.08)] dark:border-white/8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[#B58A3A]">
                <Award size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B58A3A]">
                  CLUB RANKINGS
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3]">
                Leaderboard
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#69736C] dark:text-[#B5BDB5]">
                Official Elo ratings of registered ChessVerse players.
              </p>
            </div>

            {/* Search */}
            {players.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#69736C]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find player..."
                  className="w-full rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] py-2 pl-9 pr-3 text-xs text-[#18221E] dark:text-[#F4EFE3] placeholder-[#69736C]/60 outline-none transition focus:border-[#B58A3A] shadow-xs"
                />
              </div>
            )}
          </div>

          {/* Sub Navigation: Global vs Friends & Format Toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(24,34,30,0.08)] dark:border-white/8 pb-4">
            {/* Global / Friends Tabs */}
            <div className="flex items-center gap-1 rounded-[12px] bg-[#F7F4EC] dark:bg-[#1B2A24] p-1 border border-[rgba(24,34,30,0.08)] dark:border-white/8">
              <button
                type="button"
                onClick={() => setMainTab("global")}
                className={`rounded-[10px] px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  mainTab === "global"
                    ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18221E] dark:text-[#F4EFE3] shadow-xs"
                    : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
                }`}
              >
                Global
              </button>
              <button
                type="button"
                onClick={() => setMainTab("friends")}
                className={`rounded-[10px] px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  mainTab === "friends"
                    ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18221E] dark:text-[#F4EFE3] shadow-xs"
                    : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
                }`}
              >
                Friends
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 text-xs">
              {(["all", "blitz", "rapid", "bullet"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-[10px] px-3 py-1.5 capitalize transition cursor-pointer ${
                    category === cat
                      ? "bg-[#B58A3A]/10 text-[#B58A3A] font-semibold border border-[#B58A3A]/30"
                      : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3] border border-transparent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Table / Empty State */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-14 rounded-[14px] bg-[#F7F4EC] dark:bg-[#1B2A24] animate-pulse border border-[rgba(24,34,30,0.08)] dark:border-white/8" />
              ))}
            </div>
          ) : filteredPlayers.length === 0 ? (
            /* Honest Empty State */
            <div className="mx-auto max-w-lg px-6 py-16 text-center space-y-4 rounded-[20px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] shadow-[0_8px_30px_rgba(24,34,30,0.04)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#B58A3A]/10 text-[#B58A3A]">
                <Trophy size={26} />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3]">
                Your ChessVerse leaderboard will grow as players join.
              </h2>
              <p className="text-xs sm:text-sm text-[#69736C] dark:text-[#B5BDB5] leading-relaxed">
                Play rated matches with your friends to establish inaugural ratings and climb the community rankings.
              </p>
              <div className="pt-3">
                <Link
                  href="/play"
                  className="inline-flex items-center gap-2 rounded-[12px] bg-[#18352B] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#F7F4EC] hover:bg-[#285443] transition shadow-xs cursor-pointer"
                >
                  <Swords size={14} className="text-[#B58A3A]" />
                  <span>Play Chess</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-[20px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] overflow-hidden shadow-[0_8px_30px_rgba(24,34,30,0.04)]">
              <div className="grid grid-cols-[50px_1fr_100px_90px_90px] items-center px-5 py-3 border-b border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[11px] font-semibold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5]">
                <span>Rank</span>
                <span>Player</span>
                <span className="text-right">Rating</span>
                <span className="text-right">Games</span>
                <span className="text-right">Win Rate</span>
              </div>

              <div className="divide-y divide-[rgba(24,34,30,0.06)] dark:divide-white/6">
                {filteredPlayers.map((player) => (
                  <div
                    key={player._id}
                    className={`grid grid-cols-[50px_1fr_100px_90px_90px] items-center px-5 py-3.5 text-xs transition duration-180 ${
                      player.isCurrentUser
                        ? "bg-[#B58A3A]/5 border-l-2 border-[#B58A3A]"
                        : "hover:bg-[#F7F4EC] dark:hover:bg-[#1B2A24]"
                    }`}
                  >
                    {/* Rank */}
                    <span className="font-mono font-bold text-[#69736C] dark:text-[#B5BDB5]">
                      {player.rank === 1 ? (
                        <span className="text-[#B58A3A] font-bold">#1</span>
                      ) : player.rank === 2 ? (
                        <span className="text-[#69736C] dark:text-[#B5BDB5] font-semibold">#2</span>
                      ) : player.rank === 3 ? (
                        <span className="text-[#D6B66A] font-semibold">#3</span>
                      ) : (
                        `#${player.rank}`
                      )}
                    </span>

                    {/* Player Name & Avatar */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18352B] dark:bg-[#1B2A24] text-xs font-bold text-[#B58A3A] border border-[rgba(24,34,30,0.12)]">
                        {player.username.slice(0, 2).toUpperCase()}
                      </div>
                      <Link
                        href={`/profile/${player.username}`}
                        className="font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:text-[#B58A3A] transition"
                      >
                        {player.username}
                        {player.isCurrentUser && (
                          <span className="ml-1.5 text-[10px] text-[#B58A3A] font-medium bg-[#B58A3A]/10 px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </Link>
                    </div>

                    {/* Rating */}
                    <span className="text-right font-mono font-bold text-[#B58A3A]">
                      {player.rating}
                    </span>

                    {/* Games */}
                    <span className="text-right font-mono text-[#69736C] dark:text-[#B5BDB5]">
                      {player.games}
                    </span>

                    {/* Win Rate */}
                    <span className="text-right font-mono text-[#18221E] dark:text-[#F4EFE3] font-medium">
                      {player.winRate}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
