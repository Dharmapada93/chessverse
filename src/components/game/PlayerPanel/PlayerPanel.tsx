"use client";

import React from "react";
import Avatar from "@/components/ui/Avatar";
import ChessClock from "../ChessClock";
import { PlayerPanelProps } from "./types";
import { AlertTriangle } from "lucide-react";

function PlayerPanelComponent({
  name,
  rating,
  title,
  color,
  isCurrentTurn,
  isUserPlayer = false,
  clockMs,
  turnStartedAt,
  serverTime,
  isClockActive,
  capturedPieces = [],
  materialDifference = 0,
  isDisconnected = false,
  disconnectGraceSeconds = null,
  className = "",
  children,
}: PlayerPanelProps) {
  const isWhite = color === "white";

  return (
    <div
      className={[
        "flex flex-col gap-1.5 w-full rounded-[14px] border p-2.5 sm:p-3 transition-all duration-200",
        isCurrentTurn
          ? "bg-[#FBF9F3] border-[#B58A3A] shadow-[0_4px_20px_rgba(181,138,58,0.14)] dark:bg-[#21332B] dark:border-[#D3AA58]"
          : "bg-[#FBF9F3] border-[rgba(24,34,30,0.08)] shadow-[0_4px_16px_rgba(35,40,30,0.04)] dark:bg-[#21332B] dark:border-[rgba(255,255,255,0.08)]",
        className,
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3 min-w-0">
        {/* Left: Player Profile & Turn Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative">
            <Avatar name={name} size="game" status={isDisconnected ? "offline" : "online"} />
            <span
              title={isWhite ? "Playing White" : "Playing Black"}
              className={[
                "absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border shadow-xs flex items-center justify-center text-[8px]",
                isWhite
                  ? "bg-[#FAF8F2] text-[#18221E] border-[rgba(24,34,30,0.15)] dark:bg-[#FAF8F2] dark:text-[#18221E]"
                  : "bg-[#18352B] text-[#F7F4EC] border-[rgba(24,34,30,0.2)] dark:bg-[#13201B] dark:text-[#F4EFE3] dark:border-[rgba(255,255,255,0.15)]",
              ].join(" ")}
            >
              {isWhite ? "♔" : "♚"}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {title && (
                <span className="rounded bg-[#B58A3A] px-1 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider">
                  {title}
                </span>
              )}
              <span className="truncate text-xs sm:text-sm font-semibold text-[#18221E] dark:text-[#F4EFE3]">
                {name}
              </span>
              {isUserPlayer && (
                <span className="text-[10px] text-[#69736C] dark:text-[#B5BDB5] font-medium">
                  (You)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#69736C] dark:text-[#B5BDB5] font-mono">
              <span>{rating}</span>
              {isCurrentTurn && (
                <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold text-[#B58A3A] dark:text-[#D3AA58] tracking-wide">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B58A3A] dark:bg-[#D3AA58] animate-ping" />
                  {isUserPlayer ? "YOUR TURN" : "THINKING"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Clock & Disconnect indicator */}
        <div className="flex items-center gap-2 shrink-0">
          {children}

          <ChessClock
            timeMs={clockMs}
            turnStartedAt={turnStartedAt}
            serverTime={serverTime}
            active={isClockActive}
            disconnected={isDisconnected}
          />
        </div>
      </div>

      {/* Captured Pieces Bar */}
      {capturedPieces.length > 0 && (
        <div className="flex items-center gap-1 text-sm text-[#69736C] dark:text-[#B5BDB5] pl-1 select-none flex-wrap">
          {capturedPieces.map((sym, idx) => (
            <span key={idx} className="leading-none text-base">
              {sym}
            </span>
          ))}
          {materialDifference > 0 && (
            <span className="ml-1 text-[10px] font-mono font-bold text-[#B58A3A] dark:text-[#D3AA58]">
              +{materialDifference}
            </span>
          )}
        </div>
      )}

      {/* Disconnect Grace Period Alert */}
      {disconnectGraceSeconds !== null && disconnectGraceSeconds > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-[#18352B] bg-[#F7F4EC] border border-[#B58A3A]/30 px-2.5 py-1 rounded-[10px] dark:bg-[#1B2A24] dark:text-[#F4EFE3]">
          <AlertTriangle size={13} className="shrink-0 text-[#B58A3A] animate-bounce" />
          <span>Opponent disconnected. Forfeit in {disconnectGraceSeconds}s...</span>
        </div>
      )}
    </div>
  );
}

export default React.memo(PlayerPanelComponent);
