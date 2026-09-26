"use client";

import { use, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Share2, Heart, Copy, Check, X, Users } from "lucide-react";
import { Chessboard } from "react-chessboard";
import { socket } from "@/lib/socket";
import { apiFetch } from "@/lib/api";
import GameChat from "@/components/game/GameChat";

type PlayerInfo = {
  id?: string;
  name: string;
  rating: number;
};

type MoveItem = {
  from: string;
  to: string;
  san?: string;
};

export default function SpectatorGameRoom({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const resolvedParams = use(params);
  const gameId = resolvedParams.gameId;

  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  const [whitePlayer, setWhitePlayer] = useState<PlayerInfo>({
    name: "White",
    rating: 1500,
  });
  const [blackPlayer, setBlackPlayer] = useState<PlayerInfo>({
    name: "Black",
    rating: 1500,
  });
  const [whiteTime, setWhiteTime] = useState(10 * 60 * 1000);
  const [blackTime, setBlackTime] = useState(10 * 60 * 1000);
  const [activeColor, setActiveColor] = useState<"w" | "b">("w");
  const [moves, setMoves] = useState<MoveItem[]>([]);
  const [spectatorCount, setSpectatorCount] = useState(1);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);

  // Initial load via REST API
  useEffect(() => {
    async function loadGameDetails() {
      try {
        const res = await apiFetch(`/api/games/${gameId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.game) {
            const g = data.game;
            if (g.fen || g.currentFen) setFen(g.fen || g.currentFen);
            if (g.whitePlayerName) {
              setWhitePlayer({
                id: g.whitePlayerId,
                name: g.whitePlayerName,
                rating: g.whiteRating || 1500,
              });
            }
            if (g.blackPlayerName) {
              setBlackPlayer({
                id: g.blackPlayerId,
                name: g.blackPlayerName,
                rating: g.blackRating || 1500,
              });
            }
            if (g.whiteTimeMs) setWhiteTime(g.whiteTimeMs);
            if (g.blackTimeMs) setBlackTime(g.blackTimeMs);
            if (g.moves) setMoves(g.moves);
            if (g.result) setGameResult(g.result);
          }
        }
      } catch {}
    }

    loadGameDetails();
  }, [gameId]);

  // Socket connection for live spectator state
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("chessverse-token")
        : null;

    if (!socket.connected) {
      if (token) socket.auth = { token };
      socket.connect();
    }

    // Join room specifically as spectator
    socket.emit("game:join", {
      gameId,
      role: "spectator",
    });

    function onGameState(state: any) {
      if (state.fen) setFen(state.fen);
      if (state.whitePlayer) setWhitePlayer(state.whitePlayer);
      if (state.blackPlayer) setBlackPlayer(state.blackPlayer);
      if (state.moves) setMoves(state.moves);
      if (state.clock) {
        setWhiteTime(state.clock.whiteRemaining);
        setBlackTime(state.clock.blackRemaining);
        setActiveColor(state.clock.turn === "b" ? "b" : "w");
      } else if (state.clocks) {
        setWhiteTime(state.clocks.whiteTime);
        setBlackTime(state.clocks.blackTime);
        setActiveColor(state.clocks.activeColor === "b" ? "b" : "w");
      }
      if (state.status === "finished" && state.result) {
        setGameResult(state.result);
      }
    }

    function onGameClock(clock: any) {
      if (clock.whiteTime !== undefined) setWhiteTime(clock.whiteTime);
      if (clock.blackTime !== undefined) setBlackTime(clock.blackTime);
      if (clock.activeColor) setActiveColor(clock.activeColor === "b" ? "b" : "w");
    }

    function onViewers(data: { count: number }) {
      if (typeof data?.count === "number") {
        setSpectatorCount(Math.max(1, data.count));
      }
    }

    function onGameFinished(data: any) {
      if (data?.result) setGameResult(data.result);
    }

    socket.on("game:state", onGameState);
    socket.on("game:clock", onGameClock);
    socket.on("game:viewers", onViewers);
    socket.on("game:finished", onGameFinished);

    return () => {
      socket.off("game:state", onGameState);
      socket.off("game:clock", onGameClock);
      socket.off("game:viewers", onViewers);
      socket.off("game:finished", onGameFinished);
    };
  }, [gameId]);

  // Local clock decrement for active turn
  useEffect(() => {
    if (gameResult) return;

    const timer = setInterval(() => {
      if (activeColor === "w") {
        setWhiteTime((t) => Math.max(0, t - 1000));
      } else {
        setBlackTime((t) => Math.max(0, t - 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeColor, gameResult]);

  function formatTime(ms: number) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // Format move pairs (1. e4 e5 ...)
  const formattedMovePairs: { moveNumber: number; white: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    formattedMovePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moves[i]?.san || `${moves[i]?.from}-${moves[i]?.to}`,
      black: moves[i + 1] ? (moves[i + 1]?.san || `${moves[i + 1]?.from}-${moves[i + 1]?.to}`) : undefined,
    });
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/watch/${gameId}`
      : `https://chessverse.com/watch/${gameId}`;

  function handleCopyShareLink() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-6 sm:px-8 text-[#171A18] animate-pageEnter">
      <div className="mx-auto max-w-6xl">
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between border-b border-[rgba(30,30,20,0.08)] pb-4">
          <div className="flex items-center gap-4">
            <Link
              href="/watch"
              className="rounded-xl border border-[rgba(30,30,20,0.12)] bg-white p-2 text-[#68706A] transition hover:bg-[#FAF8F2] hover:text-[#171A18] shadow-sm"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  SPECTATING
                </span>
                <span className="font-mono text-xs text-[#68706A]">
                  #{gameId.slice(-6).toUpperCase()}
                </span>
              </div>
              <h1 className="mt-1 text-xl font-serif font-bold tracking-tight text-[#171A18]">
                {blackPlayer.name} vs {whitePlayer.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                isFollowing
                  ? "border-[#B88A32] bg-[#FAF6EE] text-[#B88A32] shadow-sm"
                  : "border-[rgba(30,30,20,0.12)] bg-white text-[#68706A] hover:bg-[#FAF8F2] hover:text-[#171A18] shadow-sm"
              }`}
            >
              <Heart size={14} className={isFollowing ? "fill-[#B88A32]" : ""} />
              {isFollowing ? "Following" : "Follow Game"}
            </button>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[rgba(30,30,20,0.12)] bg-white px-3.5 py-2 text-xs font-semibold text-[#171A18] transition hover:bg-[#FAF8F2] shadow-sm"
            >
              <Share2 size={14} />
              Share
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Main Board Container */}
          <div className="flex flex-col items-center">
            {/* BLACK PLAYER BAR */}
            <div className="flex w-full max-w-[540px] items-center justify-between rounded-xl border border-[rgba(30,30,20,0.08)] bg-white/90 p-3.5 mb-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full border border-[rgba(30,30,20,0.4)] bg-[#171A18]" />
                <div>
                  <p className="text-sm font-semibold text-[#171A18]">{blackPlayer.name}</p>
                  <p className="font-mono text-xs text-[#68706A]">Rating: {blackPlayer.rating}</p>
                </div>
              </div>

              <div
                className={`font-mono text-base font-bold px-3 py-1 rounded-lg ${
                  activeColor === "b" && !gameResult
                    ? "bg-[#FAF6EE] text-[#B88A32] border border-[#B88A32]/40"
                    : "bg-[#FAF8F2] text-[#68706A]"
                }`}
              >
                {formatTime(blackTime)}
              </div>
            </div>

            {/* CHESSBOARD (Strictly read-only for spectators) */}
            <div className="relative w-full max-w-[540px] overflow-hidden rounded-2xl border border-[rgba(30,30,20,0.12)] shadow-[0_16px_50px_rgba(35,30,20,0.08)]">
              <Chessboard
                options={{
                  position: fen,
                  boardOrientation: "white",
                  allowDragging: false,
                  darkSquareStyle: { backgroundColor: "#7A9A60" },
                  lightSquareStyle: { backgroundColor: "#F0E6D2" },
                }}
              />

              {gameResult && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF8F2]/90 backdrop-blur-sm">
                  <span className="text-2xl font-serif font-bold text-[#171A18]">Game Over</span>
                  <span className="mt-1 font-mono text-sm font-semibold text-[#B88A32]">{gameResult}</span>
                </div>
              )}
            </div>

            {/* WHITE PLAYER BAR */}
            <div className="flex w-full max-w-[540px] items-center justify-between rounded-xl border border-[rgba(30,30,20,0.08)] bg-white/90 p-3.5 mt-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full border border-[rgba(30,30,20,0.2)] bg-white shadow-xs" />
                <div>
                  <p className="text-sm font-semibold text-[#171A18]">{whitePlayer.name}</p>
                  <p className="font-mono text-xs text-[#68706A]">Rating: {whitePlayer.rating}</p>
                </div>
              </div>

              <div
                className={`font-mono text-base font-bold px-3 py-1 rounded-lg ${
                  activeColor === "w" && !gameResult
                    ? "bg-[#FAF6EE] text-[#B88A32] border border-[#B88A32]/40"
                    : "bg-[#FAF8F2] text-[#68706A]"
                }`}
              >
                {formatTime(whiteTime)}
              </div>
            </div>

            {/* Spectator Count Bar */}
            <div className="mt-4 flex items-center gap-2 rounded-full border border-[rgba(30,30,20,0.08)] bg-white/80 px-4 py-1.5 text-xs font-medium text-[#68706A] shadow-xs">
              <Eye size={14} className="text-[#B88A32]" />
              <span>{spectatorCount} watching live</span>
            </div>
          </div>

          {/* Sidebar: Move list & Live Chat */}
          <div className="space-y-6">
            {/* Move List */}
            <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/90 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[rgba(30,30,20,0.08)] pb-3">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#B88A32]">
                  Moves
                </span>
                <span className="font-mono text-xs text-[#68706A]">
                  {formattedMovePairs.length} turns
                </span>
              </div>

              <div className="mt-3 max-h-52 space-y-1 overflow-y-auto pr-1 font-mono text-xs">
                {formattedMovePairs.length === 0 ? (
                  <p className="py-4 text-center text-[#68706A]">Game has not started yet.</p>
                ) : (
                  formattedMovePairs.map((pair) => (
                    <div
                      key={pair.moveNumber}
                      className="grid grid-cols-[36px_1fr_1fr] py-1 text-[#171A18]"
                    >
                      <span className="text-[#68706A]">{pair.moveNumber}.</span>
                      <span className="font-semibold text-[#171A18]">{pair.white}</span>
                      <span className="text-[#68706A]">{pair.black || "—"}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live Chat */}
            <GameChat gameId={gameId} />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => setIsShareModalOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[rgba(30,30,20,0.12)] bg-[#FAF8F2] p-6 shadow-[0_16px_50px_rgba(35,30,20,0.15)]">
            <div className="flex items-center justify-between border-b border-[rgba(30,30,20,0.08)] pb-4">
              <h3 className="text-base font-semibold text-[#171A18]">Share this game</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="rounded p-1 text-[#68706A] hover:text-[#171A18]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5">
              <p className="text-xs text-[#68706A]">
                Share this spectator link with peers to watch the match in real time.
              </p>

              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[rgba(30,30,20,0.12)] bg-white p-2.5">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent font-mono text-xs text-[#171A18] outline-none select-all"
                />

                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="flex items-center gap-1.5 rounded-lg bg-[#B88A32] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#A07628] shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check size={13} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
