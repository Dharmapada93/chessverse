"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Cpu,
} from "lucide-react";
import { Chessboard } from "react-chessboard";
import type { GameAnalysis, PositionAnalysis } from "@/types/ai";
import EvaluationBar from "./EvaluationBar";
import MoveNavigator from "./MoveNavigator";
import AIChatPanel from "../AIChat/AIChatPanel";
import GameSummaryCard from "../GameSummary/GameSummaryCard";
import CriticalMomentsList from "../GameSummary/CriticalMomentsList";

interface AIAnalysisContainerProps {
  analysis: GameAnalysis;
  whitePlayerName?: string;
  blackPlayerName?: string;
  initialMoveIndex?: number;
}

export default function AIAnalysisContainer({
  analysis,
  whitePlayerName = "White",
  blackPlayerName = "Black",
  initialMoveIndex = 0,
}: AIAnalysisContainerProps) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(initialMoveIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showArrows, setShowArrows] = useState(true);
  const [activeTab, setActiveTab] = useState<"analysis" | "coach" | "summary">("analysis");

  const totalMoves = analysis.moves.length;

  const currentPosition: PositionAnalysis | undefined = useMemo(() => {
    if (!analysis.moves || analysis.moves.length === 0) return undefined;
    return analysis.moves[currentMoveIndex] ?? analysis.moves[0];
  }, [analysis.moves, currentMoveIndex]);

  const currentFen = useMemo(() => {
    if (currentPosition) return currentPosition.fen;
    return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  }, [currentPosition]);

  // Recommended engine move arrow
  const engineArrows = useMemo(() => {
    if (!showArrows || !currentPosition?.bestMove) return [];
    const best = currentPosition.bestMove.toLowerCase().replace(/[^a-h1-8]/g, "");
    if (best.length >= 4) {
      const from = best.slice(0, 2);
      const to = best.slice(2, 4);
      return [{ startSquare: from, endSquare: to, color: "rgba(181, 138, 58, 0.85)" }];
    }
    return [];
  }, [showArrows, currentPosition]);

  const evalScore = currentPosition?.evaluationAfter ?? 0;
  const formattedEval = evalScore > 0 ? `+${evalScore.toFixed(1)}` : evalScore.toFixed(1);

  const getClassificationBadge = (cls?: string) => {
    if (!cls) return null;
    const map: Record<string, { label: string; bg: string; text: string }> = {
      best: { label: "Best Move", bg: "bg-[#27815D]/15 border-[#27815D]/30", text: "text-[#27815D]" },
      brilliant: { label: "Brilliant", bg: "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-300 dark:border-cyan-800", text: "text-cyan-800 dark:text-cyan-300" },
      great: { label: "Great Move", bg: "bg-teal-50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-800", text: "text-teal-800 dark:text-teal-300" },
      good: { label: "Good", bg: "bg-[#27815D]/10 border-[#27815D]/20", text: "text-[#27815D]" },
      inaccuracy: { label: "Inaccuracy", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800", text: "text-amber-800 dark:text-amber-300" },
      mistake: { label: "Mistake", bg: "bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800", text: "text-orange-800 dark:text-orange-300" },
      blunder: { label: "Blunder", bg: "bg-[#A94B45]/15 border-[#A94B45]/30", text: "text-[#A94B45]" },
    };
    const conf = map[cls.toLowerCase()] || { label: cls, bg: "bg-[#F7F4EC] dark:bg-[#1B2A24] border-[rgba(24,34,30,0.12)] dark:border-white/10", text: "text-[#18221E] dark:text-[#F4EFE3]" };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${conf.bg} ${conf.text}`}>
        {conf.label}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 text-[#18221E] dark:text-[#F4EFE3]">
      {/* Top Integrated Analysis Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-white/10 pb-5">
        <div className="flex items-center gap-3.5">
          <Link
            href="/games"
            className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#18352B] dark:text-[#F4EFE3] hover:bg-[#FBF9F3] dark:hover:bg-[#23372F] transition shadow-xs cursor-pointer"
            title="Return to Games"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#69736C] dark:text-[#B5BDB5]">
                AI Analysis Studio
              </span>
              <span className="text-[10px] text-[#69736C] dark:text-[#B5BDB5]">•</span>
              <span className="text-xs font-mono font-semibold text-[#B58A3A]">
                {analysis.opening.name || "Custom Opening"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#18352B] dark:text-[#F4EFE3]">
              {whitePlayerName} vs {blackPlayerName}
            </h1>
          </div>
        </div>

        {/* Integrated Toolbar Actions: Analysis | Coach | Summary */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArrows((prev) => !prev)}
            className={`rounded-[12px] border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              showArrows
                ? "border-[#B58A3A] bg-[#B58A3A]/12 text-[#18352B] dark:text-[#F4EFE3]"
                : "border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18352B] dark:hover:text-[#F4EFE3]"
            }`}
          >
            Arrows {showArrows ? "ON" : "OFF"}
          </button>

          <div className="flex rounded-[12px] bg-[#F7F4EC] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.08)] dark:border-white/10 p-1 text-xs">
            <button
              onClick={() => setActiveTab("analysis")}
              className={`rounded-[10px] px-3.5 py-1.5 transition font-semibold cursor-pointer ${
                activeTab === "analysis"
                  ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18352B] dark:text-[#F4EFE3] shadow-xs"
                  : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18352B] dark:hover:text-[#F4EFE3]"
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => setActiveTab("coach")}
              className={`rounded-[10px] px-3.5 py-1.5 transition font-semibold flex items-center gap-1.5 cursor-pointer ${
                activeTab === "coach"
                  ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18352B] dark:text-[#F4EFE3] shadow-xs"
                  : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18352B] dark:hover:text-[#F4EFE3]"
              }`}
            >
              <MessageSquare size={13} />
              <span>Coach</span>
            </button>
            <button
              onClick={() => setActiveTab("summary")}
              className={`rounded-[10px] px-3.5 py-1.5 transition font-semibold cursor-pointer ${
                activeTab === "summary"
                  ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18352B] dark:text-[#F4EFE3] shadow-xs"
                  : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18352B] dark:hover:text-[#F4EFE3]"
              }`}
            >
              Summary
            </button>
          </div>
        </div>
      </div>

      {/* Main Analysis Workspace */}
      <div className="grid gap-8 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] items-start">
        {/* Left: Dominant Centerpiece Chessboard */}
        <div className="flex flex-col items-center w-full space-y-4">
          {/* Board + Eval Bar Assembly */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 w-full max-w-[560px]">
            {/* Smooth Eval Bar */}
            <div className="h-[340px] sm:h-[480px]">
              <EvaluationBar
                evaluation={evalScore}
                orientation={isFlipped ? "black" : "white"}
              />
            </div>

            {/* Chessboard */}
            <div className="relative w-full max-w-[500px] aspect-square rounded-[20px] p-2 bg-[#EFECE3] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.12)] dark:border-white/10 shadow-[0_10px_35px_rgba(35,40,30,0.06)]">
              <div className="w-full h-full rounded-[14px] overflow-hidden shadow-inner">
                <Chessboard
                  options={{
                    position: currentFen,
                    boardOrientation: isFlipped ? "black" : "white",
                    allowDragging: false,
                    arrows: engineArrows,
                    darkSquareStyle: { backgroundColor: "#8B6D4C" },
                    lightSquareStyle: { backgroundColor: "#F0D9B5" },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Clean Move Timeline Controls */}
          <div className="w-full max-w-[560px]">
            <MoveNavigator
              currentIndex={currentMoveIndex}
              totalMoves={totalMoves}
              onNavigate={(idx) => setCurrentMoveIndex(idx)}
              onFlipBoard={() => setIsFlipped((prev) => !prev)}
              isFlipped={isFlipped}
            />
          </div>

          {/* Compact Engine Status Bar */}
          <div className="w-full max-w-[560px] flex items-center justify-between rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] px-4 py-2.5 text-xs shadow-xs">
            <div className="flex items-center gap-2 text-[#69736C] dark:text-[#B5BDB5]">
              <Cpu size={14} className="text-[#B58A3A]" />
              <span className="font-semibold text-[#18352B] dark:text-[#F4EFE3]">Stockfish 18</span>
              <span>· Depth 16</span>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-[#69736C] dark:text-[#B5BDB5]">Eval:</span>
              <span className={`font-bold ${evalScore >= 0 ? "text-[#27815D]" : "text-[#18352B] dark:text-[#F4EFE3]"}`}>
                {formattedEval}
              </span>
              {currentPosition?.bestMove && (
                <>
                  <span className="text-[#69736C] dark:text-[#B5BDB5]">Best Line:</span>
                  <span className="text-[#18352B] dark:text-[#F4EFE3] font-bold">{currentPosition.bestMove}</span>
                </>
              )}
            </div>
          </div>

          {/* Move Steps Strip */}
          <div className="w-full max-w-[560px] rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-3 shadow-xs">
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {analysis.moves.map((m, idx) => {
                const isSelected = idx === currentMoveIndex;
                const isBlunder = m.classification === "blunder";
                const isMistake = m.classification === "mistake";
                const isBest = m.classification === "best" || m.classification === "brilliant";

                let badge = "text-[#18221E] dark:text-[#F4EFE3] border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24]";
                if (isBlunder) badge = "text-[#A94B45] border-[#A94B45]/25 bg-[#A94B45]/10";
                else if (isMistake) badge = "text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20";
                else if (isBest) badge = "text-[#27815D] border-[#27815D]/25 bg-[#27815D]/10";

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentMoveIndex(idx)}
                    className={`rounded-[8px] px-2.5 py-1 font-mono text-xs border transition cursor-pointer ${badge} ${
                      isSelected ? "ring-2 ring-[#B58A3A] font-bold shadow-xs" : "hover:border-[#B58A3A]/40"
                    }`}
                  >
                    <span className="text-[#69736C] dark:text-[#B5BDB5] mr-1">
                      {Math.ceil(m.moveNumber / 2)}{m.color === "white" ? "." : "..."}
                    </span>
                    <span>{m.playedMove}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: AI Explanation, Coach, or Summary Panel */}
        <div className="w-full space-y-4">
          {activeTab === "analysis" && currentPosition && (
            <div className="space-y-4">
              {/* Current Move Hero Row */}
              <div className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-5 space-y-3 shadow-[0_10px_35px_rgba(35,40,30,0.06)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl font-bold text-[#18352B] dark:text-[#F4EFE3]">
                      {currentPosition.playedMove || "Move"}
                    </span>
                    {getClassificationBadge(currentPosition.classification)}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#69736C] dark:text-[#B5BDB5] uppercase tracking-wider block">Evaluation</span>
                    <span className={`font-mono text-lg font-bold ${evalScore >= 0 ? "text-[#27815D]" : "text-[#18352B] dark:text-[#F4EFE3]"}`}>
                      {formattedEval}
                    </span>
                  </div>
                </div>

                {/* Human-Readable Explanation */}
                <div className="border-t border-[rgba(24,34,30,0.08)] dark:border-white/10 pt-3">
                  <p className="text-xs sm:text-sm text-[#18221E] dark:text-[#F4EFE3] leading-relaxed">
                    {currentPosition.whyExplanation ||
                      currentPosition.commentary ||
                      `${currentPosition.playedMove} controls key central squares and maintains piece coordination.`}
                  </p>
                </div>
              </div>

              {/* Best Move & Alternative Comparison */}
              <div className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-5 space-y-3 shadow-[0_10px_35px_rgba(35,40,30,0.06)]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] block">
                  Engine Recommendation
                </span>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#69736C] dark:text-[#B5BDB5]">Best move:</span>
                    <span className="font-mono font-bold text-[#27815D] bg-[#27815D]/10 px-2 py-0.5 rounded-[8px] border border-[#27815D]/20">
                      {currentPosition.bestMove || currentPosition.playedMove}
                    </span>
                  </div>
                  {currentPosition.alternativeLine && currentPosition.alternativeLine.length > 0 && (
                    <span className="text-[11px] text-[#69736C] dark:text-[#B5BDB5] font-mono">
                      Continuation: {currentPosition.alternativeLine.slice(0, 3).join(" ")}
                    </span>
                  )}
                </div>

                {(currentPosition.tacticalIdea || currentPosition.tacticalMotif?.description) && (
                  <div className="pt-2 text-xs text-[#69736C] dark:text-[#B5BDB5] border-t border-[rgba(24,34,30,0.08)] dark:border-white/10">
                    <span className="font-semibold text-[#B58A3A]">Tactical Idea: </span>
                    {currentPosition.tacticalIdea || currentPosition.tacticalMotif?.description}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "coach" && (
            <div className="rounded-[20px]">
              <AIChatPanel currentPosition={currentPosition} />
            </div>
          )}

          {activeTab === "summary" && (
            <div className="space-y-4">
              <GameSummaryCard
                analysis={analysis}
                whitePlayerName={whitePlayerName}
                blackPlayerName={blackPlayerName}
              />
              <CriticalMomentsList
                moments={analysis.criticalMoments}
                currentMoveNumber={currentPosition?.moveNumber}
                onSelectMoment={(moveNum) => {
                  const found = analysis.moves.findIndex((m) => m.moveNumber === moveNum);
                  if (found !== -1) {
                    setCurrentMoveIndex(found);
                    setActiveTab("analysis");
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
