"use client";

import React, { memo } from "react";
import Link from "next/link";
import { Eye, ArrowRight } from "lucide-react";
import MiniBoard from "@/components/chess/MiniBoard";

export interface LiveGameData {
  id: string;
  whitePlayer: { name: string; rating: number; avatar?: string };
  blackPlayer: { name: string; rating: number; avatar?: string };
  timeControl: string;
  movesCount: number;
  currentMoveText?: string;
  spectators: number;
  fen: string;
  category?: "blitz" | "rapid" | "bullet" | "classical";
  isFriendsGame?: boolean;
}

interface LiveGameCardProps {
  game: LiveGameData;
}

function LiveGameCardComponent({ game }: LiveGameCardProps) {
  const currentStatus =
    game.currentMoveText || (game.movesCount > 0 ? `Move ${Math.ceil(game.movesCount / 2)}` : "Opening");

  return (
    <div className="group flex flex-col justify-between rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] p-4 transition-all duration-180 hover:border-[#B58A3A]/40 hover:shadow-[0_10px_35px_rgba(35,40,30,0.06)] hover:-translate-y-0.5">
      <div>
        {/* Top Badges */}
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#27815D]/20 bg-[#27815D]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#27815D]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#27815D] animate-pulse" />
            LIVE
          </span>

          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#B58A3A] dark:text-[#D3AA58]">
            {game.timeControl}
          </span>
        </div>

        {/* Lightweight Mini Board Preview */}
        <div className="mx-auto my-2 aspect-square max-w-[220px] overflow-hidden rounded-[10px] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#F7F4EC] dark:bg-[#1B2A24] shadow-xs transition-transform duration-200 group-hover:scale-[1.015]">
          <MiniBoard fen={game.fen} />
        </div>

        {/* Players Info */}
        <div className="mt-3.5 space-y-2 border-t border-[rgba(24,34,30,0.06)] dark:border-[rgba(255,255,255,0.06)] pt-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 items-center justify-center rounded-full border border-[rgba(24,34,30,0.25)] bg-[#FAF8F2] shadow-xs" />
              <span className="font-semibold text-[#18221E] dark:text-[#F4EFE3] truncate max-w-[130px]">
                {game.whitePlayer.name}
              </span>
            </div>
            <span className="font-mono text-xs font-medium text-[#69736C] dark:text-[#B5BDB5]">
              {game.whitePlayer.rating}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 items-center justify-center rounded-full border border-[rgba(24,34,30,0.4)] bg-[#18352B] dark:bg-[#13201B]" />
              <span className="font-semibold text-[#18221E] dark:text-[#F4EFE3] truncate max-w-[130px]">
                {game.blackPlayer.name}
              </span>
            </div>
            <span className="font-mono text-xs font-medium text-[#69736C] dark:text-[#B5BDB5]">
              {game.blackPlayer.rating}
            </span>
          </div>
        </div>

        {/* Game Status & Spectator Meta */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-[#69736C] dark:text-[#B5BDB5]">
          <span className="font-medium text-[#69736C] dark:text-[#B5BDB5]">{currentStatus}</span>
          {game.spectators > 0 ? (
            <div className="flex items-center gap-1 font-semibold text-[#B58A3A] dark:text-[#D3AA58]">
              <Eye size={12} />
              <span className="font-mono">{game.spectators} watching</span>
            </div>
          ) : (
            <span className="font-mono text-[10px] text-[#69736C]/70 dark:text-[#B5BDB5]/70">Live match</span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-3.5 border-t border-[rgba(24,34,30,0.06)] dark:border-[rgba(255,255,255,0.06)] pt-3">
        <Link
          href={`/watch/${game.id}`}
          className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-[rgba(24,34,30,0.10)] dark:border-[rgba(255,255,255,0.1)] bg-[#F7F4EC] dark:bg-[#1B2A24] py-2 text-xs font-bold text-[#18221E] dark:text-[#F4EFE3] transition-all duration-150 group-hover:bg-[#18352B] group-hover:text-[#F7F4EC] dark:group-hover:bg-[#D3AA58] dark:group-hover:text-[#13201B] shadow-xs cursor-pointer"
        >
          <span>Watch Game</span>
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

export const LiveGameCard = memo(LiveGameCardComponent);
export default LiveGameCard;
