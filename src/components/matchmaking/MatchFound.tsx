"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";

interface MatchFoundProps {
  gameId: string;
  playerName: string;
  playerRating: number;
  opponentName: string;
  opponentRating: number;
  timeControl: string;
  playerColor: "white" | "black";
}

export default function MatchFound({
  gameId,
  playerName,
  playerRating,
  opponentName,
  opponentRating,
  timeControl,
  playerColor,
}: MatchFoundProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(`/game/${gameId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameId, router]);

  const handleEnter = () => {
    router.push(`/game/${gameId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18352B]/40 dark:bg-[#0E1713]/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-[20px] border border-[#27815D]/30 bg-[#FBF9F3] dark:bg-[#21332B] p-8 text-center shadow-[0_20px_60px_rgba(35,30,20,0.15)] relative overflow-hidden text-[#18221E] dark:text-[#F4EFE3]">
        {/* Glow */}
        <div className="pointer-events-none absolute -top-20 inset-x-0 h-44 rounded-full bg-[#27815D]/10 blur-3xl" />

        {/* Header Tag */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#27815D]/30 bg-[#27815D]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#27815D]">
          <Check size={13} />
          <span>MATCH FOUND</span>
        </div>

        {/* Players Versus Box */}
        <div className="my-7 flex items-center justify-between gap-4 rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] p-4 shadow-sm">
          <div className="text-left flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  playerColor === "white"
                    ? "bg-[#FAF8F2] border-2 border-[#18221E]"
                    : "bg-[#18352B] dark:bg-[#13201B] border border-[rgba(24,34,30,0.5)]"
                }`}
              />
              <p className="truncate text-sm font-bold text-[#18221E] dark:text-[#F4EFE3]">
                {playerName}
              </p>
            </div>
            <p className="font-mono text-xs text-[#69736C] dark:text-[#B5BDB5] pl-4">{playerRating}</p>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#B58A3A]/15 text-[#B58A3A] dark:text-[#D3AA58] font-bold text-xs">
            VS
          </div>

          <div className="text-right flex-1 min-w-0">
            <div className="flex items-center justify-end gap-1.5">
              <p className="truncate text-sm font-bold text-[#18221E] dark:text-[#F4EFE3]">
                {opponentName}
              </p>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  playerColor === "white"
                    ? "bg-[#18352B] dark:bg-[#13201B] border border-[rgba(24,34,30,0.5)]"
                    : "bg-[#FAF8F2] border-2 border-[#18221E]"
                }`}
              />
            </div>
            <p className="font-mono text-xs text-[#69736C] dark:text-[#B5BDB5] pr-4">{opponentRating}</p>
          </div>
        </div>

        {/* Format */}
        <div className="mb-6 space-y-1">
          <p className="font-mono text-sm font-semibold text-[#18221E] dark:text-[#F4EFE3]">
            {timeControl}
          </p>
          <p className="text-[11px] text-[#69736C] dark:text-[#B5BDB5]">
            Entering match in <span className="font-mono text-[#27815D] font-bold">{countdown}s</span>...
          </p>
        </div>

        {/* Enter Button */}
        <button
          onClick={handleEnter}
          className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] py-3 text-xs font-bold uppercase tracking-wider text-[#F7F4EC] transition shadow-sm cursor-pointer hover:-translate-y-0.5"
        >
          <span>Enter Game</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
