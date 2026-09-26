"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface PremiumChessBackgroundProps {
  dimmed?: boolean;
}

export default function PremiumChessBackground({ dimmed = false }: PremiumChessBackgroundProps) {
  const pathname = usePathname();
  const isGameRoute = pathname?.startsWith("/game/");
  const effectiveDimmed = dimmed || isGameRoute;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-50 overflow-hidden select-none bg-[#F5F1E8] transition-opacity duration-700 ${
        effectiveDimmed ? "opacity-35" : "opacity-100"
      }`}
    >
      {/* ── Layer 1: Warm Paper Texture & Subtle Gradient Base ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFFDF8] via-[#F5F1E8] to-[#EAE4D7]" />

      {/* ── Layer 2: Extremely Faint Chessboard Geometry ── */}
      <div
        className="absolute inset-0 opacity-[0.038]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(30, 40, 30, 0.45) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(30, 40, 30, 0.45) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* ── Layer 3: Subtle Diagonal Grid ── */}
      <div
        className="absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, rgba(30, 40, 30, 0.4) 0, rgba(30, 40, 30, 0.4) 1px, transparent 0, transparent 48px)`,
        }}
      />

      {/* ── Layer 4: Warm Radial Lighting & Ambient Light Drift (20-45s) ── */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Champagne Gold Ambient Orb */}
        <div
          className="absolute -top-[15%] -left-[10%] h-[750px] w-[750px] rounded-full bg-[#B78A3B]/[0.055] blur-[150px] motion-safe:animate-[ambientDriftA_32s_ease-in-out_infinite_alternate]"
        />

        {/* Deep Forest Ambient Orb */}
        <div
          className="absolute -bottom-[20%] -right-[10%] h-[850px] w-[850px] rounded-full bg-[#214C3D]/[0.045] blur-[170px] motion-safe:animate-[ambientDriftB_40s_ease-in-out_infinite_alternate]"
        />

        {/* Warm Cream Central Glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] rounded-full bg-[#EAE4D7]/[0.15] blur-[130px] motion-safe:animate-[ambientPulse_26s_ease-in-out_infinite_alternate]"
        />
      </div>

      {/* ── Layer 5: Very Small Floating Geometric Particles (Minimal count, zero CPU drag) ── */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[15%] left-[22%] h-1.5 w-1.5 rounded-full bg-[#B78A3B]/25 motion-safe:animate-[driftFloat_24s_ease-in-out_infinite_alternate]" />
        <div className="absolute top-[45%] left-[14%] h-1 w-1 rounded-full bg-[#214C3D]/20 motion-safe:animate-[driftFloat_30s_ease-in-out_infinite_alternate_reverse]" />
        <div className="absolute top-[72%] left-[30%] h-1.5 w-1.5 rounded-full bg-[#B78A3B]/20 motion-safe:animate-[driftFloat_28s_ease-in-out_infinite_alternate]" />
        <div className="absolute top-[28%] right-[25%] h-1 w-1 rounded-full bg-[#214C3D]/25 motion-safe:animate-[driftFloat_34s_ease-in-out_infinite_alternate_reverse]" />
        <div className="absolute top-[60%] right-[18%] h-1.5 w-1.5 rounded-full bg-[#B78A3B]/20 motion-safe:animate-[driftFloat_22s_ease-in-out_infinite_alternate]" />
        <div className="absolute bottom-[12%] right-[35%] h-1 w-1 rounded-full bg-[#214C3D]/20 motion-safe:animate-[driftFloat_36s_ease-in-out_infinite_alternate_reverse]" />
      </div>

      {/* ── Layer 6: Occasional Tiny Chess Notation Marks (Subliminal 2% opacity) ── */}
      <div className="absolute inset-0 hidden md:block">
        <span className="absolute top-[16%] left-[12%] font-serif text-3xl text-[#17221D]/[0.022] tracking-widest motion-safe:animate-[driftFloat_38s_ease-in-out_infinite_alternate]">
          e4
        </span>
        <span className="absolute top-[58%] left-[9%] font-serif text-4xl text-[#17221D]/[0.02] tracking-widest motion-safe:animate-[driftFloat_32s_ease-in-out_infinite_alternate_reverse]">
          Nf3
        </span>
        <span className="absolute top-[22%] right-[12%] font-serif text-5xl text-[#17221D]/[0.02] motion-safe:animate-[driftFloat_42s_ease-in-out_infinite_alternate]">
          ♞
        </span>
        <span className="absolute bottom-[22%] right-[15%] font-serif text-3xl text-[#17221D]/[0.022] tracking-widest motion-safe:animate-[driftFloat_36s_ease-in-out_infinite_alternate_reverse]">
          c5
        </span>
        <span className="absolute top-[48%] right-[8%] font-mono text-2xl text-[#17221D]/[0.018] tracking-widest">
          O-O
        </span>
        <span className="absolute bottom-[35%] left-[20%] font-serif text-2xl text-[#17221D]/[0.018] tracking-widest">
          d4
        </span>
      </div>
    </div>
  );
}
