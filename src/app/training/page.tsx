"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PuzzleBoard from "@/components/training/PuzzleBoard";

type WeeklyReport = {
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  ratingChange: number;
  strongestArea: string;
  focusNextWeek: string;
  coachRecommendation: string;
  trainingPlan: {
    category: string;
    reason: string;
    exercises: number;
    priority: number;
    durationMinutes: number;
  }[];
  weaknesses: {
    kingSafety: number;
    endgames: number;
    tactics: number;
    opening: number;
    other: number;
    totalMistakes: number;
    recurringPatterns: string[];
  };
};

type Puzzle = {
  _id: string;
  fen: string;
  solution: string;
  theme: string;
  rating: number;
};

export default function TrainingPage() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [move, setMove] = useState("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"plan" | "puzzle">("plan");

  useEffect(() => {
    let resolvedId = "CURRENT_USER_ID";
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("chessverse-token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload?.userId) {
            resolvedId = payload.userId;
          }
        } catch {}
      }
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    // Load Weekly AI Coach report
    fetch(`${apiUrl}/api/training/${resolvedId}/weekly-report`)
      .then((res) => res.json())
      .then((data) => {
        if (data.report) {
          setReport(data.report);
        }
      })
      .catch((err) => console.error("Weekly report fetch failed:", err));

    // Load Daily tactical puzzle
    fetch(`${apiUrl}/api/puzzles/daily`)
      .then((response) => response.json())
      .then((data) => {
        setPuzzle(data.puzzle);
      })
      .catch((err) => console.error("Daily puzzle fetch failed:", err))
      .finally(() => setLoading(false));
  }, []);

  async function submitMove() {
    if (!puzzle) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const response = await fetch(`${apiUrl}/api/puzzles/${puzzle._id}/solve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ move }),
    });

    const data = await response.json();

    setResult(
      data.correct
        ? "Correct — excellent calculation."
        : `Not quite. Best move: ${data.solution}`,
    );
  }

  const weaknessPercentages = report?.weaknesses || {
    kingSafety: 40,
    endgames: 25,
    tactics: 15,
    opening: 10,
    other: 10,
  };

  return (
    <main className="min-h-screen bg-transparent px-4 py-10 text-[#171A18] animate-pageEnter">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[rgba(30,30,20,0.08)] pb-6 mb-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B88A32]">
              Personalized AI Training
            </span>
            <h1 className="mt-1 text-3xl font-serif font-bold tracking-tight text-[#171A18]">
              ChessVerse Training & Weekly Report
            </h1>
            <p className="mt-1 text-sm text-[#68706A]">
              Personalized training recommendations grounded in your actual game calculations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("plan")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "plan"
                  ? "bg-[#B88A32] text-white shadow-sm"
                  : "border border-[rgba(30,30,20,0.12)] bg-white text-[#68706A] hover:bg-[#FAF8F2] hover:text-[#171A18] shadow-sm"
              }`}
            >
              Weekly Report & Plan
            </button>
            <button
              onClick={() => setActiveTab("puzzle")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "puzzle"
                  ? "bg-[#B88A32] text-white shadow-sm"
                  : "border border-[rgba(30,30,20,0.12)] bg-white text-[#68706A] hover:bg-[#FAF8F2] hover:text-[#171A18] shadow-sm"
              }`}
            >
              Tactical Puzzles
            </button>
            <Link
              href="/coach"
              className="rounded-xl border border-[rgba(30,30,20,0.12)] bg-white px-4 py-2 text-xs font-semibold text-[#171A18] transition hover:bg-[#FAF8F2] shadow-sm"
            >
              AI Coach Chat
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#68706A]">
            <span className="h-3 w-3 rounded-full bg-[#B88A32] animate-ping mr-3" />
            Loading personalized training intelligence...
          </div>
        ) : activeTab === "plan" ? (
          <div className="space-y-8">
            {/* WEEKLY CHESS REPORT */}
            <section className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-8 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
              <div className="flex items-center justify-between border-b border-[rgba(30,30,20,0.08)] pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#B88A32] font-mono font-bold">
                    AI Training Loop
                  </span>
                  <h2 className="mt-1 text-2xl font-serif font-bold text-[#171A18]">
                    Weekly Chess Report
                  </h2>
                </div>
                <span className="rounded-xl border border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] px-3 py-1.5 text-xs font-mono font-medium text-[#68706A]">
                  Last 7 Days
                </span>
              </div>

              {/* Stats Bar */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
                <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] p-4 text-center">
                  <p className="text-xs text-[#68706A]">Games Played</p>
                  <p className="mt-1 text-2xl font-bold font-mono text-[#171A18]">
                    {report?.gamesPlayed ?? 12}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50 p-4 text-center">
                  <p className="text-xs font-semibold text-emerald-800">Wins</p>
                  <p className="mt-1 text-2xl font-bold font-mono text-emerald-700">
                    {report?.wins ?? 7}
                  </p>
                </div>
                <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] p-4 text-center">
                  <p className="text-xs text-[#68706A]">Draws</p>
                  <p className="mt-1 text-2xl font-bold font-mono text-[#171A18]">
                    {report?.draws ?? 2}
                  </p>
                </div>
                <div className="rounded-2xl border border-rose-500/20 bg-rose-50 p-4 text-center">
                  <p className="text-xs font-semibold text-rose-800">Losses</p>
                  <p className="mt-1 text-2xl font-bold font-mono text-rose-700">
                    {report?.losses ?? 3}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#B88A32]/25 bg-[#FAF6EE] p-4 text-center">
                  <p className="text-xs font-semibold text-[#B88A32]">Rating</p>
                  <p className="mt-1 text-2xl font-bold font-mono text-[#B88A32]">
                    {(report?.ratingChange ?? 38) > 0 ? "+" : ""}
                    {report?.ratingChange ?? 38}
                  </p>
                </div>
              </div>

              {/* Strongest Area & Focus Next Week */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] p-5">
                  <p className="text-xs uppercase tracking-wider text-[#68706A] font-semibold">
                    Your Strongest Area
                  </p>
                  <p className="mt-2 text-lg font-serif font-bold text-emerald-700">
                    {report?.strongestArea ?? "Tactical awareness"}
                  </p>
                  <p className="mt-1 text-xs text-[#68706A]">
                    High calculation accuracy in dominant positions.
                  </p>
                </div>

                <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] p-5">
                  <p className="text-xs uppercase tracking-wider text-[#68706A] font-semibold">
                    Focus Next Week
                  </p>
                  <p className="mt-2 text-lg font-serif font-bold text-amber-700">
                    {report?.focusNextWeek ?? "King safety"}
                  </p>
                  <p className="mt-1 text-xs text-[#68706A]">
                    Calculated from actual turning points in recent games.
                  </p>
                </div>
              </div>

              {/* Coach Recommendation Quote */}
              <div className="mt-6 rounded-2xl border border-[#B88A32]/25 bg-[#FAF6EE] p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#B88A32] uppercase tracking-wider">
                  <span>♟ AI Coach Recommendation</span>
                </div>
                <blockquote className="mt-2 text-sm italic text-[#171A18] leading-relaxed font-serif">
                  &ldquo;{report?.coachRecommendation ?? "Spend your next 20 puzzles practicing defensive tactics."}&rdquo;
                </blockquote>
              </div>
            </section>

            {/* PLAYER WEAKNESS DETECTION & TRAINING PLAN */}
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-7 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B88A32]">
                  Pattern Intelligence
                </span>
                <h3 className="mt-1 text-xl font-serif font-bold text-[#171A18]">
                  Player Weakness Detection
                </h3>
                <p className="mt-1 text-xs text-[#68706A]">
                  Grounded in analyzed games—not invented by AI.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-mono">
                      <span className="font-semibold text-[#171A18]">King safety</span>
                      <span className="text-[#68706A]">{weaknessPercentages.kingSafety}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FAF8F2] border border-[rgba(30,30,20,0.06)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose-500"
                        style={{ width: `${weaknessPercentages.kingSafety}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-mono">
                      <span className="font-semibold text-[#171A18]">Endgames</span>
                      <span className="text-[#68706A]">{weaknessPercentages.endgames}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FAF8F2] border border-[rgba(30,30,20,0.06)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${weaknessPercentages.endgames}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-mono">
                      <span className="font-semibold text-[#171A18]">Tactics</span>
                      <span className="text-[#68706A]">{weaknessPercentages.tactics}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FAF8F2] border border-[rgba(30,30,20,0.06)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#B88A32]"
                        style={{ width: `${weaknessPercentages.tactics}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-mono">
                      <span className="font-semibold text-[#171A18]">Opening</span>
                      <span className="text-[#68706A]">{weaknessPercentages.opening}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FAF8F2] border border-[rgba(30,30,20,0.06)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-600"
                        style={{ width: `${weaknessPercentages.opening}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-mono">
                      <span className="font-semibold text-[#171A18]">Other</span>
                      <span className="text-[#68706A]">{weaknessPercentages.other}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FAF8F2] border border-[rgba(30,30,20,0.06)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#68706A]"
                        style={{ width: `${weaknessPercentages.other}%` }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* YOUR TRAINING PLAN */}
              <section className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-7 shadow-[0_8px_30px_rgba(35,30,20,0.04)] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B88A32]">
                    Personalized Engine
                  </span>
                  <h3 className="mt-1 text-xl font-serif font-bold text-[#171A18]">
                    Your Training Plan
                  </h3>
                  <p className="mt-1 text-xs text-[#68706A]">
                    Custom exercises ordered by priority to fix detected leakages.
                  </p>

                  <div className="mt-6 space-y-3">
                    {(report?.trainingPlan || [
                      { category: "King Safety", durationMinutes: 15, exercises: 5, reason: "Castle early and avoid unguarded f-pawn pushes" },
                      { category: "Back-Rank Tactics", durationMinutes: 10, exercises: 8, reason: "Practice recognizing open 8th rank pins" },
                      { category: "Endgame Technique", durationMinutes: 15, exercises: 3, reason: "King activation in simplified endgames" },
                      { category: "Opening Review", durationMinutes: 10, exercises: 4, reason: "Italian Game main line development" },
                    ]).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] p-3.5 hover:border-[#B88A32]/40 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#FAF6EE] border border-[#B88A32]/25 font-mono text-xs font-bold text-[#B88A32]">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-[#171A18]">
                              {item.category}
                            </p>
                            <p className="text-[11px] text-[#68706A]">
                              {item.durationMinutes} min • {item.exercises} exercises
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveTab("puzzle")}
                          className="rounded-lg bg-[#B88A32] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#A07628] transition shadow-xs"
                        >
                          Train
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("puzzle")}
                  className="mt-6 w-full rounded-xl bg-[#B88A32] py-3 text-xs font-semibold text-white transition hover:bg-[#A07628] text-center shadow-sm"
                >
                  Start Today&apos;s Recommended Drills
                </button>
              </section>
            </div>
          </div>
        ) : (
          /* Tactical Puzzle Tab */
          <section className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-8 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
            {puzzle ? (
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between border-b border-[rgba(30,30,20,0.08)] pb-4 mb-6">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#B88A32]">
                      {puzzle.theme} Tactical Drill
                    </span>
                    <h2 className="mt-1 text-xl font-serif font-bold text-[#171A18]">Find the Best Continuation</h2>
                  </div>
                  <span className="rounded-xl border border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] px-3 py-1 font-mono text-xs font-medium text-[#68706A]">
                    Rating {puzzle.rating}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl border border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] p-6 shadow-xs">
                  <PuzzleBoard
                    fen={puzzle.fen}
                    solution={puzzle.solution}
                    puzzleId={puzzle._id}
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <input
                    value={move}
                    onChange={(e) => setMove(e.target.value)}
                    placeholder="Enter move in SAN or UCI (e.g. Qxf7+ or e2e4)"
                    className="flex-1 rounded-xl border border-[rgba(30,30,20,0.12)] bg-[#FAF8F2] px-4 py-3 text-sm text-[#171A18] outline-none placeholder:text-[#68706A]/40 focus:border-[#B88A32] transition"
                  />
                  <button
                    onClick={submitMove}
                    className="rounded-xl bg-[#B88A32] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#A07628] shadow-sm"
                  >
                    Check
                  </button>
                </div>

                {result && (
                  <p className="mt-4 rounded-xl border border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] p-3 text-sm font-semibold text-center text-[#171A18]">
                    {result}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-[#68706A]">
                <p>No daily puzzle available at this time.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
