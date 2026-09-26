"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface PremiumChessAtmosphereProps {
  dimmed?: boolean;
}

/**
 * PremiumChessAtmosphere
 * R16 Global Background Environment
 *
 * Implements a 5-layer subtle atmosphere:
 * Layer 1: Warm Ivory Base (#EDE9DE in light / #13201B in dark)
 * Layer 2: Soft ambient radial gradients
 * Layer 3: Faint 8x8 chessboard geometry (ultra low opacity ~3%)
 * Layer 4: Subtle diagonal paper weave texture
 * Layer 5: Very slow (20-40s) ambient light movement (transforms only)
 */
export default function PremiumChessAtmosphere({ dimmed = false }: PremiumChessAtmosphereProps) {
  const pathname = usePathname();
  const isGameRoute = pathname?.startsWith("/game/");
  const effectiveDimmed = dimmed || isGameRoute;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-50 overflow-hidden select-none bg-[var(--color-bg)] transition-opacity duration-700 ${
        effectiveDimmed ? "opacity-40" : "opacity-100"
      }`}
    >
      {/* ── Layer 1: Warm Ivory / Forest Base Gradient ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-bg)] to-[var(--color-bg-alt)]" />

      {/* ── Layer 2: Ambient Lighting & Illumination (Top Champagne Spotlight & Forest Depth) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Champagne Spotlight */}
        <div
          className="absolute -top-[160px] left-1/2 -translate-x-1/2 h-[560px] w-[960px] rounded-full bg-[var(--color-primary)]/[0.06] dark:bg-[var(--color-primary)]/[0.10] blur-[150px] motion-safe:animate-[ambientPulse_26s_ease-in-out_infinite_alternate]"
        />

        {/* Soft Champagne Gold Light (Left) */}
        <div
          className="absolute -top-[15%] -left-[10%] h-[750px] w-[750px] rounded-full bg-[var(--color-primary)]/[0.04] dark:bg-[var(--color-primary)]/[0.07] blur-[160px] motion-safe:animate-[ambientDriftA_34s_ease-in-out_infinite_alternate]"
        />

        {/* Soft Deep Emerald Tint Light (Bottom Right) */}
        <div
          className="absolute -bottom-[20%] -right-[10%] h-[850px] w-[850px] rounded-full bg-[var(--color-forest)]/[0.05] dark:bg-[#1f3f33]/[0.22] blur-[170px] motion-safe:animate-[ambientDriftB_40s_ease-in-out_infinite_alternate]"
        />

        {/* Warm Natural Glow Center Light */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[var(--color-surface-elevated)]/[0.25] dark:bg-[var(--color-surface-elevated)]/[0.10] blur-[140px] motion-safe:animate-[ambientPulse_28s_ease-in-out_infinite_alternate]"
        />

        {/* Subtle Club Room Perimeter Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(35,40,30,0.03)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(10,18,14,0.35)_100%)]" />
      </div>

      {/* ── Layer 3: Faint Chessboard Geometry (8x8 Grid, barely visible, ultra-low opacity) ── */}
      <div
        className="absolute inset-0 opacity-[0.032]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-text) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-text) 1px, transparent 1px)
          `,
          backgroundSize: "68px 68px",
        }}
      />

      {/* ── Layer 4: Very Subtle Diagonal Paper Weave Texture ── */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, var(--color-text) 0, var(--color-text) 1px, transparent 0, transparent 40px)`,
        }}
      />

      {/* ── Layer 5: Maximum 8-10 Ultra-Subtle Decorative Elements (Zero particle overload) ── */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[18%] left-[20%] h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]/20 motion-safe:animate-[ambientDriftA_30s_ease-in-out_infinite_alternate]" />
        <div className="absolute top-[42%] left-[12%] h-1 w-1 rounded-full bg-[var(--color-forest)]/15 motion-safe:animate-[ambientDriftB_36s_ease-in-out_infinite_alternate]" />
        <div className="absolute top-[75%] left-[28%] h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]/15 motion-safe:animate-[ambientDriftA_32s_ease-in-out_infinite_alternate]" />
        <div className="absolute top-[25%] right-[22%] h-1 w-1 rounded-full bg-[var(--color-forest)]/20 motion-safe:animate-[ambientDriftB_38s_ease-in-out_infinite_alternate]" />
        <div className="absolute top-[65%] right-[16%] h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]/15 motion-safe:animate-[ambientDriftA_26s_ease-in-out_infinite_alternate]" />
        <div className="absolute bottom-[14%] right-[32%] h-1 w-1 rounded-full bg-[var(--color-forest)]/15 motion-safe:animate-[ambientDriftB_34s_ease-in-out_infinite_alternate]" />
      </div>

      {/* Very faint subliminal chess notation watermark (under 2% opacity) */}
      <div className="absolute inset-0 hidden lg:block pointer-events-none select-none">
        <span className="absolute top-[14%] left-[10%] font-serif text-3xl text-[var(--color-text)]/[0.018] tracking-widest motion-safe:animate-[ambientDriftA_40s_ease-in-out_infinite_alternate]">
          e4
        </span>
        <span className="absolute top-[60%] left-[8%] font-serif text-3xl text-[var(--color-text)]/[0.016] tracking-widest motion-safe:animate-[ambientDriftB_36s_ease-in-out_infinite_alternate]">
          Nf3
        </span>
        <span className="absolute top-[20%] right-[10%] text-4xl text-[var(--color-text)]/[0.016] motion-safe:animate-[ambientDriftA_42s_ease-in-out_infinite_alternate]">
          ♞
        </span>
        <span className="absolute bottom-[20%] right-[12%] font-serif text-3xl text-[var(--color-text)]/[0.018] tracking-widest motion-safe:animate-[ambientDriftB_38s_ease-in-out_infinite_alternate]">
          c5
        </span>
      </div>
    </div>
  );
}
