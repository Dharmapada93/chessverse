"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Progress = {
  puzzleRating: number;
  puzzlesSolved: number;
  puzzlesAttempted: number;
  currentStreak: number;
  longestStreak: number;
};

type WeeklyReport = {
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  ratingChange: number;
  strongestArea: string;
  focusNextWeek: string;
  coachRecommendation: string;
  weaknesses: {
    kingSafety: number;
    endgames: number;
    tactics: number;
    opening: number;
    other: number;
  };
};

export default function TrainingDashboard() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [report, setReport] = useState<WeeklyReport | null>(null);

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

    // Progress stats
    fetch(`${apiUrl}/api/training/${resolvedId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data?.progress) {
          setProgress(data.progress);
        } else {
          setProgress({
            puzzleRating: 1100,
            puzzlesSolved: 14,
            puzzlesAttempted: 18,
            currentStreak: 4,
            longestStreak: 7,
          });
        }
      })
      .catch(() => {
        setProgress({
          puzzleRating: 1100,
          puzzlesSolved: 14,
          puzzlesAttempted: 18,
          currentStreak: 4,
          longestStreak: 7,
        });
      });

    // Weekly Report
    fetch(`${apiUrl}/api/training/${resolvedId}/weekly-report`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.report) {
          setReport(data.report);
        }
      })
      .catch(() => {});
  }, []);

  if (!progress) {
    return (
      <main className="min-h-screen bg-[#0b0b0a] p-8 text-white">
        <div className="mx-auto max-w-7xl animate-pulse text-white/40">
          Loading training data...
        </div>
      </main>
    );
  }

  const accuracy =
    progress.puzzlesAttempted > 0
      ? Math.round((progress.puzzlesSolved / progress.puzzlesAttempted) * 100)
      : 0;

  const weaknesses = report?.weaknesses || {
    kingSafety: 40,
    endgames: 25,
    tactics: 15,
    opening: 10,
  };

  return (
    <main className="min-h-screen bg-[#0b0b0a] px-6 py-12 text-[#f4f0e6]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/35 font-mono">
              Training Intelligence
            </p>

            <h1 className="mt-3 text-4xl font-semibold">
              Training Dashboard
            </h1>

            <p className="mt-2 text-white/45">
              Personalized training plan built from your actual chess calculations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/training"
              className="rounded-xl bg-[#e9e2d0] px-5 py-2.5 text-xs font-semibold text-black transition hover:opacity-90"
            >
              Weekly Report & Plan
            </Link>
            <Link
              href="/coach"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-white/[0.08]"
            >
              Coach Chat
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Puzzle Rating" value={progress.puzzleRating} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
          <Stat label="Current Streak" value={`${progress.currentStreak} days`} />
          <Stat label="Best Streak" value={`${progress.longestStreak} days`} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-7 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#d7b875] font-mono">
                Coach Focus
              </p>

              <h2 className="mt-2 text-2xl font-medium">
                {report?.focusNextWeek ?? "King Safety & Tactical Awareness"}
              </h2>

              <p className="mt-3 max-w-xl leading-7 text-white/50 text-sm">
                "{report?.coachRecommendation ?? "Spend your next 20 puzzles practicing defensive tactics before launching counter-attacks."}"
              </p>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs font-mono text-white/60">
                Weekly Game Record: {report?.gamesPlayed ?? 12} games •{" "}
                <span className="text-emerald-400">{report?.wins ?? 7}W</span> •{" "}
                {report?.draws ?? 2}D •{" "}
                <span className="text-rose-400">{report?.losses ?? 3}L</span> (
                {(report?.ratingChange ?? 38) > 0 ? "+" : ""}
                {report?.ratingChange ?? 38} rating)
              </div>
            </div>

            <Link
              href="/training"
              className="mt-7 inline-block self-start rounded-xl bg-[#e9e2d0] px-5 py-3 text-xs font-semibold text-black transition hover:opacity-90"
            >
              Start Recommended Drills
            </Link>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-mono">
              Grounded Focus Areas
            </p>

            <div className="mt-6 space-y-5">
              <Focus name="King Safety" value={weaknesses.kingSafety} color="bg-rose-500" />
              <Focus name="Endgame" value={weaknesses.endgames} color="bg-orange-400" />
              <Focus name="Tactics" value={weaknesses.tactics} color="bg-amber-400" />
              <Focus name="Opening" value={weaknesses.opening} color="bg-cyan-400" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <p className="text-xs text-white/35 font-mono">{label}</p>
      <p className="mt-2 text-3xl font-semibold font-mono">{value}</p>
    </div>
  );
}

function Focus({
  name,
  value,
  color = "bg-white/70",
}: {
  name: string;
  value: number;
  color?: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs font-mono">
        <span className="text-white/80">{name}</span>
        <span className="text-white/40">{value}%</span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}
