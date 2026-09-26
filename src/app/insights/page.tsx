"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Swords,
  Target,
  BookOpen,
} from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { apiFetch } from "@/lib/api";

type InsightsData = {
  recentAccuracyAvg: number | null;
  totalGamesAnalyzed: number;
  commonMistakesByPhase: {
    opening: number;
    middlegame: number;
    endgame: number;
  };
  openingPerformance: Array<{
    name: string;
    gamesCount: number;
    accuracyAvg: number;
  }>;
  tacticalMotifsEncountered: Array<{
    motif: string;
    count: number;
    missedCount: number;
  }>;
  recommendedPractice: Array<{
    title: string;
    focus: string;
    reason: string;
  }>;
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        const res = await apiFetch("/api/ai/insights");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.insights) {
            setInsights(data.insights);
          }
        }
      } catch {
        // Fallback null to show empty state
        setInsights(null);
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, []);

  const hasData = insights && insights.totalGamesAnalyzed > 0;

  return (
    <div className="flex min-h-screen bg-transparent text-[#18221E] dark:text-[#F4EFE3] animate-pageEnter">
      <AppSidebar />
      <div className="min-w-0 flex-1 flex flex-col pb-16 md:pb-0">
        <AppHeader />
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 max-w-[1440px] mx-auto space-y-8 w-full">
          {/* Editorial Header */}
          <div className="border-b border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] pb-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B58A3A] dark:text-[#D3AA58] block mb-1">
              YOUR CHESS JOURNEY
            </span>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3]">
              Personal Insights & Evolution
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#69736C] dark:text-[#B5BDB5]">
              My Chess Journal — patterns, accuracy trends, and tactical tendencies derived directly from your verified matches.
            </p>
          </div>

          {loading ? (
            <div className="space-y-6">
              <div className="h-44 rounded-[20px] bg-[#F7F4EC]/60 dark:bg-[#1B2A24]/60 animate-pulse border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)]" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-60 rounded-[14px] bg-[#F7F4EC]/60 dark:bg-[#1B2A24]/60 animate-pulse border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)]" />
                <div className="h-60 rounded-[14px] bg-[#F7F4EC]/60 dark:bg-[#1B2A24]/60 animate-pulse border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)]" />
              </div>
            </div>
          ) : !hasData ? (
            /* Honest Elegant Empty State */
            <div className="mx-auto max-w-lg px-6 py-16 text-center space-y-4 rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] shadow-[0_10px_35px_rgba(35,40,30,0.04)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#B58A3A] dark:text-[#D3AA58] border border-[#B58A3A]/20">
                <Sparkles size={28} />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3]">
                Your match journal is ready to begin
              </h2>
              <p className="text-xs sm:text-sm text-[#69736C] dark:text-[#B5BDB5] leading-relaxed">
                Complete rated matches with friends or practice against the AI to unlock your personal chess journal, tactical trends, and accuracy patterns.
              </p>
              <div className="pt-3">
                <Link
                  href="/play"
                  className="inline-flex items-center gap-2 rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#F7F4EC] transition shadow-xs cursor-pointer"
                >
                  <Swords size={15} />
                  <span>Play Chess</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Hero Insight Area */}
              <div className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-6 sm:p-8 shadow-[0_10px_35px_rgba(35,40,30,0.04)]">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#B58A3A] dark:text-[#D3AA58] block">
                  Your Recent Form
                </span>
                <div className="mt-3 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                  <span className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3]">
                    {insights.recentAccuracyAvg !== null ? `${insights.recentAccuracyAvg}%` : "—"}
                  </span>
                  <span className="text-xs sm:text-sm text-[#69736C] dark:text-[#B5BDB5]">
                    Overall accuracy average across your last {insights.totalGamesAnalyzed} analyzed games.
                  </span>
                </div>

                <div className="mt-6 pt-6 border-t border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[#69736C] dark:text-[#B5BDB5] block">Analyzed Volume</span>
                    <span className="mt-1 font-mono text-base font-bold text-[#18221E] dark:text-[#F4EFE3]">
                      {insights.totalGamesAnalyzed} games
                    </span>
                  </div>
                  <div>
                    <span className="text-[#69736C] dark:text-[#B5BDB5] block">Opening Mistakes</span>
                    <span className="mt-1 font-mono text-base font-bold text-[#18221E] dark:text-[#F4EFE3]">
                      {insights.commonMistakesByPhase.opening} inaccuracies
                    </span>
                  </div>
                  <div>
                    <span className="text-[#69736C] dark:text-[#B5BDB5] block">Middlegame Errors</span>
                    <span className="mt-1 font-mono text-base font-bold text-[#18221E] dark:text-[#F4EFE3]">
                      {insights.commonMistakesByPhase.middlegame} blunders
                    </span>
                  </div>
                </div>
              </div>

              {/* Chess Patterns: Openings & Tactics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Opening Patterns */}
                <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-6 space-y-4 shadow-[0_10px_35px_rgba(35,40,30,0.04)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#18221E] dark:text-[#F4EFE3]">
                    <BookOpen size={16} className="text-[#B58A3A] dark:text-[#D3AA58]" />
                    <span>Opening Patterns</span>
                  </div>

                  {insights.openingPerformance.length === 0 ? (
                    <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">No opening repetitions recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {insights.openingPerformance.map((op) => (
                        <div
                          key={op.name}
                          className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] pb-2.5 last:border-none"
                        >
                          <div>
                            <span className="text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] block">{op.name}</span>
                            <span className="text-[11px] text-[#69736C] dark:text-[#B5BDB5] font-mono">{op.gamesCount} games played</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-[#B58A3A] dark:text-[#D3AA58]">
                            {op.accuracyAvg}% acc
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tactical Patterns */}
                <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-6 space-y-4 shadow-[0_10px_35px_rgba(35,40,30,0.04)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#18221E] dark:text-[#F4EFE3]">
                    <Target size={16} className="text-[#B58A3A] dark:text-[#D3AA58]" />
                    <span>Tactical Motifs Encountered</span>
                  </div>

                  {insights.tacticalMotifsEncountered.length === 0 ? (
                    <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">No tactical motifs flagged in recent matches.</p>
                  ) : (
                    <div className="space-y-3">
                      {insights.tacticalMotifsEncountered.map((m) => (
                        <div
                          key={m.motif}
                          className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] pb-2.5 last:border-none"
                        >
                          <div>
                            <span className="text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] capitalize block">
                              {m.motif.replace(/_/g, " ")}
                            </span>
                            <span className="text-[11px] text-[#69736C] dark:text-[#B5BDB5] font-mono">{m.count} positions</span>
                          </div>
                          <span className={`font-mono text-xs font-bold ${m.missedCount > 0 ? "text-[#A94B45]" : "text-[#27815D]"}`}>
                            {m.missedCount} missed
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Practice */}
              {insights.recommendedPractice.length > 0 && (
                <div className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-6 sm:p-7 space-y-4 shadow-[0_10px_35px_rgba(35,40,30,0.04)]">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#B58A3A] dark:text-[#D3AA58] block">
                    Recommended For You
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {insights.recommendedPractice.map((rec, i) => (
                      <div
                        key={i}
                        className="rounded-[12px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#F7F4EC] dark:bg-[#1B2A24] p-4 space-y-1.5"
                      >
                        <span className="text-[10px] font-mono text-[#B58A3A] dark:text-[#D3AA58] font-semibold uppercase">{rec.focus}</span>
                        <h4 className="text-sm font-bold text-[#18221E] dark:text-[#F4EFE3]">{rec.title}</h4>
                        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5] leading-relaxed">{rec.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
