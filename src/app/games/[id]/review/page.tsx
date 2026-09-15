"use client";

import {
  Brain,
  Target,
  TrendingUp,
} from "lucide-react";

export default function GameReviewPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-[#f4f1e9]">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-[#d7b875]">
            <Brain size={18} />

            <span className="text-sm uppercase tracking-[0.18em]">
              ChessVerse AI
            </span>
          </div>

          <h1 className="text-4xl font-semibold">
            Game Review
          </h1>

          <p className="mt-2 text-white/40">
            Understand the decisions that shaped your game.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#11110f] p-6">
            <Target
              size={20}
              className="mb-5 text-[#d7b875]"
            />

            <p className="text-sm text-white/40">
              White accuracy
            </p>

            <p className="mt-2 text-3xl font-semibold">
              91%
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#11110f] p-6">
            <Target
              size={20}
              className="mb-5 text-[#d7b875]"
            />

            <p className="text-sm text-white/40">
              Black accuracy
            </p>

            <p className="mt-2 text-3xl font-semibold">
              78%
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#11110f] p-6">
            <TrendingUp
              size={20}
              className="mb-5 text-[#d7b875]"
            />

            <p className="text-sm text-white/40">
              Key moments
            </p>

            <p className="mt-2 text-3xl font-semibold">
              4
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
