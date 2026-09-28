"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import {
  Swords,
  Bot,
  Users,
  RotateCcw,
  UserPlus,
  Search,
  Play,
  Clock,
  ChevronRight,
  Zap,
  History,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import MatchFinder from "@/components/matchmaking/MatchFinder";
import MatchFound from "@/components/matchmaking/MatchFound";
import ChallengeModal from "@/components/social/ChallengeModal";
import InviteModal from "@/components/invitations/InviteModal";
import { socket } from "@/lib/socket";
import { apiFetch, ensureAuthToken } from "@/lib/api";
import { useStockfish } from "@/hooks/useStockfish";

type TimeControlOption = {
  id: string;
  name: "Bullet" | "Blitz" | "Rapid";
  label: string;
  category: "bullet" | "blitz" | "rapid";
  initialTime: number; // seconds
  increment: number;   // seconds
};

const TIME_CONTROLS: TimeControlOption[] = [
  { id: "bullet-1-0", name: "Bullet", label: "1+0", category: "bullet", initialTime: 60, increment: 0 },
  { id: "blitz-3-0", name: "Blitz", label: "3+0", category: "blitz", initialTime: 180, increment: 0 },
  { id: "blitz-5-0", name: "Blitz", label: "5+0", category: "blitz", initialTime: 300, increment: 0 },
  { id: "rapid-10-0", name: "Rapid", label: "10+0", category: "rapid", initialTime: 600, increment: 0 },
  { id: "rapid-10-5", name: "Rapid", label: "10+5", category: "rapid", initialTime: 600, increment: 5 },
];

const BOT_LEVELS = [
  { name: "Beginner", rating: "800", depth: 4, desc: "Fast moves with tactical oversights" },
  { name: "Intermediate", rating: "1400", depth: 8, desc: "Solid principles and developing play" },
  { name: "Advanced", rating: "2000", depth: 12, desc: "Strong positional play & calculation" },
  { name: "Expert", rating: "3200+", depth: 16, desc: "Full power engine calculation" },
];

const AI_PERSONALITIES = [
  { id: "balanced", label: "Balanced", desc: "Classical development and measured play" },
  { id: "aggressive", label: "Aggressive", desc: "Early tactical attacks and open files" },
  { id: "positional", label: "Positional", desc: "Long-term pawn structures and prophylaxis" },
];

function PlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeMode, setActiveMode] = useState<"matchmaking" | "ai" | "friends">("matchmaking");
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControlOption>(TIME_CONTROLS[2]);
  const [isSearching, setIsSearching] = useState(false);
  const [playerRating, setPlayerRating] = useState(1500);
  const [playerName, setPlayerName] = useState("Player");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Real Data: Active Game & Recent Games
  const [activeOngoingGame, setActiveOngoingGame] = useState<any | null>(null);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [recentGamesLoading, setRecentGamesLoading] = useState(true);

  // Real Friends State
  const [friends, setFriends] = useState<any[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [activeChallengeUser, setActiveChallengeUser] = useState<any | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const [matchData, setMatchData] = useState<{
    gameId: string;
    roomId: string;
    color: "white" | "black";
    opponent: { id: string; username: string; rating: number };
    timeControl: { initialTime: number; increment: number; category: string };
  } | null>(null);

  // AI Game State
  const [aiGame, setAiGame] = useState(() => new Chess());
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [botLevel, setBotLevel] = useState(BOT_LEVELS[1]);
  const [aiPersonality, setAiPersonality] = useState(AI_PERSONALITIES[0]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiStatus, setAiStatus] = useState("Your turn to move");

  const { getBestMove } = useStockfish();
  const aiGameRef = useRef(aiGame);
  aiGameRef.current = aiGame;

  // Fetch real data on mount
  useEffect(() => {
    async function loadData() {
      const token = await ensureAuthToken();
      if (token && !socket.connected) {
        socket.auth = { token };
        socket.connect();
      }

      try {
        const res = await apiFetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setPlayerName(data.user.username);
            setPlayerRating(data.user.rating || 1500);
            setCurrentUserId(data.user.id || data.user._id || "");
          }
        }
      } catch {}

      // Fetch active unfinished game for "Continue Playing"
      try {
        const activeRes = await apiFetch("/api/games/active");
        if (activeRes.ok) {
          const activeJson = await activeRes.json();
          if (activeJson.success && activeJson.game) {
            setActiveOngoingGame(activeJson.game);
          }
        }
      } catch {}

      // Fetch user's recent real games
      try {
        setRecentGamesLoading(true);
        const histRes = await apiFetch("/api/games/history?limit=5");
        if (histRes.ok) {
          const histJson = await histRes.json();
          if (histJson.success && Array.isArray(histJson.games)) {
            setRecentGames(histJson.games);
          }
        }
      } catch {} finally {
        setRecentGamesLoading(false);
      }

      // Fetch real friends
      try {
        setFriendsLoading(true);
        const friendsRes = await apiFetch("/api/friends");
        if (friendsRes.ok) {
          const friendsJson = await friendsRes.json();
          if (friendsJson.success && Array.isArray(friendsJson.friends)) {
            setFriends(friendsJson.friends);
          }
        }
      } catch {} finally {
        setFriendsLoading(false);
      }
    }

    loadData();

    // Parse URL params if directed with custom time
    const urlTime = searchParams?.get("time");
    const urlInc = searchParams?.get("inc");
    if (urlTime) {
      const sec = parseInt(urlTime, 10);
      const inc = urlInc ? parseInt(urlInc, 10) : 0;
      const matched = TIME_CONTROLS.find((tc) => tc.initialTime === sec && tc.increment === inc);
      if (matched) {
        setSelectedTimeControl(matched);
      }
    }
  }, [searchParams]);

  // Socket Matchmaking Listeners
  useEffect(() => {
    function onQueued() {
      setIsSearching(true);
    }

    function onMatched(data: any) {
      setIsSearching(false);
      setMatchData(data);
    }

    function onCancelled() {
      setIsSearching(false);
    }

    socket.on("matchmaking:queued", onQueued);
    socket.on("matchmaking:matched", onMatched);
    socket.on("matchmaking:cancelled", onCancelled);

    return () => {
      socket.off("matchmaking:queued", onQueued);
      socket.off("matchmaking:matched", onMatched);
      socket.off("matchmaking:cancelled", onCancelled);
    };
  }, []);

  const handleStartMatchmaking = () => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("matchmaking:join", {
      timeControl: {
        initialTime: selectedTimeControl.initialTime,
        increment: selectedTimeControl.increment,
        category: selectedTimeControl.category,
      },
    });

    setIsSearching(true);
  };

  const handleCancelMatchmaking = () => {
    socket.emit("matchmaking:cancel");
    setIsSearching(false);
  };

  // Trigger Bot Move
  const triggerAiMove = useCallback(async () => {
    const game = aiGameRef.current;
    if (game.isGameOver() || isAiThinking) return;

    setIsAiThinking(true);
    setAiStatus(`${botLevel.name} is calculating...`);

    try {
      const fen = game.fen();
      const bestMoveUci = await getBestMove(fen, botLevel.depth);

      if (bestMoveUci && bestMoveUci.length >= 4) {
        const from = bestMoveUci.substring(0, 2);
        const to = bestMoveUci.substring(2, 4);
        const promotion = bestMoveUci.length > 4 ? bestMoveUci.substring(4, 5) : undefined;

        const newGame = new Chess(game.fen());
        const moveRes = newGame.move({ from, to, promotion });

        if (moveRes) {
          setAiGame(newGame);
          if (newGame.isCheckmate()) {
            setAiStatus("Checkmate! Game over.");
          } else if (newGame.isDraw()) {
            setAiStatus("Draw! Game over.");
          } else if (newGame.inCheck()) {
            setAiStatus("Check! Your move.");
          } else {
            setAiStatus("Your turn to move");
          }
        }
      }
    } catch {
      setAiStatus("Bot move error. Your turn.");
    } finally {
      setIsAiThinking(false);
    }
  }, [botLevel, getBestMove, isAiThinking]);

  // Handle human move on practice board
  const handleAiPieceDrop = (source: string, target: string) => {
    if (aiGame.isGameOver() || isAiThinking) return false;

    // Verify turn matches player color
    const turn = aiGame.turn();
    if ((turn === "w" && playerColor !== "white") || (turn === "b" && playerColor !== "black")) {
      return false;
    }

    try {
      const newGame = new Chess(aiGame.fen());
      const move = newGame.move({
        from: source,
        to: target,
        promotion: "q",
      });

      if (!move) return false;

      setAiGame(newGame);

      if (newGame.isCheckmate()) {
        setAiStatus("Checkmate! You win!");
      } else if (newGame.isDraw()) {
        setAiStatus("Draw!");
      } else {
        setTimeout(triggerAiMove, 300);
      }
      return true;
    } catch {
      return false;
    }
  };

  const onlineFriends = friends.filter((f) => f.online);

  return (
    <div className="flex min-h-screen bg-transparent text-[#18221E] dark:text-[#F4EFE3] animate-pageEnter overflow-x-hidden max-w-full">
      <AppSidebar />

      <div className="min-w-0 flex-1 pb-16 md:pb-0 overflow-x-hidden max-w-full">
        <AppHeader />

        <main className="mx-auto max-w-[1440px] px-3 sm:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10 overflow-x-hidden w-full">
          {/* ═══════════════════════════════════════════════ */}
          {/* EDITORIAL HERO SECTION                          */}
          {/* ═══════════════════════════════════════════════ */}
          <section className="relative overflow-hidden rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-gradient-to-br from-[#FBF9F3] via-[#F7F4EC] to-[#EDE9DE] dark:from-[#21332B] dark:via-[#1B2A24] dark:to-[#13201B] p-6 sm:p-10 shadow-[0_10px_35px_rgba(35,40,30,0.06)]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              {/* Left Column: Heading & Mode Tabs */}
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(24,34,30,0.1)] dark:border-[rgba(255,255,255,0.1)] bg-[#FBF9F3]/90 dark:bg-[#1B2A24]/90 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#18352B] dark:text-[#D3AA58] shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27815D] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#27815D]" />
                  </span>
                  <span>The Grand Chess Room</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3] leading-[1.18] sm:leading-[1.2] pt-1.5 pb-0.5">
                  Welcome to ChessVerse.
                </h1>

                <p className="text-sm sm:text-base text-[#69736C] dark:text-[#B5BDB5] leading-relaxed">
                  Enter the private arena. Calibrated matchmaking paired by Elo, calibrated Stockfish engines, and direct friend duels with server-authoritative clocks.
                </p>

                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveMode("matchmaking")}
                    className={`relative flex items-center gap-3 rounded-[14px] border p-3.5 text-left transition-all duration-150 cursor-pointer ${
                      activeMode === "matchmaking"
                        ? "border-[#B58A3A] bg-[#B58A3A]/10 text-[#18221E] dark:text-[#F4EFE3] shadow-xs font-semibold"
                        : "border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3]/80 dark:bg-[#21332B]/80 text-[#69736C] dark:text-[#B5BDB5] hover:bg-[#FBF9F3] hover:text-[#18221E] dark:hover:bg-[#21332B] dark:hover:text-[#F4EFE3]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${
                        activeMode === "matchmaking"
                          ? "bg-[#B58A3A]/20 text-[#B58A3A] dark:text-[#D3AA58]"
                          : "bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5]"
                      }`}
                    >
                      <Swords size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#18221E] dark:text-[#F4EFE3]">
                        Matchmaking
                      </div>
                      <div className="text-[11px] text-[#69736C] dark:text-[#B5BDB5] truncate">
                        Rated Elo duels
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveMode("ai")}
                    className={`relative flex items-center gap-3 rounded-[14px] border p-3.5 text-left transition-all duration-150 cursor-pointer ${
                      activeMode === "ai"
                        ? "border-[#B58A3A] bg-[#B58A3A]/10 text-[#18221E] dark:text-[#F4EFE3] shadow-xs font-semibold"
                        : "border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3]/80 dark:bg-[#21332B]/80 text-[#69736C] dark:text-[#B5BDB5] hover:bg-[#FBF9F3] hover:text-[#18221E] dark:hover:bg-[#21332B] dark:hover:text-[#F4EFE3]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${
                        activeMode === "ai"
                          ? "bg-[#B58A3A]/20 text-[#B58A3A] dark:text-[#D3AA58]"
                          : "bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5]"
                      }`}
                    >
                      <Bot size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#18221E] dark:text-[#F4EFE3]">
                        Practice vs AI
                      </div>
                      <div className="text-[11px] text-[#69736C] dark:text-[#B5BDB5] truncate">
                        800 to 3200+ Elo
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveMode("friends")}
                    className={`relative flex items-center gap-3 rounded-[14px] border p-3.5 text-left transition-all duration-150 cursor-pointer ${
                      activeMode === "friends"
                        ? "border-[#B58A3A] bg-[#B58A3A]/10 text-[#18221E] dark:text-[#F4EFE3] shadow-xs font-semibold"
                        : "border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3]/80 dark:bg-[#21332B]/80 text-[#69736C] dark:text-[#B5BDB5] hover:bg-[#FBF9F3] hover:text-[#18221E] dark:hover:bg-[#21332B] dark:hover:text-[#F4EFE3]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${
                        activeMode === "friends"
                          ? "bg-[#B58A3A]/20 text-[#B58A3A] dark:text-[#D3AA58]"
                          : "bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5]"
                      }`}
                    >
                      <Users size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#18221E] dark:text-[#F4EFE3]">
                        Play Friends
                      </div>
                      <div className="text-[11px] text-[#69736C] dark:text-[#B5BDB5] truncate">
                        Direct challenges
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Right Column: Elo & Quick Status Badge */}
              <div className="flex flex-col gap-3 rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3]/90 dark:bg-[#1B2A24]/90 p-5 shadow-xs lg:w-[320px] shrink-0">
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5]">
                      Active Identity
                    </span>
                    <div className="text-sm font-bold text-[#18221E] dark:text-[#F4EFE3]">{playerName}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5]">
                      Live Elo
                    </span>
                    <div className="font-mono text-base font-bold text-[#B58A3A] dark:text-[#D3AA58]">
                      {playerRating}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-[11px] text-[#69736C] dark:text-[#B5BDB5]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#27815D]" />
                    <span>Server-authoritative clocks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#27815D]" />
                    <span>Fair play & ±100 Elo search radius</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)]">
                  <Link
                    href="/watch"
                    className="flex items-center justify-between text-xs font-semibold text-[#18352B] dark:text-[#D3AA58] hover:text-[#B58A3A] transition"
                  >
                    <span>Spectate live games</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════ */}
          {/* MODE WORKSPACE                                  */}
          {/* ═══════════════════════════════════════════════ */}

          {/* Mode 1: Live Matchmaking Setup */}
          {activeMode === "matchmaking" && (
            <div className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-6 sm:p-8 shadow-[0_10px_35px_rgba(35,40,30,0.06)] space-y-6">
              <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] pb-4">
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#18221E] dark:text-[#F4EFE3]">
                    Select Time Control
                  </h2>
                  <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                    Pick a tournament-standard speed and enter the queue.
                  </p>
                </div>
                <span className="font-mono text-xs text-[#69736C] dark:text-[#B5BDB5]">
                  Search Range: <strong className="text-[#18221E] dark:text-[#F4EFE3]">{playerRating - 100} – {playerRating + 100}</strong>
                </span>
              </div>

              {/* Time Control Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
                {TIME_CONTROLS.map((tc) => {
                  const isSelected = selectedTimeControl.id === tc.id;
                  return (
                    <button
                      key={tc.id}
                      type="button"
                      onClick={() => setSelectedTimeControl(tc)}
                      className={`flex flex-col items-center justify-center rounded-[14px] border py-3.5 sm:py-4 px-3 text-center transition-all duration-150 cursor-pointer min-h-[92px] sm:min-h-[100px] last:col-span-2 sm:last:col-span-1 ${
                        isSelected
                          ? "border-[#B58A3A] bg-[#B58A3A]/10 text-[#18221E] dark:text-[#F4EFE3] dark:border-[#D3AA58] dark:bg-[#D3AA58]/15 shadow-[0_2px_12px_rgba(181,138,58,0.15)] font-semibold"
                          : "border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] text-[#69736C] dark:text-[#B5BDB5] hover:bg-[#F7F4EC] dark:hover:bg-[#1B2A24] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5]">
                        {tc.name}
                      </span>
                      <span className="mt-1 font-mono text-xl sm:text-2xl font-bold text-[#18221E] dark:text-[#F4EFE3]">
                        {tc.label}
                      </span>
                      <span className="mt-1 text-[10px] text-[#69736C] dark:text-[#B5BDB5]">
                        {tc.initialTime / 60} min {tc.increment > 0 ? `+${tc.increment}s` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Primary Matchmaking CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleStartMatchmaking}
                  className="w-full h-12 sm:h-13 inline-flex items-center justify-center gap-2.5 rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] px-5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F7F4EC] shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
                >
                  <Swords size={18} />
                  <span>Find Opponent ({selectedTimeControl.name} {selectedTimeControl.label})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMode("friends")}
                  className="w-full h-12 sm:h-13 inline-flex items-center justify-center gap-2.5 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-[#F7F4EC] dark:bg-[#1B2A24] px-5 text-xs sm:text-sm font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:bg-[#EDE9DE] hover:border-[rgba(24,34,30,0.22)] hover:-translate-y-0.5 active:translate-y-0 transition duration-150 cursor-pointer shadow-xs"
                >
                  <Users size={18} />
                  <span>Play a Friend</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Practice vs AI */}
          {activeMode === "ai" && (
            <div className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-6 sm:p-8 shadow-[0_10px_35px_rgba(35,40,30,0.06)] space-y-6">
              <div className="grid gap-8 lg:grid-cols-[1fr_340px] items-start">
                {/* Chessboard Workspace */}
                <div className="flex flex-col items-center">
                  <div className="w-full flex items-center justify-between text-xs pb-3 border-b border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] mb-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#27815D]" />
                      <span className="font-semibold text-[#18221E] dark:text-[#F4EFE3]">{botLevel.name}</span>
                      <span className="text-[#69736C] dark:text-[#B5BDB5]">({botLevel.rating} Elo)</span>
                    </div>
                    <span className="font-mono text-xs text-[#B58A3A] dark:text-[#D3AA58] font-semibold">{aiStatus}</span>
                  </div>

                  <div className="relative aspect-square w-full max-w-[500px] overflow-hidden rounded-[14px] p-2 bg-[#F7F4EC] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.1)] dark:border-[rgba(255,255,255,0.08)] shadow-[0_16px_50px_rgba(35,40,30,0.06)]">
                    <div className="w-full h-full rounded-[10px] overflow-hidden shadow-inner">
                      <Chessboard
                        options={{
                          position: aiGame.fen(),
                          onPieceDrop: ({ sourceSquare, targetSquare }) => {
                            if (!targetSquare) return false;
                            return handleAiPieceDrop(sourceSquare, targetSquare);
                          },
                          boardOrientation: playerColor,
                          darkSquareStyle: { backgroundColor: "#7A9A60" },
                          lightSquareStyle: { backgroundColor: "#F0E6D2" },
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setAiGame(new Chess());
                        setAiStatus("Your turn to move");
                      }}
                      className="flex-1 sm:flex-initial h-10 inline-flex items-center justify-center gap-2 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-[#F7F4EC] dark:bg-[#1B2A24] px-4 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:bg-[#EDE9DE] transition shadow-xs cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>Reset Board</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlayerColor(playerColor === "white" ? "black" : "white")}
                      className="flex-1 sm:flex-initial h-10 inline-flex items-center justify-center rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-[#F7F4EC] dark:bg-[#1B2A24] px-4 text-xs font-semibold text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3] hover:bg-[#EDE9DE] transition shadow-xs cursor-pointer"
                    >
                      Flip Side ({playerColor === "white" ? "White" : "Black"})
                    </button>
                  </div>
                </div>

                {/* AI Configuration Controls */}
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] block mb-2">
                      Difficulty Level
                    </span>
                    <div className="space-y-2">
                      {BOT_LEVELS.map((level) => {
                        const isSelected = botLevel.name === level.name;
                        return (
                          <button
                            key={level.name}
                            type="button"
                            onClick={() => {
                              setBotLevel(level);
                              setAiGame(new Chess());
                            }}
                            className={`w-full rounded-[14px] border p-3.5 text-left transition-all duration-150 cursor-pointer ${
                              isSelected
                                ? "border-[#B58A3A] bg-[#B58A3A]/10 text-[#18221E] dark:text-[#F4EFE3] dark:border-[#D3AA58] dark:bg-[#D3AA58]/15 shadow-xs font-semibold"
                                : "border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] text-[#69736C] dark:text-[#B5BDB5] hover:bg-[#F7F4EC] dark:hover:bg-[#1B2A24] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
                            }`}
                          >
                            <div className="flex justify-between items-center text-xs font-semibold">
                              <span className="text-[#18221E] dark:text-[#F4EFE3]">{level.name}</span>
                              <span className="font-mono text-[#B58A3A] dark:text-[#D3AA58]">{level.rating}</span>
                            </div>
                            <p className="text-[11px] text-[#69736C] dark:text-[#B5BDB5] mt-0.5">{level.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] block mb-2">
                      Playstyle Mode
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {AI_PERSONALITIES.map((p) => {
                        const isSelected = aiPersonality.id === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setAiPersonality(p)}
                            className={`rounded-[12px] border py-2.5 px-2 text-center text-xs font-medium transition cursor-pointer ${
                              isSelected
                                ? "border-[#B58A3A] bg-[#B58A3A]/10 text-[#18221E] dark:text-[#F4EFE3] dark:border-[#D3AA58] dark:bg-[#D3AA58]/15 font-semibold"
                                : "border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] text-[#69736C] dark:text-[#B5BDB5] hover:bg-[#F7F4EC] dark:hover:bg-[#1B2A24] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAiGame(new Chess());
                      setAiStatus("Your turn to move");
                    }}
                    className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] px-5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F7F4EC] shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer"
                  >
                    <Bot size={18} />
                    <span>Start Practice Session</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Play With Friends */}
          {activeMode === "friends" && (
            <div className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-6 sm:p-8 shadow-[0_10px_35px_rgba(35,40,30,0.06)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)]">
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#18221E] dark:text-[#F4EFE3]">
                    Your Registered Friends
                  </h2>
                  <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                    Direct duels and custom game challenges with real accounts.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/friends"
                    className="h-10 inline-flex items-center gap-1.5 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-[#F7F4EC] dark:bg-[#1B2A24] px-4 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:bg-[#EDE9DE] transition shadow-xs"
                  >
                    <Search size={14} />
                    <span>Find Friends</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(true)}
                    className="h-10 inline-flex items-center gap-1.5 rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] px-4 text-xs font-bold text-[#F7F4EC] transition shadow-xs cursor-pointer"
                  >
                    <UserPlus size={14} />
                    <span>Invite Friends</span>
                  </button>
                </div>
              </div>

              {friendsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-16 rounded-[14px] bg-[#F7F4EC]/60 dark:bg-[#1B2A24]/60 animate-pulse border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)]" />
                  ))}
                </div>
              ) : friends.length === 0 ? (
                <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#F7F4EC]/50 dark:bg-[#1B2A24]/50 p-10 text-center space-y-4 max-w-lg mx-auto my-6 shadow-xs">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#B58A3A]/10 text-[#B58A3A] dark:text-[#D3AA58]">
                    <Users size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#18221E] dark:text-[#F4EFE3]">No friends in your circle yet</h3>
                    <p className="mt-1 text-xs text-[#69736C] dark:text-[#B5BDB5] leading-relaxed">
                      Invite friends or search registered players to build your circle and issue direct challenges.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2.5 pt-2">
                    <Link
                      href="/friends"
                      className="rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-[#FBF9F3] dark:bg-[#21332B] px-4 py-2 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:bg-[#EDE9DE] transition shadow-xs"
                    >
                      Find Friends
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsInviteOpen(true)}
                      className="rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] px-4 py-2 text-xs font-bold text-[#F7F4EC] transition shadow-xs cursor-pointer"
                    >
                      Invite Friends
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {friends.map((friend) => (
                    <div
                      key={friend._id || friend.id}
                      className="flex items-center justify-between rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-4 transition duration-150 hover:border-[rgba(24,34,30,0.18)] hover:shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#F7F4EC] dark:bg-[#1B2A24] text-xs font-bold text-[#B58A3A] dark:text-[#D3AA58]">
                          {friend.username?.slice(0, 2).toUpperCase()}
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#21332B] ${
                              friend.online ? "bg-[#27815D]" : "bg-neutral-400"
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#18221E] dark:text-[#F4EFE3]">
                              {friend.username}
                            </span>
                            <span className="font-mono text-[11px] text-[#69736C] dark:text-[#B5BDB5]">
                              {friend.rating || 1500}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#69736C] dark:text-[#B5BDB5]">
                            {friend.online ? "Online Now" : "Offline"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveChallengeUser(friend)}
                        className="rounded-[12px] border border-[#B58A3A]/40 bg-[#B58A3A]/10 px-3.5 py-1.5 text-xs font-semibold text-[#B58A3A] dark:text-[#D3AA58] hover:bg-[#B58A3A] hover:text-white transition cursor-pointer"
                      >
                        Challenge
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* BELOW-HERO: REAL CONTENT DENSITY SECTIONS      */}
          {/* ═══════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
            {/* Left 8 Columns: Continue Playing + Recent Games */}
            <div className="lg:col-span-8 space-y-8">
              {/* 1. Continue Playing (ONLY if real unfinished game exists) */}
              {activeOngoingGame && (
                <section className="rounded-[20px] border border-[#B58A3A]/30 bg-gradient-to-r from-[#F7F4EC] to-[#FBF9F3] dark:from-[#1B2A24] dark:to-[#21332B] p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#B58A3A]/15 text-[#B58A3A] dark:text-[#D3AA58]">
                        <Flame size={24} className="animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#B58A3A] dark:text-[#D3AA58]">
                            Active Duel
                          </span>
                          <span className="h-1.5 w-1.5 rounded-full bg-[#27815D]" />
                          <span className="text-[11px] font-medium text-[#27815D]">In Progress</span>
                        </div>
                        <h3 className="text-base font-bold text-[#18221E] dark:text-[#F4EFE3] mt-0.5">
                          Continue against {activeOngoingGame.whitePlayerName === playerName ? activeOngoingGame.blackPlayerName : activeOngoingGame.whitePlayerName}
                        </h3>
                        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                          {activeOngoingGame.timeControl ? `${Math.round(activeOngoingGame.timeControl.initialTime / 60)}+${activeOngoingGame.timeControl.increment}` : "Live Match"} • {activeOngoingGame.moves?.length || 0} moves played
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/game/${activeOngoingGame.roomId || activeOngoingGame._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#F7F4EC] transition shadow-xs"
                    >
                      <span>Resume Game</span>
                      <ChevronRight size={15} />
                    </Link>
                  </div>
                </section>
              )}

              {/* 2. Your Recent Games (Real Games Only) */}
              <section className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-6 sm:p-8 shadow-[0_10px_35px_rgba(35,40,30,0.06)] space-y-5">
                <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] pb-4">
                  <div className="flex items-center gap-2.5">
                    <History size={18} className="text-[#B58A3A] dark:text-[#D3AA58]" />
                    <h2 className="text-lg font-serif font-bold text-[#18221E] dark:text-[#F4EFE3]">
                      Your Recent Games
                    </h2>
                  </div>

                  <Link
                    href="/games"
                    className="flex items-center gap-1 text-xs font-semibold text-[#18352B] dark:text-[#D3AA58] hover:text-[#B58A3A] transition"
                  >
                    <span>View all games</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                {recentGamesLoading ? (
                  <div className="space-y-2.5">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-14 rounded-[14px] bg-[#F7F4EC]/60 dark:bg-[#1B2A24]/60 animate-pulse border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)]" />
                    ))}
                  </div>
                ) : recentGames.length === 0 ? (
                  /* Intentional Compact Empty State */
                  <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#F7F4EC]/50 dark:bg-[#1B2A24]/50 p-8 text-center space-y-3">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5]">
                      <History size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#18221E] dark:text-[#F4EFE3]">No recorded matches yet</h4>
                      <p className="mt-1 text-xs text-[#69736C] dark:text-[#B5BDB5] max-w-sm mx-auto">
                        Complete your first match in Matchmaking or against Friends to start your personal match history with engine review.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode("matchmaking");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] px-4 py-2 text-xs font-bold text-[#F7F4EC] transition shadow-xs cursor-pointer"
                    >
                      <Play size={12} />
                      <span>Play First Match</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {recentGames.map((game) => {
                      const isWhite = currentUserId && (game.whitePlayerId === currentUserId || game.whitePlayerName === playerName);
                      const won = (isWhite && (game.winner === "white" || game.result === "1-0" || game.winnerId === currentUserId)) ||
                                  (!isWhite && (game.winner === "black" || game.result === "0-1" || game.winnerId === currentUserId));
                      const draw = game.result === "draw" || game.result === "1/2-1/2" || game.winner === "draw";

                      const opponentName = isWhite
                        ? (game.blackPlayerName || "Opponent")
                        : (game.whitePlayerName || "Opponent");
                      const opponentRating = isWhite ? game.blackRating : game.whiteRating;

                      const timeStr = game.timeControl
                        ? `${Math.round(game.timeControl.initialTime / 60)}+${game.timeControl.increment}`
                        : "Match";

                      const dateStr = game.createdAt
                        ? new Date(game.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                        : "Recent";

                      return (
                        <div
                          key={game._id || game.roomId}
                          className="flex items-center justify-between rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-3.5 px-4 transition hover:border-[rgba(24,34,30,0.18)] hover:bg-[#F7F4EC]/60 dark:hover:bg-[#1B2A24]/60"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center justify-center rounded-[10px] px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border ${
                                won
                                  ? "border-[#27815D]/30 bg-[#27815D]/10 text-[#27815D]"
                                  : draw
                                  ? "border-[rgba(24,34,30,0.15)] dark:border-[rgba(255,255,255,0.15)] bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5]"
                                  : "border-[#A94B45]/30 bg-[#A94B45]/10 text-[#A94B45]"
                              }`}
                            >
                              {won ? "Win" : draw ? "Draw" : "Loss"}
                            </span>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#18221E] dark:text-[#F4EFE3]">
                                  vs {opponentName}
                                </span>
                                {opponentRating && (
                                  <span className="font-mono text-[11px] text-[#69736C] dark:text-[#B5BDB5]">
                                    ({opponentRating})
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#69736C] dark:text-[#B5BDB5]">
                                {timeStr} • {game.moves?.length || 0} moves • {dateStr}
                              </span>
                            </div>
                          </div>

                          <Link
                            href={`/analysis?gameId=${game._id || game.roomId}`}
                            className="flex items-center gap-1 rounded-[12px] border border-[rgba(24,34,30,0.10)] dark:border-[rgba(255,255,255,0.1)] bg-[#F7F4EC] dark:bg-[#1B2A24] px-3 py-1.5 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:bg-[#EDE9DE] hover:text-[#B58A3A] transition"
                          >
                            <span>Analyze</span>
                            <ChevronRight size={13} />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Right 4 Columns: Friends Online & Arena Showcase */}
            <div className="lg:col-span-4 space-y-6">
              {/* Friends Online Section */}
              <section className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-6 shadow-[0_10px_35px_rgba(35,40,30,0.06)] space-y-4">
                <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] pb-3">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#B58A3A] dark:text-[#D3AA58]" />
                    <h3 className="text-base font-serif font-bold text-[#18221E] dark:text-[#F4EFE3]">
                      Friends Online
                    </h3>
                  </div>

                  <Link
                    href="/friends"
                    className="text-xs font-semibold text-[#18352B] dark:text-[#D3AA58] hover:text-[#B58A3A] transition"
                  >
                    View All
                  </Link>
                </div>

                {friendsLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((n) => (
                      <div key={n} className="h-12 rounded-[12px] bg-[#F7F4EC]/60 dark:bg-[#1B2A24]/60 animate-pulse border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)]" />
                    ))}
                  </div>
                ) : onlineFriends.length > 0 ? (
                  <div className="space-y-2.5">
                    {onlineFriends.map((f) => (
                      <div
                        key={f._id || f.id}
                        className="flex items-center justify-between rounded-[12px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#F7F4EC]/50 dark:bg-[#1B2A24]/50 p-3 hover:bg-[#F7F4EC] dark:hover:bg-[#1B2A24] transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F4EC] dark:bg-[#1B2A24] text-xs font-bold text-[#B58A3A] dark:text-[#D3AA58]">
                            {f.username?.slice(0, 2).toUpperCase()}
                            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white dark:border-[#21332B] bg-[#27815D]" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#18221E] dark:text-[#F4EFE3]">{f.username}</div>
                            <div className="font-mono text-[10px] text-[#69736C] dark:text-[#B5BDB5]">{f.rating || 1500} Elo</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveChallengeUser(f)}
                          className="rounded-[10px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] px-2.5 py-1 text-[11px] font-bold text-[#F7F4EC] transition cursor-pointer"
                        >
                          Duel
                        </button>
                      </div>
                    ))}
                  </div>
                ) : friends.length > 0 ? (
                  <div className="rounded-[12px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#F7F4EC]/40 dark:bg-[#1B2A24]/40 p-4 text-center space-y-2">
                    <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                      {friends.length} friend{friends.length > 1 ? "s" : ""} registered, but none are online right now.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsInviteOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-[#FBF9F3] dark:bg-[#21332B] px-3 py-1.5 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:bg-[#EDE9DE] transition cursor-pointer"
                    >
                      <UserPlus size={12} />
                      <span>Invite More</span>
                    </button>
                  </div>
                ) : (
                  <div className="rounded-[12px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#F7F4EC]/40 dark:bg-[#1B2A24]/40 p-4 text-center space-y-2">
                    <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                      Your friends list is currently empty.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <Link
                        href="/friends"
                        className="rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-[#FBF9F3] dark:bg-[#21332B] px-3 py-1.5 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:bg-[#EDE9DE] transition"
                      >
                        Find Friends
                      </Link>
                      <button
                        type="button"
                        onClick={() => setIsInviteOpen(true)}
                        className="rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] px-3 py-1.5 text-xs font-bold text-[#F7F4EC] transition shadow-xs cursor-pointer"
                      >
                        Invite
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Live Arena Invitation */}
              <section className="rounded-[20px] border border-[rgba(24,34,30,0.10)] bg-gradient-to-br from-[#18352B] to-[#13201B] p-6 text-white shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#D3AA58]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27815D] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#27815D]" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Live Arena
                  </span>
                </div>

                <h4 className="font-serif text-lg font-bold text-[#F4EFE3]">
                  Watch Real Duels
                </h4>

                <p className="text-xs text-[#B5BDB5] leading-relaxed">
                  Spectate active ChessVerse duels move-by-move with live evaluation and clock synchronization.
                </p>

                <div className="pt-2">
                  <Link
                    href="/watch"
                    className="inline-flex items-center gap-2 rounded-[12px] bg-[#B58A3A] hover:bg-[#9E742E] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#13201B] font-semibold transition"
                  >
                    <span>Enter Live Arena</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Matchmaking Searching Overlay */}
      {isSearching && (
        <MatchFinder
          timeControl={{
            initialTime: selectedTimeControl.initialTime,
            increment: selectedTimeControl.increment,
            label: `${selectedTimeControl.name} ${selectedTimeControl.label}`,
          }}
          playerRating={playerRating}
          onCancel={handleCancelMatchmaking}
        />
      )}

      {/* Match Found State */}
      {matchData && (
        <MatchFound
          gameId={matchData.gameId}
          playerName={playerName}
          playerRating={playerRating}
          opponentName={matchData.opponent.username}
          opponentRating={matchData.opponent.rating}
          timeControl={`${Math.round(matchData.timeControl.initialTime / 60)}+${matchData.timeControl.increment}`}
          playerColor={matchData.color}
        />
      )}

      {/* Challenge Drawer */}
      {activeChallengeUser && (
        <ChallengeModal
          isOpen={!!activeChallengeUser}
          onClose={() => setActiveChallengeUser(null)}
          targetUser={activeChallengeUser}
          mode="drawer"
        />
      )}

      {/* Invite Modal */}
      {isInviteOpen && (
        <InviteModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
        />
      )}

      <MobileBottomNav />
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-transparent text-[#B78A3B]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#B78A3B] border-t-transparent" />
        </div>
      }
    >
      <PlayContent />
    </Suspense>
  );
}
