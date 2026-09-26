"use client";

import React, { useState, useEffect } from "react";

export type PositionCoachProps = {
  fen: string;
  playedMove: string;
  bestMove: string;
  evaluationBefore: number;
  evaluationAfter: number;
  classification: string;
  commentary?: string;
  advantageText?: string;
  moveNumber: number;
  color: "white" | "black";
};

type CoachStyle = "beginner" | "intermediate" | "advanced";

const QUICK_QUESTIONS = [
  "Why was this a mistake?",
  "What should I have played?",
  "Explain this position",
  "What was my biggest weakness?",
  "How can I improve?",
];

const CLASSIFICATION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  brilliant: { bg: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-800 dark:text-cyan-300", border: "border-cyan-300 dark:border-cyan-800" },
  best: { bg: "bg-[#27815D]/15", text: "text-[#27815D]", border: "border-[#27815D]/30" },
  excellent: { bg: "bg-[#27815D]/10", text: "text-[#27815D]", border: "border-[#27815D]/20" },
  good: { bg: "bg-[#27815D]/10", text: "text-[#27815D]", border: "border-[#27815D]/20" },
  inaccuracy: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-800 dark:text-amber-300", border: "border-amber-300 dark:border-amber-800" },
  mistake: { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-800 dark:text-orange-300", border: "border-orange-300 dark:border-orange-800" },
  blunder: { bg: "bg-[#A94B45]/15", text: "text-[#A94B45]", border: "border-[#A94B45]/30" },
  missed_opportunity: { bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30", text: "text-fuchsia-800 dark:text-fuchsia-300", border: "border-fuchsia-300 dark:border-fuchsia-800" },
};

export default function PositionCoachPanel({
  fen,
  playedMove,
  bestMove,
  evaluationBefore,
  evaluationAfter,
  classification,
  commentary,
  advantageText,
  moveNumber,
  color,
}: PositionCoachProps) {
  const [style, setStyle] = useState<CoachStyle>("intermediate");
  const [loading, setLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [messages, setMessages] = useState<
    { sender: "user" | "coach"; text: string }[]
  >([]);

  // Reset or update coach insight when active move changes
  useEffect(() => {
    if (commentary) {
      setMessages([{ sender: "coach", text: commentary }]);
    } else {
      setMessages([
        {
          sender: "coach",
          text: `In this position, move ${playedMove} was classified as ${classification}.`,
        },
      ]);
    }
  }, [fen, playedMove, classification, commentary]);

  const askCoach = async (question: string) => {
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    setCustomQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen,
          playedMove,
          bestMove,
          evaluationBefore,
          evaluationAfter,
          classification,
          moveNumber,
          color,
          userQuestion: question,
          style,
        }),
      });

      if (!response.ok) throw new Error("Coach unavailable");
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "coach",
          text: data.reply || "Focus on controlling central squares and defending hanging pieces.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "coach",
          text: `Focus on candidate moves: ${bestMove} secures the advantage.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const badgeTheme =
    CLASSIFICATION_COLORS[classification.toLowerCase()] ||
    CLASSIFICATION_COLORS.good;

  const evalBeforeDisplay =
    evaluationBefore > 0 ? `+${evaluationBefore.toFixed(1)}` : evaluationBefore.toFixed(1);
  const evalAfterDisplay =
    evaluationAfter > 0 ? `+${evaluationAfter.toFixed(1)}` : evaluationAfter.toFixed(1);

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-5 shadow-[0_10px_35px_rgba(35,40,30,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#B58A3A] animate-pulse" />
            <h3 className="text-sm font-serif font-bold tracking-wide uppercase text-[#18352B] dark:text-[#F4EFE3]">
              AI Chess Coach
            </h3>
          </div>
          <p className="text-xs text-[#69736C] dark:text-[#B5BDB5] mt-0.5">Position-aware calculation explanation</p>
        </div>

        {/* Style Selector */}
        <div className="flex rounded-[10px] bg-[#F7F4EC] dark:bg-[#1B2A24] p-0.5 border border-[rgba(24,34,30,0.08)] dark:border-white/10 text-xs">
          {(["beginner", "intermediate", "advanced"] as CoachStyle[]).map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`rounded-[8px] px-2.5 py-1 capitalize transition cursor-pointer ${
                style === s
                  ? "bg-[#18352B] dark:bg-[#285443] font-semibold text-[#FBF9F3] shadow-xs"
                  : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18352B] dark:hover:text-[#F4EFE3]"
              }`}
            >
              {s.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Move Context Card */}
      <div className="mt-4 rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm text-[#18352B] dark:text-[#F4EFE3] font-semibold">
              {Math.ceil(moveNumber / 2)}. {playedMove}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border uppercase tracking-wider ${badgeTheme.bg} ${badgeTheme.text} ${badgeTheme.border}`}
            >
              {classification.replace("_", " ")}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-[#69736C] dark:text-[#B5BDB5]">
              {evalBeforeDisplay} → {evalAfterDisplay}
            </span>
          </div>
        </div>

        {bestMove && bestMove !== playedMove && (
          <div className="mt-2.5 flex items-center justify-between border-t border-[rgba(24,34,30,0.06)] dark:border-white/10 pt-2 text-xs">
            <span className="text-[#69736C] dark:text-[#B5BDB5]">Engine preferred:</span>
            <span className="font-mono font-semibold text-[#27815D]">
              {bestMove}
            </span>
          </div>
        )}

        {advantageText && (
          <p className="mt-1 text-[11px] text-[#69736C] dark:text-[#B5BDB5] italic">{advantageText}</p>
        )}
      </div>

      {/* Chat Messages */}
      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1 text-sm min-h-[140px] max-h-[220px]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-[14px] px-4 py-2.5 leading-relaxed text-xs ${
                m.sender === "user"
                  ? "bg-[#18352B] dark:bg-[#285443] text-[#FBF9F3] max-w-[85%] font-medium shadow-xs"
                  : "bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#18221E] dark:text-[#F4EFE3] border border-[rgba(24,34,30,0.08)] dark:border-white/10 max-w-[90%]"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#69736C] dark:text-[#B5BDB5]">
            <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-[#B58A3A]" />
            Analyzing position with Stockfish...
          </div>
        )}
      </div>

      {/* Context-Aware Quick Questions */}
      <div className="mt-4 border-t border-[rgba(24,34,30,0.08)] dark:border-white/10 pt-3">
        <p className="text-[10px] uppercase font-mono tracking-wider text-[#69736C] dark:text-[#B5BDB5] mb-2">
          Quick Questions
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => askCoach(q)}
              disabled={loading}
              className="rounded-[8px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-2.5 py-1 text-[11px] text-[#18221E] dark:text-[#F4EFE3] transition hover:border-[#B58A3A] hover:bg-[#FAF8F2] disabled:opacity-40 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          askCoach(customQuestion);
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          placeholder="Ask about this position..."
          className="min-w-0 flex-1 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#FAF8F2] dark:bg-[#172720] px-3.5 py-2 text-xs text-[#18221E] dark:text-[#F4EFE3] placeholder-[#69736C] outline-none focus:border-[#B58A3A] transition"
        />
        <button
          type="submit"
          disabled={loading || !customQuestion.trim()}
          className="rounded-[12px] bg-[#18352B] dark:bg-[#285443] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#285443] disabled:opacity-40 cursor-pointer"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
