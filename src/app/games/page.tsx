"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { History, Swords, Search, Bot, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { apiFetch } from "@/lib/api";

type FilterTab = "all" | "wins" | "losses" | "draws" | "friends" | "rated";

type GameRecord = {
  _id: string;
  roomId?: string;
  whitePlayerId?: string;
  blackPlayerId?: string;
  whitePlayerName?: string;
  blackPlayerName?: string;
  whiteRating?: number;
  blackRating?: number;
  ratingDelta?: number;
  result?: "white" | "black" | "draw" | "1-0" | "0-1" | "1/2-1/2";
  resultReason?: string;
  timeControl?: string | { initialTime: number; increment: number; category?: string };
  rated?: boolean;
  isFriendsGame?: boolean;
  createdAt: string;
};

export default function GamesArchivePage() {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string>("Player");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGames() {
      try {
        const [gamesRes, userRes] = await Promise.all([
          apiFetch("/api/games/history?limit=50"),
          apiFetch("/api/auth/me"),
        ]);

        if (userRes.ok) {
          const uData = await userRes.json();
          if (uData.user) {
            setCurrentUsername(uData.user.username);
            setCurrentUserId(uData.user.id || uData.user._id || "");
          }
        }

        if (gamesRes.ok) {
          const gData = await gamesRes.json();
          if (gData.success && Array.isArray(gData.games)) {
            setGames(gData.games);
          } else {
            setGames([]);
          }
        } else {
          setGames([]);
        }
      } catch {
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const isWhite =
        (currentUserId && game.whitePlayerId === currentUserId) ||
        game.whitePlayerName?.toLowerCase() === currentUsername.toLowerCase();
      const won =
        (isWhite && (game.result === "white" || game.result === "1-0")) ||
        (!isWhite && (game.result === "black" || game.result === "0-1"));
      const lost =
        (isWhite && (game.result === "black" || game.result === "0-1")) ||
        (!isWhite && (game.result === "white" || game.result === "1-0"));
      const isDraw = game.result === "draw" || game.result === "1/2-1/2";

      if (activeFilter === "wins" && !won) return false;
      if (activeFilter === "losses" && !lost) return false;
      if (activeFilter === "draws" && !isDraw) return false;
      if (activeFilter === "friends" && !game.isFriendsGame) return false;
      if (activeFilter === "rated" && !game.rated) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchWhite = (game.whitePlayerName || "").toLowerCase().includes(q);
        const matchBlack = (game.blackPlayerName || "").toLowerCase().includes(q);
        return matchWhite || matchBlack;
      }

      return true;
    });
  }, [games, activeFilter, searchQuery, currentUsername, currentUserId]);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  const formatTimeControl = (tc: any) => {
    if (!tc) return "Blitz";
    if (typeof tc === "string") return tc;
    if (tc.initialTime) {
      return `${Math.round(tc.initialTime / 60)}+${tc.increment || 0}`;
    }
    return "Match";
  };

  return (
    <div className="flex min-h-screen bg-transparent text-[#18221E] dark:text-[#F4EFE3] animate-pageEnter">
      <AppSidebar />

      <div className="min-w-0 flex-1 pb-16 md:pb-0">
        <AppHeader />

        <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 space-y-8">
          {/* Header */}
          <div className="border-b border-[rgba(24,34,30,0.08)] dark:border-white/8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#B58A3A] mb-1">
                <span>Game Archive</span>
                <span>•</span>
                <span>{games.length} Recorded Matches</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3]">
                Match History & Archive
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#69736C] dark:text-[#B5BDB5]">
                Review all your verified games, time controls, and rating evolutions.
              </p>
            </div>

            {games.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#69736C]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by opponent..."
                  className="w-full rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] py-2 pl-9 pr-3 text-xs text-[#18221E] dark:text-[#F4EFE3] placeholder-[#69736C]/60 outline-none transition focus:border-[#B58A3A] shadow-xs"
                />
              </div>
            )}
          </div>

          {/* Filters: All | Wins | Losses | Draws | Friends | Rated */}
          {games.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(24,34,30,0.08)] dark:border-white/8 pb-4">
              <div className="flex rounded-[12px] bg-[#F7F4EC] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.08)] dark:border-white/8 p-1 text-xs">
                {(
                  [
                    { id: "all", label: "All Games" },
                    { id: "wins", label: "Victories" },
                    { id: "losses", label: "Defeats" },
                    { id: "draws", label: "Draws" },
                    { id: "rated", label: "Rated Only" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`rounded-[10px] px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      activeFilter === tab.id
                        ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18221E] dark:text-[#F4EFE3] shadow-xs"
                        : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <span className="text-xs text-[#69736C] dark:text-[#B5BDB5] font-mono">
                Showing {filteredGames.length} of {games.length} matches
              </span>
            </div>
          )}

          {/* Archive List / Rows */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-16 rounded-[14px] bg-[#F7F4EC] dark:bg-[#1B2A24] animate-pulse border border-[rgba(24,34,30,0.08)] dark:border-white/8" />
              ))}
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="mx-auto max-w-lg px-6 py-16 text-center space-y-4 rounded-[20px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] shadow-[0_8px_30px_rgba(24,34,30,0.04)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#B58A3A]/10 text-[#B58A3A]">
                <History size={26} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3]">
                No games recorded yet
              </h2>
              <p className="text-xs sm:text-sm text-[#69736C] dark:text-[#B5BDB5] leading-relaxed">
                Your completed games will appear here with move histories and Stockfish engine review. Play with friends or join matchmaking to begin your archive.
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
            <div className="overflow-hidden rounded-[20px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] shadow-[0_8px_30px_rgba(24,34,30,0.04)]">
              {/* Header row for large screens */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 border-b border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[10px] font-bold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5]">
                <div className="col-span-4">Matchup</div>
                <div className="col-span-2 text-center">Result</div>
                <div className="col-span-2">Time Control</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2 text-right">Review</div>
              </div>

              {/* Rows with subtle alternating surfaces */}
              <div className="divide-y divide-[rgba(24,34,30,0.06)] dark:divide-white/6">
                {filteredGames.map((game, idx) => {
                  const isWhite =
                    (currentUserId && game.whitePlayerId === currentUserId) ||
                    game.whitePlayerName?.toLowerCase() === currentUsername.toLowerCase();
                  const won =
                    (isWhite && (game.result === "white" || game.result === "1-0")) ||
                    (!isWhite && (game.result === "black" || game.result === "0-1"));
                  const lost =
                    (isWhite && (game.result === "black" || game.result === "0-1")) ||
                    (!isWhite && (game.result === "white" || game.result === "1-0"));
                  const isDraw = game.result === "draw" || game.result === "1/2-1/2";

                  const whiteName = game.whitePlayerName || "White";
                  const blackName = game.blackPlayerName || "Black";
                  const whiteRating = game.whiteRating || 1500;
                  const blackRating = game.blackRating || 1500;

                  return (
                    <div
                      key={game._id}
                      className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-5 sm:px-6 py-4 items-center transition duration-180 hover:bg-[#F7F4EC] dark:hover:bg-[#1B2A24] ${
                        idx % 2 === 0 ? "bg-[#FBF9F3] dark:bg-[#21332B]" : "bg-[#F7F4EC]/40 dark:bg-[#1B2A24]/40"
                      }`}
                    >
                      {/* Matchup (4 cols) */}
                      <div className="md:col-span-4 flex items-center gap-3">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3]">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[rgba(24,34,30,0.15)] bg-white text-[9px] text-[#18221E]">
                              ♔
                            </span>
                            <span className="truncate">{whiteName}</span>
                            <span className="font-mono text-[11px] text-[#69736C] dark:text-[#B5BDB5]">({whiteRating})</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3]">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#18352B] text-white text-[9px]">
                              ♚
                            </span>
                            <span className="truncate">{blackName}</span>
                            <span className="font-mono text-[11px] text-[#69736C] dark:text-[#B5BDB5]">({blackRating})</span>
                          </div>
                        </div>
                      </div>

                      {/* Result Pill (2 cols) */}
                      <div className="md:col-span-2 flex items-center md:justify-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${
                            isDraw
                              ? "border-[#B58A3A]/30 bg-[#B58A3A]/10 text-[#B58A3A]"
                              : won
                              ? "border-[#27815D]/30 bg-[#27815D]/10 text-[#27815D]"
                              : "border-[#A94B45]/30 bg-[#A94B45]/10 text-[#A94B45]"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isDraw ? "bg-[#B58A3A]" : won ? "bg-[#27815D]" : "bg-[#A94B45]"
                            }`}
                          />
                          <span>{isDraw ? "Draw" : won ? "Victory" : "Defeat"}</span>
                        </span>
                      </div>

                      {/* Time Control (2 cols) */}
                      <div className="md:col-span-2 text-xs font-mono text-[#69736C] dark:text-[#B5BDB5]">
                        <span className="text-[#18221E] dark:text-[#F4EFE3] font-bold">
                          {formatTimeControl(game.timeControl)}
                        </span>
                        {game.rated && <span className="ml-1 text-[10px] text-[#B58A3A]">· Rated</span>}
                      </div>

                      {/* Date (2 cols) */}
                      <div className="md:col-span-2 text-xs font-mono text-[#69736C] dark:text-[#B5BDB5]">
                        {formatDate(game.createdAt)}
                      </div>

                      {/* Action (2 cols) */}
                      <div className="md:col-span-2 flex items-center justify-end">
                        <Link
                          href={`/analysis?gameId=${game._id}`}
                          className="inline-flex items-center gap-1.5 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-3.5 py-1.5 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:border-[#B58A3A]/40 hover:text-[#B58A3A] transition shadow-xs"
                        >
                          <Bot size={13} className="text-[#B58A3A]" />
                          <span>Analyze</span>
                          <ArrowUpRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
