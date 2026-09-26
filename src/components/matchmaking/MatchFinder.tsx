"use client";

import { useEffect, useState } from "react";
import { Swords } from "lucide-react";
import { socket } from "@/lib/socket";

interface MatchFinderProps {
  timeControl: { initialTime: number; increment: number; label: string };
  playerRating: number;
  onCancel: () => void;
}

export default function MatchFinder({
  timeControl,
  playerRating,
  onCancel,
}: MatchFinderProps) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    // Send initial heartbeat and refresh every 5 seconds
    socket.emit("matchmaking:heartbeat");
    const heartbeatTimer = setInterval(() => {
      socket.emit("matchmaking:heartbeat");
    }, 5000);

    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(heartbeatTimer);
    };
  }, []);

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const ratingRange =
    secondsElapsed < 5
      ? "±100"
      : secondsElapsed < 10
      ? "±150"
      : secondsElapsed < 20
      ? "±200"
      : "±300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18352B]/40 dark:bg-[#0E1713]/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-[20px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-8 text-center shadow-[0_20px_60px_rgba(35,30,20,0.15)] relative overflow-hidden text-[#18221E] dark:text-[#F4EFE3]">
        {/* Subtle background ambient warm light */}
        <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-[#B58A3A]/10 blur-3xl" />

        {/* Title */}
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B58A3A] dark:text-[#D3AA58]">
          MATCHMAKING
        </span>
        <h3 className="mt-1 text-lg font-serif font-bold text-[#18221E] dark:text-[#F4EFE3] tracking-tight">
          Finding Opponent
        </h3>

        {/* Subtle Pulsing Radar / Indicator */}
        <div className="my-8 flex items-center justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute h-full w-full rounded-full border border-[#B58A3A]/25 animate-ping" />
            <div className="absolute h-16 w-16 rounded-full border border-[#B58A3A]/40" />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#B58A3A]/15 text-[#B58A3A] dark:text-[#D3AA58] shadow-sm">
              <Swords size={20} className="animate-pulse" />
            </div>
          </div>
        </div>

        {/* Game Details */}
        <div className="space-y-1">
          <p className="text-xl font-mono font-bold text-[#18221E] dark:text-[#F4EFE3]">
            {timeControl.label}
          </p>
          <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
            Rating <span className="font-mono text-[#18221E] dark:text-[#F4EFE3] font-semibold">{playerRating}</span> · Range{" "}
            <span className="text-[#B58A3A] dark:text-[#D3AA58] font-semibold">{ratingRange}</span>
          </p>
          <p className="text-[11px] text-[#69736C]/80 dark:text-[#B5BDB5]/80 pt-1">
            Looking for a similar rating
          </p>
        </div>

        {/* Timer */}
        <div className="mt-6 mb-6">
          <span className="font-mono text-2xl font-bold tracking-wider text-[#18221E] dark:text-[#F4EFE3]">
            {formatTime(secondsElapsed)}
          </span>
        </div>

        {/* Cancel Action */}
        <button
          onClick={onCancel}
          className="w-full rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] py-3 text-xs font-bold uppercase tracking-wider text-[#18221E] dark:text-[#F4EFE3] shadow-sm hover:bg-[#EDE9DE] dark:hover:bg-[#23372F] transition cursor-pointer"
        >
          Cancel Search
        </button>
      </div>
    </div>
  );
}
