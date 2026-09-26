"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, Swords, Users, UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import ChallengeModal from "@/components/social/ChallengeModal";

type FriendPlayer = {
  _id: string;
  username: string;
  rating: number;
  avatar?: string;
  online?: boolean;
  statusNote?: string;
};

export default function PlayWithFriendsLobby() {
  const [friends, setFriends] = useState<FriendPlayer[]>([]);
  const [recentPlayers, setRecentPlayers] = useState<FriendPlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChallengeUser, setActiveChallengeUser] = useState<FriendPlayer | null>(null);

  useEffect(() => {
    async function loadLobbyData() {
      try {
        const [friendsRes, historyRes] = await Promise.all([
          apiFetch("/api/friends"),
          apiFetch("/api/games/history"),
        ]);

        if (friendsRes.ok) {
          const fData = await friendsRes.json();
          if (fData.success && Array.isArray(fData.friends)) {
            setFriends(fData.friends);
          }
        }

        if (historyRes.ok) {
          const hData = await historyRes.json();
          if (hData.success && Array.isArray(hData.games)) {
            const token = localStorage.getItem("chessverse-token");
            let myId = "";
            if (token) {
              try {
                myId = JSON.parse(atob(token.split(".")[1]))?.userId || "";
              } catch {}
            }

            const opponentsMap = new Map<string, FriendPlayer>();
            for (const g of hData.games) {
              const isWhite = g.whitePlayerId === myId;
              const oppId = isWhite ? g.blackPlayerId : g.whitePlayerId;
              const oppName = isWhite ? g.blackPlayerName : g.whitePlayerName;
              const oppRating = isWhite ? g.blackRating : g.whiteRating;

              if (oppId && oppName && !opponentsMap.has(oppId)) {
                opponentsMap.set(oppId, {
                  _id: oppId,
                  username: oppName,
                  rating: oppRating || 1500,
                  online: false,
                });
              }
            }
            setRecentPlayers(Array.from(opponentsMap.values()).slice(0, 5));
          }
        }
      } catch {}
    }

    loadLobbyData();

    function handlePresence(e: any) {
      const { userId, online } = e.detail || {};
      if (!userId) return;
      setFriends((current) =>
        current.map((f) => (f._id === userId ? { ...f, online } : f)),
      );
      setRecentPlayers((current) =>
        current.map((p) => (p._id === userId ? { ...p, online } : p)),
      );
    }

    window.addEventListener("chessverse:presence", handlePresence);

    return () => {
      window.removeEventListener("chessverse:presence", handlePresence);
    };
  }, []);

  const filteredOnline = useMemo(() => {
    return friends
      .filter((f) => f.online)
      .filter((f) =>
        f.username.toLowerCase().includes(searchQuery.toLowerCase().trim()),
      );
  }, [friends, searchQuery]);

  const filteredRecents = useMemo(() => {
    return recentPlayers.filter((p) =>
      p.username.toLowerCase().includes(searchQuery.toLowerCase().trim()),
    );
  }, [recentPlayers, searchQuery]);

  return (
    <div className="flex min-h-screen bg-transparent text-[#171A18] animate-pageEnter">
      <AppSidebar />

      <div className="min-w-0 flex-1">
        <AppHeader />

        <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
          {/* Header Title */}
          <div className="mb-8 border-b border-[rgba(30,30,20,0.08)] pb-5">
            <h1 className="text-2xl font-bold tracking-tight text-[#171A18]">
              Play With Friends
            </h1>
            <p className="mt-1 text-xs text-[#68706A]">
              Challenge someone you know to an unrated or rated match.
            </p>
          </div>

          {/* Search friends input */}
          <div className="mb-8 max-w-md">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#68706A]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search registered friends..."
                className="w-full rounded-xl border border-[rgba(30,30,20,0.12)] bg-white py-2.5 pl-10 pr-4 text-xs text-[#171A18] placeholder-[#68706A] outline-none transition focus:border-[#B88A32] shadow-sm"
              />
            </div>
          </div>

          {/* ONLINE SECTION */}
          <div className="mb-10">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#68706A]">
                Online
              </span>
              <span className="font-mono text-xs font-semibold text-emerald-700">
                {filteredOnline.length} online
              </span>
            </div>

            {filteredOnline.length === 0 ? (
              <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 p-8 text-center text-xs text-[#68706A] shadow-sm">
                No friends online right now.{" "}
                <Link href="/friends" className="text-[#B88A32] hover:underline font-semibold ml-1">
                  Find and add friends
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredOnline.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/90 p-3.5 sm:px-5 transition hover:border-[rgba(30,30,20,0.18)] shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFECE3] text-xs font-bold text-[#B88A32] border border-[rgba(30,30,20,0.08)]">
                        {friend.avatar || friend.username.slice(0, 2).toUpperCase()}
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profile/${friend.username}`}
                            className="text-xs font-semibold text-[#171A18] hover:text-[#B88A32] transition"
                          >
                            {friend.username}
                          </Link>
                          <span className="font-mono text-[11px] text-[#B88A32] font-semibold">
                            {friend.rating || 1500}
                          </span>
                        </div>

                        <p className="text-[10px] text-[#68706A]">
                          {friend.statusNote || "Online"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveChallengeUser(friend)}
                      className="rounded-xl border border-[#B88A32]/30 bg-[#B88A32]/10 px-3.5 py-1.5 text-xs font-semibold text-[#B88A32] hover:bg-[#B88A32] hover:text-white transition cursor-pointer shadow-sm"
                    >
                      Challenge
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT PLAYERS SECTION */}
          <div>
            <div className="mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#68706A]">
                Recent Opponents
              </span>
            </div>

            {filteredRecents.length === 0 ? (
              <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 p-8 text-center text-xs text-[#68706A] shadow-sm">
                No recent opponents found yet. Play a game to see recent players here.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredRecents.map((player) => (
                  <div
                    key={player._id}
                    className="flex items-center justify-between rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/90 p-3.5 sm:px-5 transition hover:border-[rgba(30,30,20,0.18)] shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFECE3] text-xs font-bold text-[#68706A] border border-[rgba(30,30,20,0.08)]">
                        {player.username.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#171A18]">
                            {player.username}
                          </span>
                          <span className="font-mono text-[11px] text-[#68706A]">
                            {player.rating || 1500}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#68706A]">Played recently</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveChallengeUser(player)}
                      className="rounded-xl border border-[rgba(30,30,20,0.12)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#171A18] hover:bg-[#FAF8F2] transition cursor-pointer shadow-sm"
                    >
                      Challenge
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Challenge Drawer */}
      {activeChallengeUser && (
        <ChallengeModal
          isOpen={!!activeChallengeUser}
          onClose={() => setActiveChallengeUser(null)}
          targetUser={activeChallengeUser}
          mode="drawer"
        />
      )}
    </div>
  );
}
