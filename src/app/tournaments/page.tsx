"use client";

import Link from "next/link";
import { Trophy, Calendar, Users, Award, ArrowRight } from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";

export default function TournamentsPage() {
  const tournaments = [
    {
      id: "t1",
      title: "Weekend Blitz Championship",
      timeControl: "3+2 Blitz",
      players: 64,
      maxPlayers: 128,
      prizePool: "$500",
      startsIn: "2 hours",
      status: "Registration Open",
    },
    {
      id: "t2",
      title: "ChessVerse Arena Grand Prix",
      timeControl: "5+0 Rapid",
      players: 112,
      maxPlayers: 256,
      prizePool: "$1,200",
      startsIn: "Tomorrow",
      status: "Registration Open",
    },
    {
      id: "t3",
      title: "Bullet Mayhem 1+0",
      timeControl: "1+0 Bullet",
      players: 32,
      maxPlayers: 64,
      prizePool: "$250",
      startsIn: "Sunday",
      status: "Upcoming",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-[#f4f1e9]">
      <AppSidebar />

      <div className="min-w-0 flex-1">
        <AppHeader />

        <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2 text-[#d7b875]">
              <Trophy size={18} />
              <span className="text-xs uppercase tracking-[0.2em] font-medium">
                Competitive Arenas
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Tournaments</h1>
            <p className="mt-1 text-sm text-white/40">
              Join live Swiss and Arena tournaments, climb the leaderboards, and win rating points.
            </p>
          </div>

          <div className="space-y-4">
            {tournaments.map((t) => (
              <div
                key={t.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#11110f] p-6 transition hover:border-[#d7b875]/40 md:flex-row md:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#d7b875]/15 px-2 py-0.5 text-xs font-semibold text-[#d7b875]">
                      {t.timeControl}
                    </span>
                    <span className="text-xs text-white/40">Starts in {t.startsIn}</span>
                  </div>

                  <h3 className="mt-2 text-lg font-semibold">{t.title}</h3>

                  <div className="mt-3 flex items-center gap-5 text-xs text-white/40">
                    <span className="flex items-center gap-1.5">
                      <Users size={14} />
                      {t.players} / {t.maxPlayers} players
                    </span>
                    <span className="flex items-center gap-1.5 text-[#d7b875]">
                      <Award size={14} />
                      Prize: {t.prizePool}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="rounded-xl bg-[#d7b875] px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110">
                    Register Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
