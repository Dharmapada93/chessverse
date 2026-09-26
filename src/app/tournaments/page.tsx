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
      players: 18,
      maxPlayers: 64,
      reward: "Gold Trophy & +40 Elo",
      startsIn: "2 hours",
      status: "Registration Open",
    },
    {
      id: "t2",
      title: "ChessVerse Arena Grand Prix",
      timeControl: "5+0 Rapid",
      players: 24,
      maxPlayers: 128,
      reward: "Grand Prix Crown & +50 Elo",
      startsIn: "Tomorrow",
      status: "Registration Open",
    },
    {
      id: "t3",
      title: "Bullet Mayhem 1+0",
      timeControl: "1+0 Bullet",
      players: 12,
      maxPlayers: 32,
      reward: "Bullet Master Badge",
      startsIn: "Sunday",
      status: "Upcoming",
    },
  ];

  return (
    <div className="flex min-h-screen bg-transparent text-[#171A18] animate-pageEnter">
      <AppSidebar />

      <div className="min-w-0 flex-1">
        <AppHeader />

        <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2 text-[#B88A32]">
              <Trophy size={18} />
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#B88A32]">
                Competitive Arenas
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#171A18]">Tournaments</h1>
            <p className="mt-1 text-sm text-[#68706A]">
              Join live Swiss and Arena tournaments, climb the leaderboards, and win rating points.
            </p>
          </div>

          <div className="space-y-4">
            {tournaments.map((t) => (
              <div
                key={t.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 p-6 transition hover:border-[rgba(30,30,20,0.2)] md:flex-row md:items-center shadow-[0_8px_30px_rgba(35,30,20,0.04)]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-[#B88A32]/10 border border-[#B88A32]/30 px-2 py-0.5 text-xs font-semibold text-[#B88A32]">
                      {t.timeControl}
                    </span>
                    <span className="text-xs text-[#68706A]">Starts in {t.startsIn}</span>
                  </div>

                  <h3 className="mt-2 text-lg font-bold text-[#171A18]">{t.title}</h3>

                  <div className="mt-3 flex items-center gap-5 text-xs text-[#68706A]">
                    <span className="flex items-center gap-1.5">
                      <Users size={14} />
                      {t.players} / {t.maxPlayers} players
                    </span>
                    <span className="flex items-center gap-1.5 text-[#B88A32] font-semibold">
                      <Award size={14} />
                      Reward: {t.reward}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="rounded-xl bg-[#B88A32] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#A07628] shadow-sm hover:-translate-y-0.5 cursor-pointer">
                    Register Free
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
