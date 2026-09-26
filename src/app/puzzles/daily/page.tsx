"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Flame,
  Check,
  Trophy,
  Sparkles,
} from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import PuzzleBoard from "@/components/puzzles/PuzzleBoard";
import { apiFetch } from "@/lib/api";

const WEEKDAYS = [
  { day: "Mon", solved: true },
  { day: "Tue", solved: true },
  { day: "Wed", solved: true },
  { day: "Thu", solved: true },
  { day: "Fri", solved: true },
  { day: "Sat", solved: true },
  { day: "Sun", solved: true },
];

export default function DailyPuzzlePage() {
  const [puzzle, setPuzzle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(7);
  const [solvedToday, setSolvedToday] = useState(false);

  useEffect(() => {
    async function loadDaily() {
      try {
        const res = await apiFetch("/api/puzzles/daily");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.puzzle) {
            setPuzzle(data.puzzle);
          }
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadDaily();
  }, []);

  const handleSolved = (xp: number) => {
    setSolvedToday(true);
  };

  return (
    <div className="flex min-h-screen bg-transparent text-[#171A18] animate-pageEnter">
      <AppSidebar />

      <div className="min-w-0 flex-1 pb-16 md:pb-0">
        <AppHeader />

        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8 space-y-6">
          {/* Back link */}
          <Link
            href="/puzzles"
            className="inline-flex items-center gap-2 text-xs text-[#68706A] hover:text-[#171A18] transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Puzzles Hub</span>
          </Link>

          {/* Daily Puzzle Header & Streak */}
          <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 p-6 sm:p-7 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[rgba(30,30,20,0.08)] pb-5">
              <div>
                <div className="flex items-center gap-2 text-[#B88A32] text-[11px] font-bold uppercase tracking-[0.2em] mb-1">
                  <Calendar size={13} />
                  <span>DAILY PUZZLE</span>
                </div>
                <h1 className="text-2xl font-bold text-[#171A18] tracking-tight">
                  {puzzle?.title || "Daily Tactical Challenge"}
                </h1>
                <p className="text-xs text-[#68706A] mt-0.5">
                  Difficulty: <span className="font-mono text-[#B88A32] font-semibold">{puzzle?.rating || 1320}</span> · Earn +25 XP
                </p>
              </div>

              {/* 7-Day Streak Badge */}
              <div className="flex flex-col items-start sm:items-end">
                <div className="flex items-center gap-1.5 text-[#B88A32] font-bold text-sm font-mono">
                  <Flame size={16} className="fill-[#B88A32]" />
                  <span>{streak} day streak</span>
                </div>

                <div className="mt-2 flex items-center gap-1.5">
                  {WEEKDAYS.map((w) => (
                    <div
                      key={w.day}
                      className="flex flex-col items-center gap-1"
                    >
                      <span className="text-[9px] text-[#68706A]">{w.day}</span>
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <Check size={10} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Interactive Board */}
            <div className="pt-6">
              {loading ? (
                <div className="flex h-96 items-center justify-center text-xs text-[#68706A]">
                  Loading daily position...
                </div>
              ) : puzzle ? (
                <PuzzleBoard
                  puzzle={puzzle}
                  onSolved={handleSolved}
                  isDaily={true}
                />
              ) : (
                <div className="text-center py-12 text-sm text-[#68706A]">
                  Daily puzzle currently unavailable.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
