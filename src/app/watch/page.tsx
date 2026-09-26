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
  const [games, setGames] = useState<LiveGameData[]>([]);
  const [recentGames, setRecentGames] = useState<FinishedGame[]>([]);
  const [loading, setLoading] = useState(true);
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
          if (data.success && Array.isArray(data.games)) {
            const mapped: LiveGameData[] = data.games.map((g: any, index: number) => {
              const initialSec = g.whiteTimeMs ? Math.round(g.whiteTimeMs / 1000) : 300;
              const cat: "bullet" | "blitz" | "rapid" | "classical" =
                initialSec < 180 ? "bullet" : initialSec <= 300 ? "blitz" : "rapid";

              const wName = g.whitePlayerName || "White";
              const bName = g.blackPlayerName || "Black";
              const lastPly = g.moves?.length || 0;
              const currentMoveText = lastPly > 0 ? `Move ${Math.ceil(lastPly / 2)}` : "Opening";

              return {
                id: g.roomId || g._id?.toString() || `live-${index}`,
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
                spectators: g.spectators || 0,
                category: cat,
              };
            });
            setGames(mapped);
          } else {
            setGames([]);
          }
        }

        if (recentRes.ok) {
          const recData = await recentRes.json();
          if (recData.success && Array.isArray(recData.games)) {
            setRecentGames(recData.games);
          }
        }
      } catch {
        if (isMounted) {
          setGames([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    const interval = setInterval(loadData, 6000);
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
    <div className="flex min-h-screen bg-transparent text-[#18221E] dark:text-[#F4EFE3] animate-pageEnter">
      <AppSidebar />

      <div className="min-w-0 flex-1 pb-16 md:pb-0">
        <AppHeader />

        <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          {/* ── 1. Top Section: Header & Live Arena Status ── */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-[rgba(24,34,30,0.10)] dark:border-[rgba(255,255,255,0.08)] pb-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className={`flex h-2 w-2 rounded-full ${games.length > 0 ? "bg-[#27815D] animate-pulse" : "bg-[#B58A3A]"}`} />
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B58A3A] dark:text-[#D3AA58]">
                  {games.length > 0 ? "LIVE ARENA" : "ARENA STANDBY"}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3]">
                Watch Live Games
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#69736C] dark:text-[#B5BDB5]">
                Follow real ChessVerse games as they happen across the global arena.
              </p>
            </div>

            {/* Quick Player Filter Input */}
            {games.length > 0 && (
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
            )}
          </div>

          {/* ── 2. Arena Hero: Adaptive Presentation (No huge empty space) ── */}
          {games.length === 0 ? (
            /* Standby Card: Compact, informative, direct CTAs to start match */
            <section className="relative overflow-hidden rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-gradient-to-br from-[#FBF9F3] via-[#F7F4EC] to-[#EDE9DE] dark:from-[#21332B] dark:via-[#1B2A24] dark:to-[#13201B] p-6 sm:p-8 lg:p-10 shadow-[0_10px_35px_rgba(35,40,30,0.04)]">
              <div className="grid gap-8 lg:grid-cols-[1fr_300px] items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#1B2A24] px-3 py-1 text-xs font-semibold text-[#69736C] dark:text-[#B5BDB5]">
                    <Radio size={13} className="text-[#B58A3A] dark:text-[#D3AA58]" />
                    <span>0 MATCHES IN-FLIGHT</span>
                  </div>

                  <h2 className="mt-3 text-2xl sm:text-3xl font-serif font-bold text-[#18221E] dark:text-[#F4EFE3]">
                    The Arena is Ready.
                  </h2>
                  <p className="mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-[#69736C] dark:text-[#B5BDB5]">
                    No live multiplayer games are currently in progress. Start a ranked duel in matchmaking or invite a peer to become the featured live match on this board.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      href="/play"
                      className="inline-flex items-center gap-2 rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] px-5 py-3 text-xs font-bold text-[#F7F4EC] transition shadow-xs cursor-pointer hover:-translate-y-0.5"
                    >
                      <Swords size={15} />
                      <span>Start Matchmaking</span>
                    </Link>

                    <Link
                      href="/play?mode=friends"
                      className="inline-flex items-center gap-2 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-[#F7F4EC] dark:bg-[#1B2A24] px-5 py-3 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:bg-[#EDE9DE] transition shadow-xs cursor-pointer"
                    >
                      <UserPlus size={15} />
                      <span>Challenge a Friend</span>
                    </Link>
                  </div>
                </div>

                {/* Classical Centerpiece Board Preview */}
                <div className="hidden lg:flex items-center justify-center">
                  <div className="relative aspect-square w-60 rounded-[14px] border border-[rgba(24,34,30,0.10)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-2.5 shadow-md">
                    <MiniBoard fen="r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4" />
                    <div className="absolute inset-x-2.5 bottom-2.5 rounded-b-[10px] bg-[#FBF9F3]/90 dark:bg-[#21332B]/90 py-1 text-center text-[10px] font-mono text-[#69736C] dark:text-[#B5BDB5] backdrop-blur-xs">
                      Arena Waiting For Players
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            /* Live Overview When Games Exist */
            <section className="relative overflow-hidden rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-gradient-to-br from-[#FBF9F3] via-[#F7F4EC] to-[#EDE9DE] dark:from-[#21332B] dark:via-[#1B2A24] dark:to-[#13201B] p-6 sm:p-8 lg:p-10 shadow-[0_10px_35px_rgba(35,40,30,0.04)]">
              <div className="grid gap-8 lg:grid-cols-[1fr_320px] items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#27815D]/30 bg-[#27815D]/10 px-3 py-1 text-xs font-semibold text-[#27815D]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#27815D] animate-pulse" />
                    <span>LIVE NOW</span>
                  </div>

                  <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#18221E] dark:text-[#F4EFE3]">
                    The ChessVerse Arena
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#69736C] dark:text-[#B5BDB5]">
                    Watch real players compete in real time. Every match updates continuously with live clocks, moves, and spectator chat.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 border-t border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] pt-5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] block">
                        Live Matches
                      </span>
                      <span className="font-mono text-2xl font-bold text-[#18221E] dark:text-[#F4EFE3]">
                        {games.length}
                      </span>
                    </div>

                    <div className="h-8 w-px bg-[rgba(24,34,30,0.10)] dark:bg-[rgba(255,255,255,0.1)]" />

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] block">
                        Arena Mode
                      </span>
                      <span className="text-xs font-semibold text-[#18352B] dark:text-[#D3AA58] flex items-center gap-1 mt-1">
                        <CheckCircle2 size={13} className="text-[#27815D]" /> Authoritative Sync
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex items-center justify-center">
                  <div className="relative aspect-square w-64 rounded-[14px] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-3 shadow-md">
                    <MiniBoard fen={games[0]?.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"} />
                    <div className="absolute inset-x-3 bottom-3 rounded-b-[10px] bg-[#FBF9F3]/90 dark:bg-[#21332B]/90 py-1.5 text-center text-[10px] font-mono font-semibold text-[#69736C] dark:text-[#B5BDB5] backdrop-blur-xs border-t border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)]">
                      Featured Arena Board
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── 3. Filters Bar (Shown only when games exist) ── */}
          {games.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-3 shadow-xs">
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs font-semibold text-[#69736C] dark:text-[#B5BDB5] mr-2 px-2 flex items-center gap-1.5">
                  <Filter size={13} />
                  Format:
                </span>
                {[
                  { id: "all", label: "All Formats" },
                  { id: "bullet", label: "Bullet" },
                  { id: "blitz", label: "Blitz" },
                  { id: "rapid", label: "Rapid" },
                  { id: "classical", label: "Classical" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedSpeed(tab.id)}
                    className={`rounded-[10px] px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      selectedSpeed === tab.id
                        ? "bg-[#18352B] text-[#F7F4EC] dark:bg-[#D3AA58] dark:text-[#13201B] shadow-xs"
                        : "text-[#69736C] dark:text-[#B5BDB5] hover:bg-[#F7F4EC] dark:hover:bg-[#1B2A24] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-xs font-mono font-semibold text-[#69736C] dark:text-[#B5BDB5] px-2">
                Showing {filteredGames.length} active {filteredGames.length === 1 ? "game" : "games"}
              </div>
            </div>
          )}

          {/* ── 4. Main Arena Content ── */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-5 space-y-4 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-16 rounded bg-[rgba(24,34,30,0.06)]" />
                    <div className="h-4 w-12 rounded bg-[rgba(24,34,30,0.06)]" />
                  </div>
                  <div className="aspect-square w-full rounded-[10px] bg-[rgba(24,34,30,0.05)]" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-[rgba(24,34,30,0.06)]" />
                    <div className="h-4 w-1/2 rounded bg-[rgba(24,34,30,0.06)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : games.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <LiveGameCard key={game.id} game={game} />
              ))}
            </div>
          ) : null}

          {/* ── 5. Historical Masterpiece Archive (Always fills with rich real chess content, ZERO fake live games) ── */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B58A3A] dark:text-[#D3AA58]">
                  AUTHENTIC TOURNAMENT CHESS
                </span>
                <h3 className="mt-1 text-xl font-serif font-bold text-[#18221E] dark:text-[#F4EFE3]">
                  Historical Masterpiece Showcase
                </h3>
              </div>
              <span className="text-xs text-[#69736C] dark:text-[#B5BDB5] hidden sm:inline-block">
                Replay classic master combinations
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {HISTORICAL_MASTERPIECES.map((hm) => (
                <div
                  key={hm._id}
                  className="flex flex-col justify-between rounded-[16px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-4.5 transition hover:border-[#B58A3A]/40 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-[rgba(24,34,30,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#B58A3A] dark:text-[#D3AA58]">
                        {hm.timeControl}
                      </span>
                      <span className="text-[10px] text-[#69736C] dark:text-[#B5BDB5] font-semibold">{hm.result}</span>
                    </div>

                    <div className="my-3 aspect-square max-w-[190px] mx-auto overflow-hidden rounded-[10px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#F7F4EC] dark:bg-[#1B2A24]">
                      <MiniBoard fen={hm.fen} />
                    </div>

                    <div className="space-y-1.5 text-xs pt-1">
                      <div className="font-bold text-[#18221E] dark:text-[#F4EFE3]">{hm.event}</div>
                      <div className="flex items-center justify-between text-[#69736C] dark:text-[#B5BDB5]">
                        <span>♔ {hm.whitePlayerName}</span>
                        <span className="font-mono text-[11px] font-semibold">{hm.whiteRating}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#69736C] dark:text-[#B5BDB5]">
                        <span>♚ {hm.blackPlayerName}</span>
                        <span className="font-mono text-[11px] font-semibold">{hm.blackRating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[rgba(24,34,30,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                    <Link
                      href="/puzzles"
                      className="flex items-center justify-center gap-1.5 w-full rounded-[10px] bg-[#18352B] dark:bg-[#D3AA58] py-2 text-xs font-bold text-[#F7F4EC] dark:text-[#13201B] hover:bg-[#285443] dark:hover:bg-[#B58A3A] transition shadow-xs cursor-pointer"
                    >
                      <span>Study Tactical Theme</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
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
