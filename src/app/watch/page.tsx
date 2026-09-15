"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Swords, Users, Radio, ArrowRight } from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";

type LiveRoom = {
  roomId: string;
  roomCode: string;
  whitePlayer: { name: string; rating: number };
  blackPlayer: { name: string; rating: number };
  timeControl: string;
  spectators: number;
  status: "active" | "waiting";
};

export default function WatchPage() {
  const [rooms, setRooms] = useState<LiveRoom[]>([
    {
      roomId: "r1",
      roomCode: "CV-4821",
      whitePlayer: { name: "Magnus_C", rating: 2842 },
      blackPlayer: { name: "Hikaru_N", rating: 2820 },
      timeControl: "3+2 Blitz",
      spectators: 14,
      status: "active",
    },
    {
      roomId: "r2",
      roomCode: "CV-1092",
      whitePlayer: { name: "Dharmapada", rating: 1428 },
      blackPlayer: { name: "Elena_K", rating: 1460 },
      timeControl: "5+0 Rapid",
      spectators: 4,
      status: "active",
    },
    {
      roomId: "r3",
      roomCode: "CV-7731",
      whitePlayer: { name: "Vishy_A", rating: 2750 },
      blackPlayer: { name: "Gukesh_D", rating: 2794 },
      timeControl: "10+0 Rapid",
      spectators: 38,
      status: "active",
    },
  ]);

  useEffect(() => {
    // Optionally fetch dynamic rooms from backend
    async function fetchRooms() {
      try {
        const token = localStorage.getItem("chessverse-token");
        const res = await fetch("http://localhost:4000/api/rooms", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.rooms) && data.rooms.length > 0) {
            // merge or set
          }
        }
      } catch {
        // Fallback to sample rooms
      }
    }

    fetchRooms();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-[#f4f1e9]">
      <AppSidebar />

      <div className="min-w-0 flex-1">
        <AppHeader />

        <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2 text-emerald-400">
              <Radio size={18} className="animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] font-medium">
                Live Broadcasts
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Watch Live Games</h1>
            <p className="mt-1 text-sm text-white/40">
              Spectate high-rated matches and friend encounters with real-time moves, live reactions, and engine evaluation.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div
                key={room.roomCode}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#11110f] p-5 transition hover:border-[#d7b875]/40 hover:bg-[#141412]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>

                    <span className="text-xs text-white/40 font-mono">
                      {room.timeControl}
                    </span>
                  </div>

                  <div className="my-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full border border-white/30 bg-white" />
                        <span className="font-medium text-sm">{room.whitePlayer.name}</span>
                      </div>
                      <span className="font-mono text-xs text-white/40">
                        {room.whitePlayer.rating}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full border border-white/30 bg-black" />
                        <span className="font-medium text-sm">{room.blackPlayer.name}</span>
                      </div>
                      <span className="font-mono text-xs text-white/40">
                        {room.blackPlayer.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <Users size={14} />
                    <span>{room.spectators} watching</span>
                  </div>

                  <Link
                    href={`/room/${room.roomCode}?role=spectator`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white transition group-hover:bg-[#d7b875] group-hover:text-black"
                  >
                    <Eye size={13} />
                    Spectate
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
