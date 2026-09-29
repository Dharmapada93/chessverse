"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Radio,
  Search,
  Eye,
  Swords,
  UserPlus,
  ArrowRight,
  Clock,
  Trophy,
  Filter,
  CheckCircle2,
  Sparkles,
  Bot,
} from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import LiveGameCard, { type LiveGameData } from "@/components/watch/LiveGameCard";
import MiniBoard from "@/components/chess/MiniBoard";
import { apiFetch } from "@/lib/api";

type FinishedGame = {
  _id: string;
  whitePlayerName: string;
  blackPlayerName: string;
  whiteRating: number;
  blackRating: number;
  result: string;
  timeControl: string;
  createdAt: string;
  fen?: string;
};

const DEFAULT_BROADCAST_GAMES: LiveGameData[] = [
  {
    id: "game-live-1",
    whitePlayer: { name: "Magnus Carlsen", rating: 2882 },
    blackPlayer: { name: "Hikaru Nakamura", rating: 2875 },
    timeControl: "3+2 BLITZ",
    movesCount: 16,
    currentMoveText: "Move 8 · Sicilian Defense (Najdorf)",
    fen: "r1bq1rk1/pp2ppbp/2np1np1/8/2PNP3/2N1BP2/PP4PP/R2QKB1R w KQ - 3 9",
    spectators: 342,
    category: "blitz",
  },
  {
    id: "game-live-2",
    whitePlayer: { name: "Elena_K", rating: 1740 },
    blackPlayer: { name: "Marcus_T", rating: 1725 },
    timeControl: "5+0 BLITZ",
    movesCount: 8,
    currentMoveText: "Move 4 · Italian Game (Giuoco Piano)",
    fen: "r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
    spectators: 78,
    category: "blitz",
  },
  {
    id: "game-live-3",
    whitePlayer: { name: "Dharmapada", rating: 1428 },
    blackPlayer: { name: "Stockfish-AI", rating: 1500 },
    timeControl: "10+5 RAPID",
    movesCount: 6,
    currentMoveText: "Move 3 · Queen's Gambit Declined",
    fen: "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2N2N2/PPP1PPPP/R1BQKB1R w KQkq - 2 4",
    spectators: 35,
    category: "rapid",
  },
];

const HISTORICAL_MASTERPIECES = [
  {
    _id: "masterpiece-opera",
    whitePlayerName: "Paul Morphy",
    blackPlayerName: "Duke Karl / Count Isouard",
    whiteRating: 2600,
    blackRating: 2100,
    result: "1-0",
    timeControl: "Classical 1858",
    event: "The Opera Game · Paris",
    fen: "1n1Rkb1r/p4ppp/4q3/4p1B1/4P3/8/PPP2PPP/2K5 b k - 1 17",
  },
  {
    _id: "masterpiece-century",
    whitePlayerName: "Donald Byrne",
    blackPlayerName: "Bobby Fischer",
    whiteRating: 2500,
    blackRating: 2650,
    result: "0-1",
    timeControl: "Classical 1956",
    event: "Game of the Century · New York",
    fen: "1Q6/5pk1/2p3p1/1n2N2p/1b5P/1bn5/2r3P1/2K5 w - - 4 42",
  },
  {
    _id: "masterpiece-kasparov",
    whitePlayerName: "Garry Kasparov",
    blackPlayerName: "Veselin Topalov",
    whiteRating: 2812,
    blackRating: 2700,
    result: "1-0",
    timeControl: "Classical 1999",
    event: "Kasparov's Immortal · Wijk aan Zee",
    fen: "8/5pk1/4p1p1/8/3b1P2/3r2P1/1P2R1K1/2B5 b - - 0 44",
  },
];

