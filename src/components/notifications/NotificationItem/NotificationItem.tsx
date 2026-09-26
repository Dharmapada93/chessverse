"use client";

import React from "react";
import Link from "next/link";
import { UserPlus, Swords, Trophy, Bell, MessageSquare, Check, X } from "lucide-react";
import type { NotificationItemProps } from "./types";

function formatRelativeTime(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return "Just now";
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

export function NotificationItem({
  notification,
  onRead,
  onAction,
}: NotificationItemProps) {
  function renderIcon() {
    switch (notification.type) {
      case "friend_request":
      case "friend_accepted":
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case "game_invite":
      case "challenge":
        return <Swords className="w-4 h-4 text-amber-400" />;
      case "game_finished":
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  }

  return (
    <div
      onClick={() => onRead?.(notification._id)}
      className={`relative flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-[14px] transition-all cursor-pointer ${
        notification.read
          ? "bg-[#FBF9F3] dark:bg-[#21332B] border border-[var(--color-border)] hover:bg-[#F7F4EC] dark:hover:bg-[#283E34]"
          : "bg-[#FAF8F2] dark:bg-[#243930] border-2 border-[#B58A3A]/40 hover:border-[#B58A3A]/70 shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 p-2 rounded-[12px] bg-[#EDE9DE] dark:bg-[#18352B] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
          {renderIcon()}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--color-text)] truncate">
              {notification.title || "Notification"}
            </span>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-[#B58A3A] flex-shrink-0" />
            )}
          </div>

          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-2">
            {notification.message}
          </p>

          <span className="text-[11px] text-[var(--color-text-secondary)] mt-1 block font-mono">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
      </div>

      {/* Action buttons if actionable */}
      {(notification.type === "game_invite" || notification.type === "challenge") &&
        notification.referenceId && (
          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onAction?.("accept_challenge", notification.referenceId)}
              className="p-1.5 rounded-[8px] bg-[#27815D]/10 text-[#27815D] hover:bg-[#27815D]/20 transition-colors"
              title="Accept Challenge"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAction?.("decline_challenge", notification.referenceId)}
              className="p-1.5 rounded-[8px] bg-[#EDE9DE] dark:bg-[#18352B] text-[var(--color-text-secondary)] hover:text-[#A94B45] transition-colors"
              title="Decline Challenge"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
    </div>
  );
}

export default NotificationItem;
