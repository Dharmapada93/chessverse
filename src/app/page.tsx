"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Swords,
  Users,
  Eye,
  Bot,
  Sparkles,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import MiniBoard from "@/components/chess/MiniBoard";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

type TimeControlOption = {
  id: string;
  name: "Bullet" | "Blitz" | "Rapid";
  label: string;
  category: "bullet" | "blitz" | "rapid";
  initialSec: number;
  increment: number;
};

const TIME_CONTROLS: TimeControlOption[] = [
  { id: "bullet-1-0", name: "Bullet", label: "1+0", category: "bullet", initialSec: 60, increment: 0 },
  { id: "blitz-3-0", name: "Blitz", label: "3+0", category: "blitz", initialSec: 180, increment: 0 },
  { id: "blitz-5-0", name: "Blitz", label: "5+0", category: "blitz", initialSec: 300, increment: 0 },
  { id: "rapid-10-0", name: "Rapid", label: "10+0", category: "rapid", initialSec: 600, increment: 0 },
  { id: "rapid-10-5", name: "Rapid", label: "10+5", category: "rapid", initialSec: 600, increment: 5 },
];

type ActiveGameInfo = {
  gameId: string;
  roomId: string;
  playerColor: "white" | "black";
  opponent: { username: string; rating: number };
  movesCount: number;
  currentFen?: string;
  turn: "w" | "b";
  clock: { whiteRemaining: number; blackRemaining: number };
  timeControl: { initialTime: number; increment: number; display: string };
};

