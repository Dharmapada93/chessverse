"use client";

import { useEffect, useState } from "react";
import {
  BrainCircuit,
  ArrowRight,
} from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import PuzzleBoard from "@/components/puzzles/PuzzleBoard";
import { apiFetch } from "@/lib/api";

type PuzzleStats = {
  puzzleRating: number;
  solvedCount?: number;
  currentStreak?: number;
};

export default function PuzzlesHubPage() {
  const [currentPuzzle, setCurrentPuzzle] = useState<any>(null);
  const [stats, setStats] = useState<PuzzleStats>({
    puzzleRating: 1500,
    solvedCount: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  async function loadPuzzleAndStats() {
    setLoading(true);
    try {
      const [puzzleRes, statsRes] = await Promise.all([
        apiFetch("/api/puzzles/daily"),
        apiFetch("/api/puzzles/stats"),
      ]);

      if (puzzleRes.ok) {
        const pData = await puzzleRes.json();
        if (pData.success && pData.puzzle) {
          setCurrentPuzzle(pData.puzzle);
        }
      }

      if (statsRes.ok) {
        const sData = await statsRes.json();
        if (sData.success && sData.stats) {
          setStats({
            puzzleRating: sData.stats.puzzleRating || 1500,
            solvedCount: sData.stats.solvedCount || 0,
            currentStreak: sData.stats.currentStreak || 0,
          });
        }
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPuzzleAndStats();
  }, []);

  const handleNextPuzzle = async () => {
    try {
      const res = await apiFetch("/api/puzzles/random");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.puzzle) {
          setCurrentPuzzle(data.puzzle);
        }
      }
    } catch {}
  };

  return (
    <div className="flex min-h-screen bg-transparent text-[#18221E] dark:text-[#F4EFE3] animate-pageEnter">
      <AppSidebar />

      <div className="min-w-0 flex-1 pb-16 md:pb-0">
        <AppHeader />

        <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[rgba(24,34,30,0.10)] dark:border-[rgba(255,255,255,0.08)] pb-6 gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[#B58A3A] dark:text-[#D3AA58]">
                <BrainCircuit size={16} />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#B58A3A] dark:text-[#D3AA58]">
                  TACTICAL STUDIO
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3]">
                Puzzles & Combinations
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#69736C] dark:text-[#B5BDB5]">
                Calculate decisive combinations from actual tournament and master positions.
              </p>
            </div>

            {/* Real Stats Badge */}
            <div className="flex items-center gap-3 rounded-[14px] border border-[rgba(24,34,30,0.10)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-3 px-4 shadow-xs">
              <div>
                <span className="text-[10px] text-[#69736C] dark:text-[#B5BDB5] uppercase tracking-wider block">
                  Puzzle Rating
                </span>
                <span className="font-mono text-xl font-bold text-[#B58A3A] dark:text-[#D3AA58]">
                  {stats.puzzleRating}
                </span>
              </div>
              <div className="border-l border-[rgba(24,34,30,0.10)] dark:border-[rgba(255,255,255,0.08)] pl-3">
                <span className="text-[10px] text-[#69736C] dark:text-[#B5BDB5] uppercase tracking-wider block">
                  Streak
                </span>
                <span className="font-mono text-xl font-bold text-[#18221E] dark:text-[#F4EFE3]">
                  {stats.currentStreak}
                </span>
              </div>
            </div>
          </div>

          {/* Centerpiece: Large Board Puzzle Workspace */}
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#B58A3A] dark:border-[#D3AA58] border-t-transparent" />
            </div>
          ) : currentPuzzle ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
              {/* Board Area */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-[520px]">
                  <PuzzleBoard
                    puzzle={currentPuzzle}
                    onNext={handleNextPuzzle}
                  />
                </div>
              </div>

              {/* Puzzle Information Column */}
              <div className="space-y-4">
                <div className="rounded-[20px] border border-[rgba(24,34,30,0.10)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-6 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#B58A3A] dark:text-[#D3AA58]">
                      Active Position
                    </span>
                    <span className="font-mono text-xs text-[#69736C] dark:text-[#B5BDB5]">
                      Difficulty {currentPuzzle.rating || 1400}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-[#18221E] dark:text-[#F4EFE3]">
                    {currentPuzzle.title || "Tactical Breakthrough"}
                  </h3>

                  <p className="text-xs text-[#69736C] dark:text-[#B5BDB5] leading-relaxed">
                    Find the decisive move that secures a winning advantage or delivers checkmate.
                  </p>

                  {/* Themes */}
                  {Array.isArray(currentPuzzle.themes) && currentPuzzle.themes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)]">
                      {currentPuzzle.themes.map((t: string) => (
                        <span
                          key={t}
                          className="rounded-md border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF6EE] dark:bg-[#1B2A24] px-2 py-0.5 text-[10px] font-mono text-[#69736C] dark:text-[#B5BDB5] capitalize"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Next Puzzle Action */}
                <button
                  type="button"
                  onClick={handleNextPuzzle}
                  className="w-full flex items-center justify-center gap-2 rounded-[14px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] py-3.5 text-xs font-bold uppercase tracking-wider text-[#F7F4EC] hover:-translate-y-0.5 transition shadow-xs cursor-pointer"
                >
                  <span>Next Tactical Puzzle</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-lg px-6 py-20 text-center space-y-4 rounded-[20px] border border-[rgba(24,34,30,0.10)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
              <BrainCircuit size={28} className="mx-auto text-[#B58A3A] dark:text-[#D3AA58]" />
              <h2 className="text-xl font-serif font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3]">
                Puzzles loading...
              </h2>
              <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                Preparing tactical database for your practice session.
              </p>
            </div>
          )}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
