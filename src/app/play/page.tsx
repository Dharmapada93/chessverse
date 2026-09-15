"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import {
  Bot,
  Swords,
  Plus,
  Users,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import { useStockfish } from "@/hooks/useStockfish";

const BOT_LEVELS = [
  { name: "Beginner", rating: "800", depth: 4, desc: "Fast moves, tactical oversights" },
  { name: "Club Player", rating: "1400", depth: 8, desc: "Solid fundamentals, occasional mistakes" },
  { name: "Master", rating: "2000", depth: 12, desc: "Strong positional play & deep tactics" },
  { name: "Stockfish 18", rating: "3200+", depth: 16, desc: "Full power single-threaded WASM" },
];

export default function PlayPage() {
  const [activeTab, setActiveTab] = useState<"ai" | "multiplayer">("ai");
  const [game, setGame] = useState(() => new Chess());
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [botLevel, setBotLevel] = useState(BOT_LEVELS[1]);
  const [isThinking, setIsThinking] = useState(false);
  const [gameStatus, setGameStatus] = useState("Your turn to move");
  const [joinCode, setJoinCode] = useState("");
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const { analysis, analyze, getBestMove } = useStockfish();
  const gameRef = useRef(game);
  gameRef.current = game;

  const makeBotMove = useCallback(async (currentGame: Chess) => {
    if (currentGame.isGameOver()) return;

    setIsThinking(true);
    setGameStatus(`${botLevel.name} is calculating...`);

    try {
      const fen = currentGame.fen();
      const bestMoveUci = await getBestMove(fen, botLevel.depth);

      if (!bestMoveUci) {
        setIsThinking(false);
        return;
      }

      const from = bestMoveUci.slice(0, 2);
      const to = bestMoveUci.slice(2, 4);
      const promotion = bestMoveUci.length > 4 ? bestMoveUci[4] : undefined;

      const updated = new Chess(gameRef.current.fen());
      const moveResult = updated.move({ from, to, promotion: promotion ?? "q" });

      if (moveResult) {
        setGame(updated);
        setMoveHistory(updated.history());
        analyze(updated.fen(), 12);

        if (updated.isCheckmate()) {
          setGameStatus("Checkmate! " + botLevel.name + " wins.");
        } else if (updated.isDraw()) {
          setGameStatus("Game drawn!");
        } else if (updated.inCheck()) {
          setGameStatus("Check! Your turn.");
        } else {
          setGameStatus("Your turn to move");
        }
      }
    } catch {
      setGameStatus("Your turn to move");
    } finally {
      setIsThinking(false);
    }
  }, [botLevel, getBestMove, analyze]);

  function handlePlayerMove(sourceSquare: string, targetSquare: string) {
    if (isThinking || game.isGameOver()) return false;

    const currentTurn = game.turn() === "w" ? "white" : "black";
    if (currentTurn !== playerColor) return false;

    try {
      const copy = new Chess(game.fen());
      const move = copy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (!move) return false;

      setGame(copy);
      setMoveHistory(copy.history());
      analyze(copy.fen(), 12);

      if (copy.isCheckmate()) {
        setGameStatus("Checkmate! You win!");
        return true;
      } else if (copy.isDraw()) {
        setGameStatus("Game drawn!");
        return true;
      }

      // Trigger bot move
      setTimeout(() => {
        makeBotMove(copy);
      }, 400);

      return true;
    } catch {
      return false;
    }
  }

  function startNewGame(newColor = playerColor) {
    const fresh = new Chess();
    setGame(fresh);
    setMoveHistory([]);
    setPlayerColor(newColor);
    analyze(fresh.fen(), 12);

    if (newColor === "black") {
      setGameStatus(`${botLevel.name} plays first...`);
      setTimeout(() => {
        makeBotMove(fresh);
      }, 500);
    } else {
      setGameStatus("Your turn to move");
    }
  }

  useEffect(() => {
    analyze(game.fen(), 12);
  }, [analyze, game]);

  const evalScore = analysis
    ? analysis.mate != null
      ? `M${analysis.mate}`
      : `${analysis.score > 0 ? "+" : ""}${(analysis.score / 100).toFixed(1)}`
    : "0.0";

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-[#f4f1e9]">
      <AppSidebar />

      <div className="min-w-0 flex-1">
        <AppHeader />

        <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
          {/* Header & Tabs */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[#d7b875]">
                <Swords size={18} />
                <span className="text-xs uppercase tracking-[0.2em] font-medium">
                  Battle Arena
                </span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">Play Chess</h1>
              <p className="mt-1 text-sm text-white/40">
                Challenge Stockfish 18 AI or create a live multiplayer room with friends.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="inline-flex rounded-xl border border-white/10 bg-[#11110f] p-1">
              <button
                onClick={() => setActiveTab("ai")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === "ai"
                    ? "bg-[#d7b875] text-black shadow"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Bot size={16} />
                vs Stockfish AI
              </button>

              <button
                onClick={() => setActiveTab("multiplayer")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === "multiplayer"
                    ? "bg-[#d7b875] text-black shadow"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Users size={16} />
                Multiplayer Room
              </button>
            </div>
          </div>

          {activeTab === "ai" ? (
            /* AI Arena */
            <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
              {/* Chess Board Container */}
              <div className="rounded-2xl border border-white/10 bg-[#11110f] p-6">
                {/* Board Top Status */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-[#d7b875]">
                      <Bot size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{botLevel.name}</span>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">
                          {botLevel.rating} ELO
                        </span>
                      </div>
                      <p className="text-xs text-white/35">
                        {isThinking ? "Thinking deeply..." : "Waiting for move"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Live Eval pill */}
                    <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-mono font-semibold">
                      <Sparkles size={13} className="text-[#d7b875]" />
                      <span>Eval: {evalScore}</span>
                      {analysis?.depth && (
                        <span className="text-white/30 text-[10px]">
                          d{analysis.depth}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => startNewGame()}
                      title="Reset Board"
                      className="rounded-lg border border-white/10 p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>

                {/* The Board */}
                <div className="relative mx-auto max-w-[540px] overflow-hidden rounded-xl border border-white/10 shadow-2xl">
                  <Chessboard
                    options={{
                      position: game.fen(),
                      boardOrientation: playerColor,
                      onPieceDrop: ({ sourceSquare, targetSquare }) => {
                        if (!targetSquare) return false;
                        return handlePlayerMove(sourceSquare, targetSquare);
                      },
                      allowDragging: !isThinking && !game.isGameOver(),
                      darkSquareStyle: { backgroundColor: "#8f7651" },
                      lightSquareStyle: { backgroundColor: "#e7d8b8" },
                    }}
                  />

                  {isThinking && (
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 py-2 text-center text-xs font-medium text-[#d7b875] backdrop-blur-sm">
                      {botLevel.name} is calculating response...
                    </div>
                  )}
                </div>

                {/* Player Bar */}
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d7b875]/15 text-xs font-semibold text-[#d7b875]">
                      YOU
                    </div>
                    <div>
                      <p className="text-sm font-medium">You (Playing {playerColor})</p>
                      <p className="text-xs text-[#d7b875]">{gameStatus}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startNewGame(playerColor === "white" ? "black" : "white")}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
                    >
                      Play as {playerColor === "white" ? "Black" : "White"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Engine Controls & Move History */}
              <div className="space-y-6">
                {/* Bot Level Selection */}
                <div className="rounded-2xl border border-white/10 bg-[#11110f] p-5">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/40">
                    Engine Difficulty
                  </h3>
                  <div className="space-y-2">
                    {BOT_LEVELS.map((level) => {
                      const isSelected = botLevel.name === level.name;
                      return (
                        <button
                          key={level.name}
                          onClick={() => {
                            setBotLevel(level);
                          }}
                          className={`w-full rounded-xl border p-3.5 text-left transition ${
                            isSelected
                              ? "border-[#d7b875]/50 bg-[#171714] text-white"
                              : "border-white/5 bg-white/[0.02] text-white/60 hover:bg-white/[0.04] hover:text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{level.name}</span>
                            <span className="font-mono text-xs text-[#d7b875]">
                              {level.rating}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-white/35">{level.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Move Notation Sheet */}
                <div className="rounded-2xl border border-white/10 bg-[#11110f] p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
                      Move History
                    </h3>
                    <span className="text-xs text-white/30">
                      {Math.ceil(moveHistory.length / 2)} moves
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto rounded-xl border border-white/5 bg-black/30 p-3 font-mono text-xs">
                    {moveHistory.length === 0 ? (
                      <p className="text-white/20 italic">No moves played yet</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-white/25">{i + 1}.</span>
                            <span className="text-white/80">{moveHistory[i * 2]}</span>
                            {moveHistory[i * 2 + 1] && (
                              <span className="text-white/50">{moveHistory[i * 2 + 1]}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Engine Info Box */}
                <div className="rounded-2xl border border-white/10 bg-[#11110f] p-5 text-xs text-white/40">
                  <div className="flex items-center gap-2 font-medium text-white/80">
                    <ShieldAlert size={15} className="text-[#d7b875]" />
                    Client-Side Stockfish 18.0.8 WASM
                  </div>
                  <p className="mt-2 leading-relaxed text-white/35">
                    This game runs directly in your browser using single-threaded WebAssembly with zero network latency.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Multiplayer Hub */
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#11110f] p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d7b875]/10 text-[#d7b875]">
                  <Plus size={24} />
                </div>
                <h2 className="mt-5 text-xl font-semibold">Create Private Room</h2>
                <p className="mt-2 text-sm text-white/40 leading-relaxed">
                  Generate a custom game room with custom time controls (Blitz, Rapid, Bullet), server clocks, and spectator access.
                </p>
                <Link
                  href="/room/create"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#d7b875] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Create New Room
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#11110f] p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] text-white">
                  <Users size={24} />
                </div>
                <h2 className="mt-5 text-xl font-semibold">Join with Room Code</h2>
                <p className="mt-2 text-sm text-white/40 leading-relaxed">
                  Have a room invite code from a friend? Enter it below to join as player or live spectator.
                </p>

                <div className="mt-6 flex gap-3">
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CV-4821"
                    maxLength={10}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm uppercase outline-none placeholder:text-white/20 focus:border-[#d7b875]/50"
                  />
                  <Link
                    href={joinCode ? `/room/${joinCode}` : "#"}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition ${
                      joinCode
                        ? "bg-white text-black hover:bg-white/90"
                        : "bg-white/10 text-white/30 cursor-not-allowed"
                    }`}
                  >
                    Join
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
