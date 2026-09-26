"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ClockState, ChessClockProps } from "./types";

function ChessClock({
  timeMs,
  turnStartedAt,
  serverTime,
  active,
  paused = false,
  disconnected = false,
  onFlag,
  className = "",
  label,
}: ChessClockProps) {
  // Server-drift corrected local remaining calculation
  const [displayMs, setDisplayMs] = useState(timeMs);

  useEffect(() => {
    // Whenever server sends an authoritative update, sync displayMs
    setDisplayMs(timeMs);
  }, [timeMs]);

  useEffect(() => {
    if (!active || paused) return;

    // Estimate network latency skew between client Date.now() and server Time
    const clockSkew = serverTime ? Date.now() - serverTime : 0;
    const baseStartedAt = turnStartedAt ? turnStartedAt + clockSkew : Date.now();

    const interval = window.setInterval(() => {
      const elapsed = Math.max(0, Date.now() - baseStartedAt);
      const remaining = Math.max(0, timeMs - elapsed);

      setDisplayMs(remaining);

      if (remaining === 0) {
        onFlag?.();
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [active, paused, timeMs, turnStartedAt, serverTime, onFlag]);

  const clockState: ClockState = useMemo(() => {
    if (disconnected) return "disconnected";
    if (displayMs <= 0) return "expired";
    if (paused) return "paused";
    if (active && displayMs <= 10_000) return "critical";
    if (active && displayMs <= 30_000) return "low-time";
    if (active) return "active";
    return "normal";
  }, [disconnected, displayMs, paused, active]);

  // Format mm:ss or ss.t (tenths of a second when < 10s)
  const formattedTime = useMemo(() => {
    const totalSeconds = Math.ceil(displayMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (displayMs < 10_000 && displayMs > 0 && active) {
      const secs = (displayMs / 1000).toFixed(1);
      return `00:0${secs}`.slice(-4);
    }

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [displayMs, active]);

  const stateStyles: Record<ClockState, string> = {
    normal: "bg-[#FFFDF8] text-[#17221D] border-[rgba(30,40,30,0.10)] shadow-xs",
    active: "bg-[#B78A3B]/15 text-[#17221D] border-[#B78A3B] shadow-[0_2px_10px_rgba(183,138,59,0.22)] font-bold",
    "low-time": "bg-amber-50 text-amber-900 border-amber-300 font-bold",
    critical: "bg-[#8B2635]/10 text-[#8B2635] border-[#8B2635]/40 shadow-[0_0_12px_rgba(139,38,53,0.18)] animate-pulse font-bold",
    expired: "bg-[#8B2635]/15 text-[#8B2635] border-[#8B2635]/50 font-bold",
    paused: "bg-[#EAE4D7] text-[#68736B] border-[rgba(30,40,30,0.08)] opacity-70",
    disconnected: "bg-[#EAE4D7] text-[#68736B]/70 border-dashed border-[rgba(30,40,30,0.2)]",
  };

  return (
    <div
      role="timer"
      aria-label={`${label ? `${label} clock: ` : ""}${formattedTime}`}
      aria-live="off"
      className={[
        "flex items-center justify-between gap-2 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5",
        "font-mono font-bold tracking-tight select-none border transition-all duration-200",
        stateStyles[clockState],
        className,
      ].join(" ")}
    >
      {label && (
        <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#68736B]">
          {label}
        </span>
      )}
      <span className="text-xl sm:text-2xl tabular-nums leading-none">
        {formattedTime}
      </span>
      {clockState === "expired" && (
        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#8B2635]/20 text-[#8B2635] font-sans font-bold">
          0:00
        </span>
      )}
    </div>
  );
}

export default React.memo(ChessClock);
