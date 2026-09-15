"use client";

import {
  Brain,
  MessageCircle,
} from "lucide-react";

export default function CoachPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-[#f4f1e9]">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <div className="mb-4 flex items-center gap-2 text-[#d7b875]">
            <Brain size={20} />

            <span className="text-sm uppercase tracking-[0.18em]">
              ChessVerse AI
            </span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight">
            Chess Coach
          </h1>

          <p className="mt-3 max-w-xl text-white/40">
            Ask questions about your games, understand mistakes, and build better chess habits.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#11110f]">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-3">
              <MessageCircle
                size={18}
                className="text-[#d7b875]"
              />

              <span className="font-medium">
                Ask your coach
              </span>
            </div>
          </div>

          <div className="min-h-[420px] p-6">
            <p className="max-w-md text-sm leading-7 text-white/35">
              Try questions like:
            </p>

            <div className="mt-4 space-y-2">
              <div className="rounded-xl border border-white/10 p-4 text-sm text-white/60">
                Why was my move on move 18 a mistake?
              </div>

              <div className="rounded-xl border border-white/10 p-4 text-sm text-white/60">
                What should I improve based on my last five games?
              </div>

              <div className="rounded-xl border border-white/10 p-4 text-sm text-white/60">
                What opening should I practice?
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="flex gap-3">
              <input
                placeholder="Ask about your chess..."
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/20"
              />

              <button className="rounded-xl bg-[#d7b875] px-5 text-sm font-medium text-black transition hover:brightness-110">
                Ask
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
