"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Swords } from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import AnalysisPage from "@/views/Analysis";
import { apiFetch } from "@/lib/api";

export default function AnalysisIndexRoute() {
  const [latestGameId, setLatestGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasGames, setHasGames] = useState(false);

  useEffect(() => {
    async function checkGames() {
      try {
        const res = await apiFetch("/api/games/history");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.games) && data.games.length > 0) {
            setHasGames(true);
            setLatestGameId(data.games[0]._id);
          } else {
            setHasGames(false);
          }
        } else {
          setHasGames(false);
        }
      } catch {
        setHasGames(false);
      } finally {
        setLoading(false);
      }
    }
    checkGames();
  }, []);

  return (
    <div className="flex min-h-screen bg-transparent text-[#18221E] dark:text-[#F4EFE3] animate-page-enter">
      <AppSidebar />
      <div className="min-w-0 flex-1 flex flex-col pb-16 md:pb-0">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#B58A3A] border-t-transparent" />
            </div>
          ) : hasGames && latestGameId ? (
            <AnalysisPage gameId={latestGameId} />
          ) : (
            /* R16 Warm Premium Empty State with Subtle Chessboard Pattern */
            <div className="mx-auto max-w-xl my-12 relative overflow-hidden rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-8 sm:p-12 text-center shadow-[0_10px_35px_rgba(35,40,30,0.06)]">
              {/* Subtle Chessboard Geometry Background Watermark */}
              <div
                className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05] pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, var(--color-text) 1px, transparent 1px),
                    linear-gradient(to bottom, var(--color-text) 1px, transparent 1px)
                  `,
                  backgroundSize: "32px 32px",
                }}
              />

              <div className="relative z-10 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#B58A3A]/12 text-[#B58A3A] border border-[#B58A3A]/25 shadow-xs">
                  <Bot size={28} />
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#18352B] dark:text-[#F4EFE3]">
                  No games yet to analyze
                </h2>
                <p className="text-xs sm:text-sm text-[#69736C] dark:text-[#B5BDB5] leading-relaxed max-w-md mx-auto">
                  Complete a match in matchmaking or against friends to unlock full AI analysis, Stockfish evaluations, accuracy metrics, and interactive coach feedback.
                </p>
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setLatestGameId("demo-game");
                      setHasGames(true);
                    }}
                    className="w-full h-11 sm:h-12 inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] px-4 text-xs sm:text-sm font-semibold text-[#F7F4EC] hover:-translate-y-0.5 active:translate-y-0 transition duration-150 shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    <Bot size={16} />
                    <span>Analyze Demo Game</span>
                  </button>

                  <Link
                    href="/play"
                    className="w-full h-11 sm:h-12 inline-flex items-center justify-center gap-2 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-4 text-xs sm:text-sm font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:bg-[#EDE9DE] hover:-translate-y-0.5 active:translate-y-0 transition duration-150 shadow-sm whitespace-nowrap"
                  >
                    <Swords size={16} />
                    <span>Play Match</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
