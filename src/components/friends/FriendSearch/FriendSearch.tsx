"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, UserPlus, Check, Clock, UserCheck, ShieldAlert, Loader2, X } from "lucide-react";
import { socialService } from "@/services/social";
import type { FriendSearchResult, FriendSearchProps } from "./types";

export function FriendSearch({
  onAddFriend,
  placeholder = "Search players by username...",
  className = "",
}: FriendSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FriendSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const users = await socialService.searchPlayers(query);
        setResults(users);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleAddClick(userId: string) {
    setPendingIds((prev) => new Set(prev).add(userId));
    try {
      if (onAddFriend) {
        await onAddFriend(userId);
      } else {
        await socialService.sendFriendRequest(userId);
      }
      setResults((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, relationship: "pending_sent" } : u)),
      );
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  }

  function renderActionButton(user: FriendSearchResult) {
    const isSending = pendingIds.has(user._id);

    if (user.relationship === "friends") {
      return (
        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-[10px] bg-[#27815D]/10 text-[#27815D] font-medium">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Friends</span>
        </span>
      );
    }

    if (user.relationship === "pending_sent") {
      return (
        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-[10px] bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] font-medium border border-[rgba(24,34,30,0.08)]">
          <Clock className="w-3.5 h-3.5 text-[#B58A3A]" />
          <span>Request Sent</span>
        </span>
      );
    }

    if (user.relationship === "blocked") {
      return (
        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-[10px] bg-[#A94B45]/10 text-[#A94B45] font-medium">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Blocked</span>
        </span>
      );
    }

    return (
      <button
        onClick={() => handleAddClick(user._id)}
        disabled={isSending}
        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-[12px] bg-[#18352B] text-[#F7F4EC] hover:bg-[#285443] active:scale-95 transition-all disabled:opacity-50 font-medium shadow-xs cursor-pointer"
      >
        {isSending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <UserPlus className="w-3.5 h-3.5 text-[#B58A3A]" />
        )}
        <span>Add Friend</span>
      </button>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Bar Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#69736C]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-[12px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[rgba(24,34,30,0.12)] dark:border-white/10 text-[#18221E] dark:text-[#F4EFE3] placeholder-[#69736C]/60 text-sm focus:outline-none focus:ring-1 focus:ring-[#B58A3A] focus:border-[#B58A3A] transition-all shadow-xs"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#69736C] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : isLoading ? (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B58A3A] animate-spin" />
        ) : null}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-[14px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[rgba(24,34,30,0.10)] dark:border-white/10 shadow-[0_12px_32px_rgba(35,40,30,0.12)] overflow-hidden z-40 max-h-80 overflow-y-auto divide-y divide-[rgba(24,34,30,0.06)] dark:divide-white/6">
          {isLoading && results.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#69736C] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#B58A3A]" />
              <span>Searching players...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#69736C]">
              No players found matching "{query}"
            </div>
          ) : (
            results.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 hover:bg-[#F7F4EC] dark:hover:bg-[#1B2A24] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-[#18352B] dark:bg-[#1B2A24] flex items-center justify-center text-xs font-semibold text-[#B58A3A]">
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
                    {user.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#27815D] ring-2 ring-[#FBF9F3] dark:ring-[#21332B]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <Link
                      href={`/player/${encodeURIComponent(user.username)}`}
                      className="text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:text-[#B58A3A] truncate block"
                    >
                      {user.username}
                    </Link>
                    <span className="text-[11px] text-[#69736C] dark:text-[#B5BDB5] font-mono">
                      {user.rating} Elo
                    </span>
                  </div>
                </div>

                <div>{renderActionButton(user)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default FriendSearch;
