"use client";

import { useEffect, useState, useMemo, use } from "react";
import Link from "next/link";
import ChessBoard from "@/components/game/ChessBoard/ChessBoard";
import EvaluationGraph from "@/components/game/EvaluationGraph";
import PositionCoachPanel from "@/components/coach/PositionCoachPanel";

type MoveAnalysis = {
  moveNumber: number;
  color: "white" | "black";
  playedMove: string;
  playedMoveUci?: string;
  fen: string;
  bestMove: string;
  evaluationBefore: number;
  evaluationAfter: number;
  classification:
    | "brilliant"
    | "best"
    | "excellent"
    | "good"
    | "inaccuracy"
    | "mistake"
    | "blunder"
    | "book";
  commentary?: string;
  advantageText?: string;
};

type FullAnalysis = {
  whiteAccuracy: number;
  blackAccuracy: number;
  whiteCounts: Record<string, number>;
  blackCounts: Record<string, number>;
  moves: MoveAnalysis[];
  keyMoments: MoveAnalysis[];
  summary: string;
  createdAt: string;
};

export default function GameReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const gameId = resolvedParams.id;

  const [game, setGame] = useState<any | null>(null);
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [depth, setDepth] = useState<"quick" | "normal" | "deep">("normal");
  const [error, setError] = useState<string | null>(null);

  // Fetch Game Details & Existing Analysis
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

        // 1. Fetch game details
        const gameRes = await fetch(`${apiUrl}/api/games/${gameId}`);
        if (gameRes.ok) {
          const gameData = await gameRes.json();
          setGame(gameData.game || gameData);
        }

        // 2. Fetch analysis report if existing
        const analysisRes = await fetch(`${apiUrl}/api/analysis/${gameId}`);
        if (analysisRes.ok) {
          const analysisData = await analysisRes.json();
          if (analysisData.analysis) {
            setAnalysis(analysisData.analysis);
          }
        }
      } catch (err: any) {
        console.error("Failed to load review data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [gameId]);

  // Keyboard Navigation: Left/Right arrow keys for moves
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!analysis || analysis.moves.length === 0) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentMoveIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentMoveIndex((prev) =>
          Math.min(analysis.moves.length - 1, prev + 1)
        );
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [analysis]);

  // Trigger Full Stockfish 18 Analysis
  async function handleRunAnalysis() {
    try {
      setAnalyzing(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("chessverse-token")
          : null;

      const res = await fetch(`${apiUrl}/api/analysis/${gameId}/full`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ depth }),
      });

      if (!res.ok) {
        throw new Error("Analysis failed. Server may be busy.");
      }

      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        setCurrentMoveIndex(0);
      } else {
        throw new Error(data.message || "Failed to parse analysis");
      }
    } catch (err: any) {
      setError(err.message || "Could not complete analysis.");
    } finally {
      setAnalyzing(false);
    }
  }

  const currentMove = useMemo(() => {
    if (!analysis || !analysis.moves || analysis.moves.length === 0) return null;
    return analysis.moves[currentMoveIndex] || analysis.moves[0];
  }, [analysis, currentMoveIndex]);

  const currentFen = useMemo(() => {
    if (currentMove) return currentMove.fen;
    if (game?.currentFen) return game.currentFen;
    return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  }, [currentMove, game]);

  const lastMoveSquares = useMemo(() => {
    if (!currentMove || !currentMove.playedMoveUci) return null;
    const uci = currentMove.playedMoveUci;
    return {
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
    };
  }, [currentMove]);

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent flex items-center justify-center text-[#171A18] animate-pageEnter">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded-full bg-[#B88A32] animate-ping" />
          <span className="text-sm font-semibold tracking-wide text-[#68706A]">Loading Game Review...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 text-[#171A18] animate-pageEnter">
      <div className="mx-auto max-w-7xl">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[rgba(30,30,20,0.08)] pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-[0.25em] text-[#B88A32]">
              <Link href="/games" className="hover:text-[#A07628] transition">
                Games
              </Link>
              <span>/</span>
              <span>Game Review</span>
            </div>
            <h1 className="mt-1 text-3xl font-serif font-bold tracking-tight text-[#171A18]">
              {game?.whitePlayerName || "White"} vs {game?.blackPlayerName || "Black"}
            </h1>
            <p className="mt-1 text-xs text-[#68706A]">
              Comprehensive Stockfish Engine Calculation & AI Coach Analysis
            </p>
          </div>

          {/* Analysis Action Controls */}
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-[#EFECE3] p-1 border border-[rgba(30,30,20,0.08)] text-xs">
              {(["quick", "normal", "deep"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDepth(d)}
                  className={`rounded-lg px-3 py-1.5 capitalize transition ${
                    depth === d
                      ? "bg-white font-semibold text-[#171A18] shadow-xs"
                      : "text-[#68706A] hover:text-[#171A18]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="rounded-xl bg-[#B88A32] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#A07628] disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {analyzing ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                  Calculating...
                </>
              ) : analysis ? (
                "Re-analyze Game"
              ) : (
                "Run Stockfish Analysis"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        {!analysis ? (
          <section className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-12 text-center max-w-2xl mx-auto my-12 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF6EE] text-[#B88A32] border border-[#B88A32]/20 text-xl font-bold">
              ♟
            </div>
            <h2 className="mt-5 text-xl font-serif font-bold text-[#171A18]">Ready for Deep Game Review</h2>
            <p className="mt-2 text-sm text-[#68706A] leading-relaxed">
              Run Stockfish analysis to inspect move-by-move accuracy, identify mistakes and blunders, and receive natural-language coaching on every turning point.
            </p>
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="mt-6 rounded-xl bg-[#B88A32] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#A07628] shadow-sm"
            >
              {analyzing ? "Analyzing with Stockfish..." : "Start Analysis"}
            </button>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            {/* Left Column: Board, Controls & Evaluation Graph */}
            <div className="space-y-6">
              {/* Chess Board Container */}
              <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-5 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
                <div className="mx-auto max-w-[500px]">
                  <ChessBoard
                    fen={currentFen}
                    orientation={flipped ? "black" : "white"}
                    lastMove={lastMoveSquares}
                  />
                </div>

                {/* Move Navigation Controls */}
                <div className="mt-5 flex items-center justify-between border-t border-[rgba(30,30,20,0.08)] pt-4">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentMoveIndex(0)}
                      disabled={currentMoveIndex === 0}
                      className="rounded-lg border border-[rgba(30,30,20,0.12)] bg-white px-3 py-1.5 text-xs font-semibold text-[#171A18] transition hover:bg-[#FAF8F2] disabled:opacity-30 shadow-xs"
                    >
                      ⏮ First
                    </button>
                    <button
                      onClick={() => setCurrentMoveIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentMoveIndex === 0}
                      className="rounded-lg border border-[rgba(30,30,20,0.12)] bg-white px-3 py-1.5 text-xs font-semibold text-[#171A18] transition hover:bg-[#FAF8F2] disabled:opacity-30 shadow-xs"
                    >
                      ◀ Prev
                    </button>
                    <button
                      onClick={() =>
                        setCurrentMoveIndex((prev) =>
                          Math.min(analysis.moves.length - 1, prev + 1)
                        )
                      }
                      disabled={currentMoveIndex === analysis.moves.length - 1}
                      className="rounded-lg border border-[rgba(30,30,20,0.12)] bg-white px-3 py-1.5 text-xs font-semibold text-[#171A18] transition hover:bg-[#FAF8F2] disabled:opacity-30 shadow-xs"
                    >
                      Next ▶
                    </button>
                    <button
                      onClick={() => setCurrentMoveIndex(analysis.moves.length - 1)}
                      disabled={currentMoveIndex === analysis.moves.length - 1}
                      className="rounded-lg border border-[rgba(30,30,20,0.12)] bg-white px-3 py-1.5 text-xs font-semibold text-[#171A18] transition hover:bg-[#FAF8F2] disabled:opacity-30 shadow-xs"
                    >
                      Last ⏭
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFlipped((prev) => !prev)}
                      className="rounded-lg border border-[rgba(30,30,20,0.12)] bg-white px-3 py-1.5 text-xs font-semibold text-[#68706A] transition hover:bg-[#FAF8F2] hover:text-[#171A18] shadow-xs"
                    >
                      ⇅ Flip Board
                    </button>
                  </div>
                </div>
              </div>

              {/* Evaluation Graph */}
              <EvaluationGraph
                moves={analysis.moves}
                currentMoveIndex={currentMoveIndex}
                onSelectMove={(idx: number) => setCurrentMoveIndex(idx)}
              />

              {/* Move Strip / Key Moment Chips */}
              <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-4 shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-[#68706A] mb-3 font-semibold">
                  Move Navigation Timeline
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {analysis.moves.map((m, idx) => {
                    const isSelected = idx === currentMoveIndex;
                    const isBlunder = m.classification === "blunder";
                    const isMistake = m.classification === "mistake";
                    const isBrilliant = m.classification === "brilliant";

                    let tagClass = "border-[rgba(30,30,20,0.10)] bg-white text-[#171A18]";
                    if (isBlunder) tagClass = "border-rose-400 bg-rose-50 text-rose-800";
                    else if (isMistake) tagClass = "border-amber-400 bg-amber-50 text-amber-800";
                    else if (isBrilliant) tagClass = "border-teal-400 bg-teal-50 text-teal-800";

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentMoveIndex(idx)}
                        className={`rounded-lg px-2 py-1 font-mono text-[11px] border transition ${tagClass} ${
                          isSelected ? "ring-2 ring-[#B88A32] font-bold" : "hover:border-[#B88A32]"
                        }`}
                      >
                        {Math.ceil(m.moveNumber / 2)}
                        {m.color === "white" ? "." : "..."} {m.playedMove}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Game Summary, Key Moments & AI Coach Sidecar */}
            <div className="space-y-6">
              {/* Game Summary & Accuracy Card */}
              <section className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-6 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B88A32] font-bold">
                  Game Summary
                </span>

                {/* Accuracy Bars */}
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-[#171A18]">
                        White ({game?.whitePlayerName || "White"})
                      </span>
                      <span className="font-mono font-bold text-[#B88A32]">
                        {analysis.whiteAccuracy}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#FAF8F2] border border-[rgba(30,30,20,0.06)]">
                      <div
                        className="h-full rounded-full bg-[#B88A32] transition-all duration-500"
                        style={{ width: `${analysis.whiteAccuracy}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-[#171A18]">
                        Black ({game?.blackPlayerName || "Black"})
                      </span>
                      <span className="font-mono font-bold text-[#285C4D]">
                        {analysis.blackAccuracy}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#FAF8F2] border border-[rgba(30,30,20,0.06)]">
                      <div
                        className="h-full rounded-full bg-[#285C4D] transition-all duration-500"
                        style={{ width: `${analysis.blackAccuracy}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Classification Counter Badges */}
                <div className="mt-5 grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-xl border border-teal-200 bg-teal-50 p-2">
                    <p className="text-[10px] text-teal-800 font-semibold font-mono">Brilliant</p>
                    <p className="mt-0.5 text-base font-bold text-teal-900 font-mono">
                      {(analysis.whiteCounts?.brilliant ?? 0) +
                        (analysis.blackCounts?.brilliant ?? 0)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2">
                    <p className="text-[10px] text-emerald-800 font-semibold font-mono">Best</p>
                    <p className="mt-0.5 text-base font-bold text-emerald-900 font-mono">
                      {(analysis.whiteCounts?.best ?? 0) +
                        (analysis.blackCounts?.best ?? 0)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-2">
                    <p className="text-[10px] text-amber-800 font-semibold font-mono">Mistakes</p>
                    <p className="mt-0.5 text-base font-bold text-amber-900 font-mono">
                      {(analysis.whiteCounts?.mistake ?? 0) +
                        (analysis.blackCounts?.mistake ?? 0)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-2">
                    <p className="text-[10px] text-rose-800 font-semibold font-mono">Blunders</p>
                    <p className="mt-0.5 text-base font-bold text-rose-900 font-mono">
                      {(analysis.whiteCounts?.blunder ?? 0) +
                        (analysis.blackCounts?.blunder ?? 0)}
                    </p>
                  </div>
                </div>

                {analysis.summary && (
                  <p className="mt-4 text-xs text-[#68706A] leading-relaxed border-t border-[rgba(30,30,20,0.06)] pt-3">
                    {analysis.summary}
                  </p>
                )}
              </section>

              {/* Position-Aware AI Coach Sidecar */}
              {currentMove && (
                <PositionCoachPanel
                  fen={currentMove.fen}
                  playedMove={currentMove.playedMove}
                  bestMove={currentMove.bestMove}
                  evaluationBefore={currentMove.evaluationBefore}
                  evaluationAfter={currentMove.evaluationAfter}
                  classification={currentMove.classification}
                  commentary={currentMove.commentary}
                  advantageText={currentMove.advantageText}
                  moveNumber={currentMove.moveNumber}
                  color={currentMove.color}
                />
              )}

              {/* Key Moments List */}
              <section className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-5 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#B88A32] font-bold mb-3">
                  Key Moments ({analysis.keyMoments?.length ?? 0})
                </p>

                {(!analysis.keyMoments || analysis.keyMoments.length === 0) ? (
                  <p className="text-xs text-[#68706A]">No critical blunders detected in this game.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {analysis.keyMoments.map((km, idx) => {
                      const isSelected =
                        currentMove?.moveNumber === km.moveNumber;
                      const isBlunder = km.classification === "blunder";
                      const isMistake = km.classification === "mistake";
                      const isBrilliant = km.classification === "brilliant";

                      let badgeText = km.classification.toUpperCase();
                      let badgeColor = "text-amber-800 border-amber-300 bg-amber-50";
                      if (isBlunder)
                        badgeColor = "text-rose-800 border-rose-300 bg-rose-50";
                      else if (isMistake)
                        badgeColor = "text-amber-800 border-amber-300 bg-amber-50";
                      else if (isBrilliant)
                        badgeColor = "text-teal-800 border-teal-300 bg-teal-50";

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            const foundIdx = analysis.moves.findIndex(
                              (m) => m.moveNumber === km.moveNumber
                            );
                            if (foundIdx !== -1) setCurrentMoveIndex(foundIdx);
                          }}
                          className={`flex items-center justify-between rounded-xl border p-2.5 text-xs cursor-pointer transition ${
                            isSelected
                              ? "border-[#B88A32] bg-[#FAF6EE]"
                              : "border-[rgba(30,30,20,0.08)] bg-white hover:border-[#B88A32]/40"
                          }`}
                        >
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-[#68706A]">
                              {Math.ceil(km.moveNumber / 2)}.
                            </span>
                            <span className="font-semibold text-[#171A18]">
                              {km.playedMove}
                            </span>
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[10px] uppercase font-mono font-bold border ${badgeColor}`}
                            >
                              {badgeText}
                            </span>
                          </div>

                          <span className="text-[11px] text-[#68706A] font-mono">
                            Better: <span className="font-semibold text-[#285C4D]">{km.bestMove}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
