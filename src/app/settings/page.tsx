"use client";

import { useState } from "react";
import { Settings, Shield, Bell, Volume2, User, Palette } from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";

export default function SettingsPage() {
  const [boardTheme, setBoardTheme] = useState("classic");
  const [moveSounds, setMoveSounds] = useState(true);
  const [showEval, setShowEval] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-[#f4f1e9]">
      <AppSidebar />

      <div className="min-w-0 flex-1">
        <AppHeader />

        <main className="mx-auto max-w-4xl px-5 py-7 sm:px-8 lg:px-10">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2 text-[#d7b875]">
              <Settings size={18} />
              <span className="text-xs uppercase tracking-[0.2em] font-medium">
                Preferences
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Account & Board Settings</h1>
            <p className="mt-1 text-sm text-white/40">
              Customize your chess board aesthetic, engine feedback, sound effects, and notifications.
            </p>
          </div>

          <div className="space-y-6">
            {/* Board Settings */}
            <div className="rounded-2xl border border-white/10 bg-[#11110f] p-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Palette size={18} className="text-[#d7b875]" />
                <h2 className="font-semibold">Board & Engine Visuals</h2>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Show Real-Time Stockfish Eval</p>
                    <p className="text-xs text-white/40">Display the evaluation score and engine depth during games</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showEval}
                    onChange={(e) => setShowEval(e.target.checked)}
                    className="h-5 w-5 accent-[#d7b875]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Piece Move Sounds</p>
                    <p className="text-xs text-white/40">Play audio cues on captures, moves, and checks</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={moveSounds}
                    onChange={(e) => setMoveSounds(e.target.checked)}
                    className="h-5 w-5 accent-[#d7b875]"
                  />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="rounded-2xl border border-white/10 bg-[#11110f] p-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <User size={18} className="text-[#d7b875]" />
                <h2 className="font-semibold">Player Profile</h2>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs text-white/40 uppercase font-semibold tracking-wider">Username</label>
                  <input
                    defaultValue="Dharmapada"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-[#d7b875]/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/40 uppercase font-semibold tracking-wider">Email</label>
                  <input
                    defaultValue="dharm@chessverse.io"
                    readOnly
                    className="mt-1.5 w-full rounded-xl border border-white/5 bg-white/[0.01] px-4 py-2.5 text-sm text-white/40 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