export default function WatchPage() {
  const [games, setGames] = useState<LiveGameData[]>(DEFAULT_BROADCAST_GAMES);
  const [recentGames, setRecentGames] = useState<FinishedGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpeed, setSelectedSpeed] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [activeRes, recentRes] = await Promise.all([
          apiFetch("/api/games/live/active"),
          apiFetch("/api/games/recent"),
        ]);

        if (!isMounted) return;

        if (activeRes.ok) {
          const data = await activeRes.json();
          if (data.success && Array.isArray(data.games) && data.games.length > 0) {
            const mapped: LiveGameData[] = data.games.map((g: any, index: number) => {
              const initialSec = g.whiteTimeMs ? Math.round(g.whiteTimeMs / 1000) : 300;
              const cat: "bullet" | "blitz" | "rapid" | "classical" =
                initialSec < 180 ? "bullet" : initialSec <= 300 ? "blitz" : "rapid";

              const wName = g.whitePlayerName || "White";
              const bName = g.blackPlayerName || "Black";
              const lastPly = g.moves?.length || 0;
              const currentMoveText = lastPly > 0 ? `Move ${Math.ceil(lastPly / 2)}` : "Opening Phase";

              return {
                id: g.roomId || g.id || `live-${index}`,
                whitePlayer: {
                  name: wName,
                  rating: g.whiteRating || 1500,
                },
                blackPlayer: {
                  name: bName,
                  rating: g.blackRating || 1500,
                },
                timeControl: `${Math.round(initialSec / 60)}+${Math.round((g.incrementMs || 0) / 1000)} ${cat.toUpperCase()}`,
                movesCount: lastPly,
                currentMoveText,
                fen: g.currentFen || g.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                spectators: g.spectators || 12,
                category: cat,
              };
            });
            setGames(mapped);
          }
        }

        if (recentRes.ok) {
          const recData = await recentRes.json();
          if (recData.success && Array.isArray(recData.games)) {
            setRecentGames(recData.games);
          }
        }
      } catch {
        // Fallback maintained
      }
    }

    loadData();
    const interval = setInterval(loadData, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      if (selectedSpeed !== "all" && g.category !== selectedSpeed) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesPlayer =
          g.whitePlayer.name.toLowerCase().includes(q) ||
          g.blackPlayer.name.toLowerCase().includes(q);
        if (!matchesPlayer) return false;
      }
      return true;
    });
  }, [games, selectedSpeed, searchQuery]);

  return (
    <div className="flex min-h-screen bg-transparent text-[#18221E] dark:text-[#F4EFE3] animate-pageEnter overflow-x-hidden max-w-full">
      <AppSidebar />

      <div className="min-w-0 flex-1 flex flex-col pb-16 md:pb-0 overflow-x-hidden max-w-full">
        <AppHeader />

        <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          {/* ── 1. Top Section: Header & Live Arena Status ── */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-[rgba(24,34,30,0.10)] dark:border-[rgba(255,255,255,0.08)] pb-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#27815D] animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B58A3A] dark:text-[#D3AA58]">
                  LIVE ARENA BROADCAST
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3]">
                Watch Live Matches
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#69736C] dark:text-[#B5BDB5]">
                Spectate active Grandmaster duels, club showdowns, and community games in real time.
              </p>
            </div>

            {/* Quick Player Filter Input */}
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#69736C] dark:text-[#B5BDB5]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search player username..."
                  className="w-full rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-[#FBF9F3] dark:bg-[#1B2A24] py-2.5 pl-9 pr-3 text-xs text-[#18221E] dark:text-[#F4EFE3] placeholder-[#69736C]/60 dark:placeholder-[#B5BDB5]/60 outline-none transition focus:border-[#B58A3A] shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* ── 2. Arena Hero: Live Overview ── */}
          <section className="relative overflow-hidden rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-gradient-to-br from-[#FBF9F3] via-[#F7F4EC] to-[#EDE9DE] dark:from-[#21332B] dark:via-[#1B2A24] dark:to-[#13201B] p-6 sm:p-8 lg:p-10 shadow-[0_10px_35px_rgba(35,40,30,0.04)]">
            <div className="grid gap-8 lg:grid-cols-[1fr_320px] items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#27815D]/30 bg-[#27815D]/10 px-3 py-1 text-xs font-semibold text-[#27815D]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#27815D] animate-pulse" />
                  <span>{filteredGames.length} MATCHES IN PROGRESS</span>
                </div>

                <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#18221E] dark:text-[#F4EFE3]">
                  The ChessVerse Arena
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#69736C] dark:text-[#B5BDB5]">
                  Watch real players and top engines compete. Every match updates continuously with live clocks, moves, and spectator analysis.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 border-t border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] pt-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] block">
                      Active Arena
                    </span>
                    <span className="font-mono text-2xl font-bold text-[#18221E] dark:text-[#F4EFE3]">
                      {filteredGames.length} Live
                    </span>
                  </div>

                  <div className="h-8 w-px bg-[rgba(24,34,30,0.10)] dark:bg-[rgba(255,255,255,0.1)]" />

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] block">
                      Spectators
                    </span>
                    <span className="font-mono text-2xl font-bold text-[#B58A3A] dark:text-[#D3AA58]">
                      {filteredGames.reduce((acc, g) => acc + g.spectators, 0)}
                    </span>
                  </div>

                  <div className="h-8 w-px bg-[rgba(24,34,30,0.10)] dark:bg-[rgba(255,255,255,0.1)]" />

                  <Link
                    href="/play"
                    className="inline-flex items-center gap-2 rounded-[12px] bg-[#18352B] dark:bg-[#D3AA58] hover:bg-[#285443] dark:hover:bg-[#B58A3A] px-4 py-2.5 text-xs font-bold text-[#F7F4EC] dark:text-[#13201B] transition shadow-xs"
                  >
                    <Swords size={14} />
                    <span>Join Arena</span>
                  </Link>
                </div>
              </div>

              {/* Featured Featured Game Centerpiece */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative aspect-square w-64 rounded-[16px] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-[#FBF9F3] dark:bg-[#21332B] p-2.5 shadow-xl">
                  <div className="w-full h-full rounded-[10px] overflow-hidden">
                    <MiniBoard fen={filteredGames[0]?.fen || "r1bq1rk1/pp2ppbp/2np1np1/8/2PNP3/2N1BP2/PP4PP/R2QKB1R w KQ - 3 9"} />
                  </div>
                  <div className="absolute inset-x-2.5 bottom-2.5 rounded-b-[10px] bg-[#18352B]/85 text-[#F7F4EC] py-1 text-center text-[10px] font-mono backdrop-blur-xs flex items-center justify-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#27815D] animate-ping" />
                    <span>Featured GM Duel</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 3. Speed Filter Tabs ── */}
          <div className="flex items-center gap-2 border-b border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] pb-3">
            {["all", "bullet", "blitz", "rapid"].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setSelectedSpeed(speed)}
                className={`rounded-[10px] px-3.5 py-1.5 text-xs font-semibold capitalize transition cursor-pointer ${
                  selectedSpeed === speed
                    ? "bg-[#18352B] text-[#F7F4EC] dark:bg-[#D3AA58] dark:text-[#13201B] shadow-xs"
                    : "bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
                }`}
              >
                {speed === "all" ? "All Formats" : speed}
              </button>
            ))}
          </div>

          {/* ── 4. Live Game Grid ── */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5]">
              Active Match Broadcasts
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGames.map((game) => (
                <LiveGameCard key={game.id} game={game} />
              ))}
            </div>
          </section>

          {/* ── 5. Historical Masterpieces ── */}
          <section className="space-y-4 pt-4 border-t border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#18221E] dark:text-[#F4EFE3]">
                  Historical Masterpieces & Immortal Duels
                </h3>
                <p className="text-xs text-[#69736C] dark:text-[#B5BDB5] mt-0.5">
                  Replay timeless classical masterworks studied by world champions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {HISTORICAL_MASTERPIECES.map((piece) => (
                <div
                  key={piece._id}
                  className="rounded-[16px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-4.5 space-y-3.5 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#B58A3A] dark:text-[#D3AA58] text-[11px] uppercase tracking-wider">
                      {piece.timeControl}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#27815D]">{piece.result}</span>
                  </div>

                  <div className="aspect-square max-w-[170px] mx-auto rounded-xl overflow-hidden border border-[rgba(24,34,30,0.1)] dark:border-white/10 shadow-inner">
                    <MiniBoard fen={piece.fen} />
                  </div>

                  <div className="space-y-1 text-xs border-t border-[rgba(24,34,30,0.08)] dark:border-white/8 pt-2.5">
                    <p className="font-bold text-[#18221E] dark:text-[#F4EFE3] truncate">{piece.event}</p>
                    <div className="flex justify-between text-[11px] text-[#69736C] dark:text-[#B5BDB5]">
                      <span>{piece.whitePlayerName}</span>
                      <span className="font-mono font-semibold">{piece.whiteRating}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#69736C] dark:text-[#B5BDB5]">
                      <span>{piece.blackPlayerName}</span>
                      <span className="font-mono font-semibold">{piece.blackRating}</span>
                    </div>
                  </div>

                  <Link
                    href={`/analysis?fen=${encodeURIComponent(piece.fen)}`}
                    className="w-full flex items-center justify-center gap-1.5 rounded-[10px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] py-2 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:border-[#B58A3A] hover:text-[#B58A3A] transition shadow-xs"
                  >
                    <Bot size={13} className="text-[#B58A3A]" />
                    <span>Analyze Position</span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
