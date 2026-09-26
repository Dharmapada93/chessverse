"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Swords, Eye, MessageSquare, MoreVertical, UserMinus, ShieldAlert, Flag } from "lucide-react";
import OnlineStatus from "../OnlineStatus";
import type { FriendCardProps } from "./types";

export function FriendCard({
  friend,
  onPlay,
  onWatch,
  onMessage,
  onRemove,
  onBlock,
  onReport,
}: FriendCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative flex items-center justify-between p-3.5 sm:p-4 rounded-[14px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[var(--color-border)] hover:bg-[#F7F4EC] dark:hover:bg-[#283E34] transition-all group backdrop-blur-sm shadow-sm">
      {/* Player Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={`/player/${encodeURIComponent(friend.username)}`}
          className="relative flex-shrink-0"
        >
          <div className="w-11 h-11 rounded-full bg-[#EDE9DE] dark:bg-[#18352B] flex items-center justify-center text-[#18352B] dark:text-[#D3AA58] font-serif font-bold border border-[var(--color-border)] text-sm shadow-inner group-hover:scale-105 transition-transform">
            {friend.avatar ? (
              <img
                src={friend.avatar}
                alt={friend.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              friend.username.slice(0, 2).toUpperCase()
            )}
          </div>
        </Link>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/player/${encodeURIComponent(friend.username)}`}
              className="text-sm font-semibold text-[var(--color-text)] hover:text-[#B58A3A] truncate transition-colors"
            >
              {friend.username}
            </Link>
            <span className="text-xs px-2 py-0.5 rounded-[6px] bg-[#EDE9DE] dark:bg-[#18352B] text-[#B58A3A] font-mono font-semibold">
              {friend.rating}
            </span>
          </div>

          <div className="mt-1">
            <OnlineStatus
              presence={friend.presence}
              opponentName={friend.opponentName}
              lastSeen={friend.lastSeen}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Watch Game Button */}
        {friend.presence === "playing" && (
          <button
            onClick={() => onWatch?.(friend)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[12px] bg-[#B58A3A]/10 text-[#B58A3A] border border-[#B58A3A]/20 hover:bg-[#B58A3A]/20 transition-colors"
            title="Watch friend's game"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Watch</span>
          </button>
        )}

        {/* Play / Challenge Button */}
        <button
          onClick={() => onPlay?.(friend)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-[12px] bg-[#18352B] text-[#FBF9F3] hover:bg-[#285443] dark:bg-[#D3AA58] dark:text-[#18221E] transition-all shadow-sm active:scale-95"
          title="Challenge to a game"
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Play</span>
        </button>

        {/* Context Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-[8px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[#EDE9DE] dark:hover:bg-[#18352B] transition-colors"
            aria-label="Friend options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 w-44 rounded-[14px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[var(--color-border)] shadow-xl py-1 z-30 text-xs">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onMessage?.(friend);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[var(--color-text)] hover:bg-[#EDE9DE]/60 dark:hover:bg-[#18352B]/60 transition-colors text-left"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#B58A3A]" />
                  <span>Direct Message</span>
                </button>

                <div className="my-1 border-t border-[var(--color-border)]" />

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onRemove?.(friend);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[var(--color-text)] hover:bg-[#EDE9DE]/60 dark:hover:bg-[#18352B]/60 transition-colors text-left"
                >
                  <UserMinus className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                  <span>Remove Friend</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onBlock?.(friend);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[#A94B45] hover:bg-[#A94B45]/10 transition-colors text-left"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Block Player</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onReport?.(friend);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[#B58A3A] hover:bg-[#B58A3A]/10 transition-colors text-left"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report Player</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FriendCard;
