"use client";

import React, { useState, useMemo } from "react";
import { Bell, CheckCheck, Inbox, Sparkles } from "lucide-react";
import NotificationItem from "../NotificationItem";
import type { NotificationCenterProps, NotificationCategory } from "./types";

export function NotificationCenter({
  notifications,
  onMarkAllRead,
  onRead,
  onAction,
  loading = false,
}: NotificationCenterProps) {
  const [category, setCategory] = useState<NotificationCategory>("all");

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    if (category === "challenges") {
      return notifications.filter((n) => n.type === "game_invite" || n.type === "challenge");
    }
    if (category === "friends") {
      return notifications.filter(
        (n) => n.type === "friend_request" || n.type === "friend_accepted",
      );
    }
    if (category === "messages") {
      return notifications.filter((n) => n.type === "message");
    }
    if (category === "system") {
      return notifications.filter(
        (n) => n.type === "system" || n.type === "game_finished" || n.type === "tournament",
      );
    }
    return notifications;
  }, [notifications, category]);

  return (
    <div className="space-y-4">
      {/* Header with Title & Mark All Read */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#B58A3A]" />
          <h2 className="text-base font-serif font-bold text-[var(--color-text)]">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#B58A3A]/10 text-[#B58A3A] border border-[#B58A3A]/20">
              {unreadCount} unread
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[#B58A3A] transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setCategory("all")}
          className={`px-3 py-1.5 rounded-[12px] text-xs font-medium transition-colors ${
            category === "all"
              ? "bg-[#18352B] text-white dark:bg-[#D3AA58] dark:text-[#18221E] shadow-sm"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[#EDE9DE]/60 dark:hover:bg-[#18352B]/40"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setCategory("challenges")}
          className={`px-3 py-1.5 rounded-[12px] text-xs font-medium transition-colors ${
            category === "challenges"
              ? "bg-[#18352B] text-white dark:bg-[#D3AA58] dark:text-[#18221E] shadow-sm"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[#EDE9DE]/60 dark:hover:bg-[#18352B]/40"
          }`}
        >
          Challenges
        </button>
        <button
          onClick={() => setCategory("friends")}
          className={`px-3 py-1.5 rounded-[12px] text-xs font-medium transition-colors ${
            category === "friends"
              ? "bg-[#18352B] text-white dark:bg-[#D3AA58] dark:text-[#18221E] shadow-sm"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[#EDE9DE]/60 dark:hover:bg-[#18352B]/40"
          }`}
        >
          Friends
        </button>
        <button
          onClick={() => setCategory("messages")}
          className={`px-3 py-1.5 rounded-[12px] text-xs font-medium transition-colors ${
            category === "messages"
              ? "bg-[#18352B] text-white dark:bg-[#D3AA58] dark:text-[#18221E] shadow-sm"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[#EDE9DE]/60 dark:hover:bg-[#18352B]/40"
          }`}
        >
          Messages
        </button>
        <button
          onClick={() => setCategory("system")}
          className={`px-3 py-1.5 rounded-[12px] text-xs font-medium transition-colors ${
            category === "system"
              ? "bg-[#18352B] text-white dark:bg-[#D3AA58] dark:text-[#18221E] shadow-sm"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[#EDE9DE]/60 dark:hover:bg-[#18352B]/40"
          }`}
        >
          System
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-16 rounded-[14px] bg-[#FBF9F3]/60 dark:bg-[#21332B]/60 border border-[var(--color-border)] animate-pulse"
            />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="p-10 text-center rounded-[20px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[var(--color-border)] flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-[14px] bg-[#EDE9DE] dark:bg-[#18352B] flex items-center justify-center text-[#B58A3A] mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-serif font-bold text-[var(--color-text)]">You&apos;re all caught up.</h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-xs leading-relaxed">
            No notifications in this category. We&apos;ll alert you when you receive new challenges or messages.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifications.map((notif) => (
            <NotificationItem
              key={notif._id}
              notification={notif}
              onRead={onRead}
              onAction={onAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
