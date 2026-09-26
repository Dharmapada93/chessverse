"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CoachChat from "@/components/coach/CoachChat";

export default function CoachPage() {
  const [userId, setUserId] = useState("CURRENT_USER_ID");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("chessverse-token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload?.userId) {
            setUserId(payload.userId);
          }
        } catch {
          // Keep default
        }
      }
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0b0a] px-6 py-12 text-[#f4f0e6]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">
            Personal Chess Intelligence
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            Your Chess Coach
          </h1>

          <p className="mt-3 max-w-2xl text-white/50">
            Ask questions about your games,
            weaknesses, tactics, openings and
            training plan.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <section className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.025] p-7">
            <div>
              <p className="text-sm text-white/35">
                Your current training focus
              </p>

              <h2 className="mt-3 text-2xl font-medium">
                Tactical awareness
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-white/50">
                Your recent analysis shows that
                tactical positions are the biggest
                opportunity for improvement.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <p className="text-xs text-white/35">
                    Tactical
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#d7b875]">
                    78
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <p className="text-xs text-white/35">
                    Opening
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    84
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <p className="text-xs text-white/35">
                    Endgame
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    71
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/training"
                className="rounded-xl bg-[#e9e2d0] px-5 py-3 text-sm font-medium text-black transition hover:opacity-90"
              >
                Solve Tactical Puzzles
              </Link>
              <Link
                href="/training/dashboard"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
              >
                Training Dashboard
              </Link>
            </div>
          </section>

          <CoachChat userId={userId} />
        </div>
      </div>
    </main>
  );
}
