"use client";

import React, { useState, useMemo } from "react";
import { Users, UserX, ArrowUpDown } from "lucide-react";
import FriendCard from "../FriendCard";
import type { FriendListProps, FriendFilter, FriendSort } from "./types";

export function FriendList({
  friends,
  onPlay,
  onWatch,
  onMessage,
  onRemove,
  onBlock,
  onReport,
  loading = false,
}: FriendListProps) {
  const [filter, setFilter] = useState<FriendFilter>("all");
  const [sort, setSort] = useState<FriendSort>("online_first");

  const counts = useMemo(() => {
    return {
      all: friends.length,
      online: friends.filter((f) => f.online && f.presence !== "playing").length,
      playing: friends.filter((f) => f.presence === "playing").length,
      offline: friends.filter((f) => !f.online).length,
    };
  }, [friends]);

  const filteredAndSortedFriends = useMemo(() => {
    let list = [...friends];

    // 1. Filtering
    if (filter === "online") {
      list = list.filter((f) => f.online && f.presence !== "playing");
    } else if (filter === "playing") {
      list = list.filter((f) => f.presence === "playing");
    } else if (filter === "offline") {
      list = list.filter((f) => !f.online);
    }

    // 2. Sorting
    list.sort((a, b) => {
      if (sort === "rating") {
        return b.rating - a.rating;
      }
      if (sort === "alphabetical") {
        return a.username.localeCompare(b.username);
      }
      // online_first default
      const presenceScore = (f: typeof a) => {
        if (f.presence === "playing") return 3;
        if (f.online) return 2;
        return 0;
      };
      const diff = presenceScore(b) - presenceScore(a);
      if (diff !== 0) return diff;
      return b.rating - a.rating;
    });

    return list;
  }, [friends, filter, sort]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="h-16 rounded-[14px] bg-[#FBF9F3]/60 dark:bg-[#21332B]/60 border border-[var(--color-border)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-[var(--color-border)]">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-[12px] text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-[#18352B] text-white dark:bg-[#D3AA58] dark:text-[#18221E] shadow-sm font-semibold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[#EDE9DE]/60 dark:hover:bg-[#18352B]/40"
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setFilter("online")}
            className={`px-3 py-1.5 rounded-[12px] text-xs font-medium transition-colors ${
              filter === "online"
                ? "bg-[#18352B] text-white dark:bg-[#D3AA58] dark:text-[#18221E] shadow-sm font-semibold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[#EDE9DE]/60 dark:hover:bg-[#18352B]/40"
            }`}
          >
            Online ({counts.online})
          </button>
          <button
            onClick={() => setFilter("playing")}
            className={`px-3 py-1.5 rounded-[12px] text-xs font-medium transition-colors ${
              filter === "playing"
                ? "bg-[#18352B] text-white dark:bg-[#D3AA58] dark:text-[#18221E] shadow-sm font-semibold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[#EDE9DE]/60 dark:hover:bg-[#18352B]/40"
            }`}
          >
            Playing ({counts.playing})
          </button>
          <button
            onClick={() => setFilter("offline")}
            className={`px-3 py-1.5 rounded-[12px] text-xs font-medium transition-colors ${
              filter === "offline"
                ? "bg-[#18352B] text-white dark:bg-[#D3AA58] dark:text-[#18221E] shadow-sm font-semibold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[#EDE9DE]/60 dark:hover:bg-[#18352B]/40"
            }`}
          >
            Offline ({counts.offline})
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as FriendSort)}
            className="bg-[#F7F4EC] dark:bg-[#13201B] border border-[var(--color-border)] text-[var(--color-text)] text-xs rounded-[10px] px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#B58A3A]"
          >
            <option value="online_first">Online First</option>
            <option value="rating">Highest Rating</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Friends Cards List */}
      {filteredAndSortedFriends.length === 0 ? (
        <div className="p-8 text-center rounded-[20px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[var(--color-border)] flex flex-col items-center justify-center shadow-sm">
          <div className="w-12 h-12 rounded-[14px] bg-[#EDE9DE] dark:bg-[#18352B] flex items-center justify-center text-[#B58A3A] mb-3">
            <UserX className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-serif font-bold text-[var(--color-text)]">No friends found</h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-xs leading-relaxed">
            {filter === "all"
              ? "You haven't added any friends yet. Search above to find opponents and connect!"
              : `No friends are currently ${filter}.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {filteredAndSortedFriends.map((friend) => (
            <FriendCard
              key={friend._id}
              friend={friend}
              onPlay={onPlay}
              onWatch={onWatch}
              onMessage={onMessage}
              onRemove={onRemove}
              onBlock={onBlock}
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendList;