type LiveGame = {
  id: string;
  whitePlayer: { name: string; rating: number };
  blackPlayer: { name: string; rating: number };
  timeControl: string;
  movesCount: number;
  fen: string;
  spectators: number;
};

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, openLogin, openRegister } = useAuth();

  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControlOption>(TIME_CONTROLS[2]);
  const [activeGame, setActiveGame] = useState<ActiveGameInfo | null>(null);
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [loadingLive, setLoadingLive] = useState(true);

  // Load real active game for current user (if logged in) and real public live games
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [activeRes, liveRes] = await Promise.all([
          apiFetch("/api/users/me/active-game"),
          apiFetch("/api/games/live/active"),
        ]);

        if (isMounted && activeRes.ok) {
          const aData = await activeRes.json();
          if (aData.success && aData.activeGame) {
            setActiveGame(aData.activeGame);
          } else {
            setActiveGame(null);
          }
        }

        if (isMounted && liveRes.ok) {
          const lData = await liveRes.json();
          if (lData.success && Array.isArray(lData.games)) {
            const mapped: LiveGame[] = lData.games.slice(0, 3).map((g: any, index: number) => {
              const initialSec = g.whiteTimeMs ? Math.round(g.whiteTimeMs / 1000) : 300;
              const cat = initialSec < 180 ? "Bullet" : initialSec <= 300 ? "Blitz" : "Rapid";
              return {
                id: g.roomId || g._id?.toString() || `live-${index}`,
                whitePlayer: {
                  name: g.whitePlayerName || "White",
                  rating: g.whiteRating || 1500,
                },
                blackPlayer: {
                  name: g.blackPlayerName || "Black",
                  rating: g.blackRating || 1500,
                },
                timeControl: `${Math.round(initialSec / 60)}+${Math.round((g.incrementMs || 0) / 1000)} ${cat}`,
                movesCount: g.moves?.length || 0,
                fen: g.currentFen || g.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                spectators: g.spectators || 0,
              };
            });
            setLiveGames(mapped);
          } else {
            setLiveGames([]);
          }
        }
      } catch {
        if (isMounted) {
          setActiveGame(null);
          setLiveGames([]);
        }
      } finally {
        if (isMounted) setLoadingLive(false);
      }
    }

    loadData();

    const interval = setInterval(loadData, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleStartPlay = () => {
    router.push(`/play?time=${selectedTimeControl.initialSec}&inc=${selectedTimeControl.increment}`);
  };

  const formatClock = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex min-h-screen bg-transparent text-[#18221E] dark:text-[#F4EFE3] animate-pageEnter overflow-x-hidden max-w-full">
      {/* Desktop Global Navigation Sidebar */}
      <AppSidebar />

      <div className="min-w-0 flex-1 flex flex-col pb-16 md:pb-0 overflow-x-hidden max-w-full">
        {/* Contextual Top Bar */}
        <AppHeader />

        <main className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10 flex-1 overflow-x-hidden">
          {/* Active Game Resume Banner (Real state only) */}
          {activeGame && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[14px] border border-[#27815D]/30 bg-[#27815D]/10 p-4 sm:px-6 shadow-[0_4px_20px_rgba(39,129,93,0.08)]">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 rounded-full bg-[#27815D] animate-pulse" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#18221E] dark:text-[#F4EFE3]">
                      Live Match in Progress vs {activeGame.opponent.username}
                    </span>
                    <span className="font-mono text-xs text-[#69736C] dark:text-[#B5BDB5]">
                      ({activeGame.opponent.rating})
                    </span>
                  </div>
                  <p className="text-xs text-[#69736C] dark:text-[#B5BDB5] mt-0.5">
                    Playing as <strong className="capitalize text-[#18221E] dark:text-[#F4EFE3]">{activeGame.playerColor}</strong> · Move {activeGame.movesCount} ·{" "}
                    <span className="font-mono text-[#27815D] font-semibold">
                      {formatClock(
                        activeGame.playerColor === "white"
                          ? activeGame.clock.whiteRemaining
                          : activeGame.clock.blackRemaining
                      )} remaining
                    </span>
                  </p>
                </div>
              </div>

              <Link
                href={`/game/${activeGame.gameId || activeGame.roomId}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#27815D] dark:hover:bg-[#1f674a] px-4 py-2 text-xs font-bold text-[#F7F4EC] transition shrink-0 shadow-xs"
              >
                <span>Resume Game</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* ── SECTION 1: EDITORIAL CHESS HERO & BOARD CENTERPIECE ── */}
          <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-10 items-center border-b border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] pb-10 sm:pb-12 overflow-hidden">
            {/* Left: Product Manifesto & Time Control Selector */}
            <div className="space-y-6 min-w-0">
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B58A3A] dark:text-[#D3AA58] block">
                  CHESSVERSE
                </span>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3] leading-[1.18] break-words">
                  Play chess with clarity<br />and precision.
                </h1>
                <p className="text-xs sm:text-sm text-[#69736C] dark:text-[#B5BDB5] max-w-lg leading-relaxed pt-1 font-sans">
                  Play real games with friends, analyze your matches, solve puzzles and improve your chess. Zero subscriptions, open platform.
                </p>
              </div>

              {/* Time Control Selector */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] block mb-2.5">
                  Select Time Control
                </span>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
                  {TIME_CONTROLS.map((tc) => {
                    const isSelected = selectedTimeControl.id === tc.id;
                    return (
                      <button
                        key={tc.id}
                        type="button"
                        onClick={() => setSelectedTimeControl(tc)}
                        className={`flex flex-col items-center justify-center rounded-[12px] border py-2.5 sm:py-3 px-1 sm:px-2 text-center transition-all duration-150 cursor-pointer min-w-0 ${
                          isSelected
                            ? "border-[#B58A3A] bg-[#B58A3A]/12 text-[#18221E] dark:text-[#F4EFE3] dark:border-[#D3AA58] dark:bg-[#D3AA58]/15 shadow-[0_2px_8px_rgba(181,138,58,0.15)] font-semibold"
                            : "border-[rgba(24,34,30,0.1)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] text-[#69736C] dark:text-[#B5BDB5] hover:border-[rgba(24,34,30,0.2)] hover:bg-[#F7F4EC] dark:hover:bg-[#1B2A24] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
                        }`}
                      >
                        <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-tight sm:tracking-wider truncate w-full block">
                          {tc.name}
                        </span>
                        <span className="font-mono text-sm sm:text-base md:text-lg font-bold text-[#18221E] dark:text-[#F4EFE3] mt-0.5">
                          {tc.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleStartPlay}
                  className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] px-5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F7F4EC] hover:-translate-y-0.5 active:translate-y-0 transition duration-150 shadow-[0_6px_20px_rgba(24,53,43,0.18)] cursor-pointer"
                >
                  <Swords size={16} />
                  <span>Find Opponent ({selectedTimeControl.label})</span>
                </button>

                <Link
                  href="/play?mode=friends"
                  className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-[#F7F4EC] dark:bg-[#21332B] px-5 text-xs sm:text-sm font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:bg-[#EDE9DE] dark:hover:bg-[#1B2A24] hover:-translate-y-0.5 active:translate-y-0 transition duration-150 shadow-xs cursor-pointer"
                >
                  <Users size={16} />
                  <span>Play With Friends</span>
                </Link>
              </div>

              {/* Logged Out Callout */}
              {!user && !authLoading && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-xs text-[#69736C] dark:text-[#B5BDB5]">
                  <span>Playing as guest?</span>
                  <button
                    onClick={openLogin}
                    className="text-[#B58A3A] dark:text-[#D3AA58] font-semibold hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                  <span>or</span>
                  <button
                    onClick={openRegister}
                    className="text-[#B58A3A] dark:text-[#D3AA58] font-semibold hover:underline cursor-pointer"
                  >
                    Create Free Account
                  </button>
                </div>
              )}
            </div>

            {/* Right: Board Centerpiece (Physical appearance with warm soft glow) */}
            <div className="flex flex-col items-center justify-center overflow-hidden">
              <div className="relative w-full max-w-[min(420px,100%)] aspect-square rounded-[20px] p-2 sm:p-2.5 bg-[#F7F4EC] dark:bg-[#21332B] border border-[rgba(24,34,30,0.1)] dark:border-[rgba(255,255,255,0.08)] shadow-[0_16px_50px_rgba(35,40,30,0.08)] overflow-hidden">
                {/* Subtle warm halo */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-[#B58A3A]/10 to-[#18352B]/10 rounded-[24px] blur-xl -z-10 pointer-events-none" />
                <div className="w-full h-full rounded-[14px] overflow-hidden shadow-inner">
                  <MiniBoard
                    fen="r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4"
                  />
                </div>
              </div>
              <div className="w-full max-w-[min(420px,100%)] mt-3.5 flex items-center justify-between text-[11px] text-[#69736C] dark:text-[#B5BDB5] font-mono px-1">
                <span>Wood & Ivory Classical Set</span>
                <Link href="/puzzles" className="text-[#B58A3A] dark:text-[#D3AA58] hover:underline flex items-center gap-1 font-sans font-semibold">
                  <span>Solve Daily Tactics</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </section>

          {/* ── SECTION 2: LIVE MATCH ARENA (REAL GAMES ONLY) ── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#27815D]" />
                <h2 className="text-base font-bold text-[#18221E] dark:text-[#F4EFE3] tracking-tight">
                  Watch Live Matches
                </h2>
              </div>
              <Link
                href="/watch"
                className="text-xs font-semibold text-[#B58A3A] dark:text-[#D3AA58] hover:underline flex items-center gap-1"
              >
                <span>Live Arena</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {loadingLive ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-44 rounded-[14px] bg-[#F7F4EC]/60 dark:bg-[#1B2A24]/60 animate-pulse border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)]" />
                ))}
              </div>
            ) : liveGames.length === 0 ? (
              /* Honest Elegant Empty State per user prompt */
              <div className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-8 text-center text-xs text-[#69736C] dark:text-[#B5BDB5] space-y-2 shadow-[0_10px_35px_rgba(35,40,30,0.04)]">
                <p className="text-sm font-semibold text-[#18221E] dark:text-[#F4EFE3]">No live games right now.</p>
                <p>Start a game with a friend to appear here.</p>
                <div className="pt-2">
                  <Link
                    href="/play"
                    className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#18352B] dark:bg-[#D3AA58] px-4 py-2 text-xs font-semibold text-[#F7F4EC] dark:text-[#13201B] hover:bg-[#285443] dark:hover:bg-[#B58A3A] transition shadow-xs"
                  >
                    <Swords size={13} />
                    <span>Start a Match</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {liveGames.map((game) => (
                  <Link
                    key={game.id}
                    href={`/game/${game.id}`}
                    className="group rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-4 space-y-3 transition duration-150 hover:border-[rgba(24,34,30,0.18)] hover:-translate-y-0.5 shadow-[0_10px_35px_rgba(35,40,30,0.04)]"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#69736C] dark:text-[#B5BDB5]">
                      <span className="font-mono font-semibold text-[#B58A3A] dark:text-[#D3AA58]">{game.timeControl}</span>
                      <div className="flex items-center gap-1 font-mono">
                        <Eye size={12} />
                        <span>{game.spectators}</span>
                      </div>
                    </div>

                    <div className="aspect-square max-w-[160px] mx-auto rounded-lg overflow-hidden border border-[rgba(24,34,30,0.1)] dark:border-[rgba(255,255,255,0.08)]">
                      <MiniBoard fen={game.fen} />
                    </div>

                    <div className="space-y-1 text-xs pt-1 border-t border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#18221E] dark:text-[#F4EFE3] truncate">{game.whitePlayer.name}</span>
                        <span className="font-mono text-[11px] text-[#69736C] dark:text-[#B5BDB5]">{game.whitePlayer.rating}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#18221E] dark:text-[#F4EFE3] truncate">{game.blackPlayer.name}</span>
                        <span className="font-mono text-[11px] text-[#69736C] dark:text-[#B5BDB5]">{game.blackPlayer.rating}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* ── SECTION 3: WORKSPACE SHORTCUTS (EDITORIAL TILES) ── */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Link
              href="/analysis"
              className="flex items-start gap-3.5 rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-4 transition duration-150 hover:border-[rgba(24,34,30,0.18)] hover:-translate-y-0.5 shadow-[0_10px_35px_rgba(35,40,30,0.04)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#B58A3A]/10 text-[#B58A3A] dark:text-[#D3AA58]">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#18221E] dark:text-[#F4EFE3]">
                  AI Game Analysis
                </h3>
                <p className="text-[11px] text-[#69736C] dark:text-[#B5BDB5] mt-1 leading-relaxed">
                  Deep Stockfish evaluations, move classification, and interactive coach review.
                </p>
              </div>
            </Link>

            <Link
              href="/puzzles"
              className="flex items-start gap-3.5 rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-4 transition duration-150 hover:border-[rgba(24,34,30,0.18)] hover:-translate-y-0.5 shadow-[0_10px_35px_rgba(35,40,30,0.04)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#18352B]/10 text-[#18352B] dark:text-[#D3AA58]">
                <BrainCircuit size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#18221E] dark:text-[#F4EFE3]">
                  Tactical Puzzles
                </h3>
                <p className="text-[11px] text-[#69736C] dark:text-[#B5BDB5] mt-1 leading-relaxed">
                  Sharpen your tactical vision with calculated combinations and rating progression.
                </p>
              </div>
            </Link>

            <Link
              href="/insights"
              className="flex items-start gap-3.5 rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-4 transition duration-150 hover:border-[rgba(24,34,30,0.18)] hover:-translate-y-0.5 shadow-[0_10px_35px_rgba(35,40,30,0.04)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#B58A3A]/10 text-[#B58A3A] dark:text-[#D3AA58]">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#18221E] dark:text-[#F4EFE3]">
                  Personal Insights
                </h3>
                <p className="text-[11px] text-[#69736C] dark:text-[#B5BDB5] mt-1 leading-relaxed">
                  Uncover your accuracy patterns, opening tendencies, and blunder phases from real games.
                </p>
              </div>
            </Link>
          </section>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
