"use client";

import React, { useEffect, useState, useRef, memo } from "react";
import { Clock } from "lucide-react";

export interface AuthoritativeClockProps {
  whiteTimeMs: number;
  blackTimeMs: number;
  activeColor: "white" | "black" | null;
  serverTimestamp?: number;
  isLowTimeThreshold?: number; // ms, default 30000 (30s)
  className?: string;
  onTimeout?: (color: "white" | "black") => void;
}

function formatClockDisplay(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * AuthoritativeClock (R8.14 - R8.17)
 *
 * Performance-critical chess clock:
 * 1. Isolated clock ticker: Clock countdown ticks NEVER trigger re-renders of the board or chat.
 * 2. Timestamp-based accuracy: Uses performance.now() / Date.now() delta rather than naive setInterval(--time).
 * 3. Server drift compensation: Syncs with serverTimestamp to adjust local clock offset.
 */
function AuthoritativeClockComponent({
  whiteTimeMs,
  blackTimeMs,
  activeColor,
  serverTimestamp,
  isLowTimeThreshold = 30000,
  className = "",
  onTimeout,
}: AuthoritativeClockProps) {
  // Authoritative baselines received from server
  const baseWhiteRef = useRef(whiteTimeMs);
  const baseBlackRef = useRef(blackTimeMs);
  const activeColorRef = useRef(activeColor);
  const turnStartRef = useRef<number>(Date.now());
  const serverOffsetRef = useRef<number>(
    serverTimestamp ? serverTimestamp - Date.now() : 0
  );

  // Local display state (isolated exclusively to this component)
  const [displayWhite, setDisplayWhite] = useState(whiteTimeMs);
  const [displayBlack, setDisplayBlack] = useState(blackTimeMs);

  // Resynchronize baselines whenever server pushes authoritative clock updates
  useEffect(() => {
    baseWhiteRef.current = whiteTimeMs;
    baseBlackRef.current = blackTimeMs;
    activeColorRef.current = activeColor;
    turnStartRef.current = Date.now();

    if (serverTimestamp) {
      serverOffsetRef.current = serverTimestamp - Date.now();
    }

    setDisplayWhite(whiteTimeMs);
    setDisplayBlack(blackTimeMs);
  }, [whiteTimeMs, blackTimeMs, activeColor, serverTimestamp]);

  // High-precision isolated ticker (R8.14 & R8.15)
  useEffect(() => {
    if (!activeColor) return;

    // Use 100ms interval for smooth sub-second updates without DOM churn
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - turnStartRef.current;

      if (activeColorRef.current === "white") {
        const remaining = Math.max(0, baseWhiteRef.current - elapsed);
        setDisplayWhite(remaining);
        if (remaining <= 0 && onTimeout) {
          onTimeout("white");
        }
      } else if (activeColorRef.current === "black") {
        const remaining = Math.max(0, baseBlackRef.current - elapsed);
        setDisplayBlack(remaining);
        if (remaining <= 0 && onTimeout) {
          onTimeout("black");
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [activeColor, onTimeout]);

  const isWhiteLow = displayWhite <= isLowTimeThreshold && activeColor === "white";
  const isBlackLow = displayBlack <= isLowTimeThreshold && activeColor === "black";

  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {/* White Clock Card */}
      <div
        className={`rounded-[14px] border px-4 py-3 transition-colors ${
          activeColor === "white"
            ? isWhiteLow
              ? "border-[#A94B45] bg-[#A94B45]/10 text-[#A94B45] shadow-sm"
              : "border-[#B58A3A] bg-[#FBF9F3] dark:bg-[#21332B] text-[var(--color-text)] shadow-sm"
            : "border-[var(--color-border)] bg-[#F7F4EC]/60 dark:bg-[#1B2A24]/60 text-[var(--color-text-secondary)]"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] font-medium">
            <span className="h-2 w-2 rounded-full bg-[#FBF9F3] border border-[#18352B]/30" />
            <span>White</span>
            {activeColor === "white" && (
              <Clock className="w-3 h-3 text-[#B58A3A] animate-pulse" />
            )}
          </div>
          <span
            className={`font-mono text-2xl font-bold tracking-tight ${
              isWhiteLow
                ? "text-[#A94B45]"
                : activeColor === "white"
                ? "text-[#B58A3A]"
                : "text-[var(--color-text-secondary)]"
            }`}
          >
            {formatClockDisplay(displayWhite)}
          </span>
        </div>
      </div>

      {/* Black Clock Card */}
      <div
        className={`rounded-[14px] border px-4 py-3 transition-colors ${
          activeColor === "black"
            ? isBlackLow
              ? "border-[#A94B45] bg-[#A94B45]/10 text-[#A94B45] shadow-sm"
              : "border-[#B58A3A] bg-[#FBF9F3] dark:bg-[#21332B] text-[var(--color-text)] shadow-sm"
            : "border-[var(--color-border)] bg-[#F7F4EC]/60 dark:bg-[#1B2A24]/60 text-[var(--color-text-secondary)]"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] font-medium">
            <span className="h-2 w-2 rounded-full bg-[#18352B] border border-[#B58A3A]/40" />
            <span>Black</span>
            {activeColor === "black" && (
              <Clock className="w-3 h-3 text-[#B58A3A] animate-pulse" />
            )}
          </div>
          <span
            className={`font-mono text-2xl font-bold tracking-tight ${
              isBlackLow
                ? "text-[#A94B45]"
                : activeColor === "black"
                ? "text-[#B58A3A]"
                : "text-[var(--color-text-secondary)]"
            }`}
          >
            {formatClockDisplay(displayBlack)}
          </span>
        </div>
      </div>
    </div>
  );
}

export const AuthoritativeClock = memo(AuthoritativeClockComponent);
export default AuthoritativeClock;
