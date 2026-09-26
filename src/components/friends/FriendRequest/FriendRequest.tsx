"use client";

import React from "react";
import Link from "next/link";
import { Check, X, Clock } from "lucide-react";
import type { FriendRequestProps } from "./types";

export function FriendRequest({
  request,
  type,
  onAccept,
  onDecline,
  onCancel,
  loading = false,
}: FriendRequestProps) {
  const user = request.user || { username: "Player", rating: 1200 };

  return (
    <div className="flex items-center justify-between p-3.5 rounded-[14px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[rgba(24,34,30,0.08)] dark:border-white/8 hover:border-[rgba(24,34,30,0.16)] dark:hover:border-white/15 transition-all shadow-[0_4px_16px_rgba(35,40,30,0.04)]">
      <div className="flex items-center gap-3 min-w-0">
        <Link href={`/player/${encodeURIComponent(user.username)}`}>
          <div className="w-9 h-9 rounded-full bg-[#18352B] dark:bg-[#1B2A24] flex items-center justify-center text-[#B58A3A] font-semibold border border-[rgba(24,34,30,0.12)] text-xs shadow-inner">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.username.slice(0, 2).toUpperCase()
            )}
          </div>
        </Link>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/player/${encodeURIComponent(user.username)}`}
              className="text-xs font-bold text-[#18221E] dark:text-[#F4EFE3] hover:text-[#B58A3A] truncate transition-colors"
            >
              {user.username}
            </Link>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] font-mono border border-[rgba(24,34,30,0.06)] dark:border-white/6">
              {user.rating}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-[#69736C] dark:text-[#B5BDB5]">
            <Clock className="w-3 h-3" />
            <span>
              {type === "incoming" ? "Sent you a friend request" : "Pending request"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {type === "incoming" ? (
          <>
            <button
              onClick={() => onAccept?.(request.id)}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-[12px] bg-[#18352B] text-[#F7F4EC] hover:bg-[#285443] active:scale-95 transition-all disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-[#B58A3A]" />
              <span>Accept</span>
            </button>
            <button
              onClick={() => onDecline?.(request.id)}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-[12px] bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3] border border-[rgba(24,34,30,0.10)] dark:border-white/10 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Decline</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => onCancel?.(request.id)}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-[12px] bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] hover:text-[#A94B45] hover:bg-rose-500/10 border border-[rgba(24,34,30,0.10)] dark:border-white/10 transition-all disabled:opacity-50 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Cancel</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default FriendRequest;
