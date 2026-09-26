"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  RefreshCw,
  AlertCircle,
  Search,
  Eye,
  MessageSquare,
  MoreVertical,
} from "lucide-react";
import {
  socialService,
  presenceService,
  type Friend,
  type FriendRequestItem,
} from "@/services/social";
import FriendSearch from "@/components/friends/FriendSearch";
import FriendRequest from "@/components/friends/FriendRequest";
import InviteModal from "@/components/invitations/InviteModal";
import SocialActions, { type SocialActionModalType } from "@/components/social/SocialActions";
import ChallengeModal from "@/components/social/ChallengeModal";
import type { FriendsPageProps } from "./types";

export function FriendsPage({ className = "" }: FriendsPageProps) {
  const router = useRouter();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sections: "online" | "all" | "requests"
  const [activeSection, setActiveSection] = useState<"online" | "all" | "requests">("online");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddFriend, setShowAddFriend] = useState(false);

  // Challenge & Invite modals
  const [challengeFriend, setChallengeFriend] = useState<Friend | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Social Action Modal (Block, Remove, Report)
  const [actionModalType, setActionModalType] = useState<SocialActionModalType>(null);
  const [targetFriend, setTargetFriend] = useState<Friend | null>(null);

  async function loadData(showLoading = true) {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [friendsData, requestsData] = await Promise.all([
        socialService.fetchFriends(),
        socialService.fetchFriendRequests(),
      ]);
      setFriends(friendsData);
      setIncomingRequests(requestsData.incoming);
      setOutgoingRequests(requestsData.outgoing);
    } catch {
      setError("Couldn't load friends. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();

    const unsubscribePresence = presenceService.subscribe((update) => {
      setFriends((prev) =>
        prev.map((f) =>
          f._id === update.userId
            ? {
                ...f,
                online: update.online,
                presence: update.status,
                inGame: update.inGame,
                currentGameId: update.gameId,
                roomId: update.roomId,
                opponentName: update.opponentName,
              }
            : f
        )
      );
    });

    return () => {
      unsubscribePresence();
    };
  }, []);

  const onlineFriends = useMemo(() => {
    return friends.filter((f) => f.online);
  }, [friends]);

  const filteredFriends = useMemo(() => {
    const list = activeSection === "online" ? onlineFriends : friends;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((f) => f.username.toLowerCase().includes(q));
  }, [activeSection, onlineFriends, friends, searchQuery]);

  // Friend actions
  function handlePlay(friend: Friend) {
    setChallengeFriend(friend);
  }

  function handleWatch(friend: Friend) {
    const targetId = friend.currentGameId || friend.roomId;
    if (targetId) {
      router.push(`/game/${targetId}`);
    }
  }

  function handleMessage(friend: Friend) {
    router.push(`/messages?userId=${friend._id}`);
  }

  function openActionModal(type: SocialActionModalType, friend: Friend) {
    setTargetFriend(friend);
    setActionModalType(type);
  }

  async function handleConfirmBlock(userId: string) {
    await socialService.blockUser(userId);
    setFriends((prev) => prev.filter((f) => f._id !== userId));
  }

  async function handleConfirmRemove(userId: string) {
    await socialService.removeFriend(userId);
    setFriends((prev) => prev.filter((f) => f._id !== userId));
  }

  async function handleConfirmReport(payload: {
    reportedUserId: string;
    category: string;
    description?: string;
    gameId?: string;
  }) {
    await socialService.reportUser(payload);
  }

  // Request actions
  async function handleAcceptRequest(requestId: string) {
    const res = await socialService.acceptFriendRequest(requestId);
    if (res.success) {
      loadData(false);
    }
  }

  async function handleDeclineRequest(requestId: string) {
    const res = await socialService.declineFriendRequest(requestId);
    if (res.success) {
      loadData(false);
    }
  }

  async function handleCancelRequest(requestId: string) {
    const res = await socialService.cancelFriendRequest(requestId);
    if (res.success) {
      loadData(false);
    }
  }

  return (
    <div className={`max-w-[1440px] mx-auto px-4 py-8 sm:px-8 space-y-8 text-[#18221E] dark:text-[#F4EFE3] ${className}`}>
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(24,34,30,0.08)] dark:border-white/8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3]">
            Friends
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#69736C] dark:text-[#B5BDB5]">
            Connect, spectate, and challenge your registered friends in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(false)}
            disabled={isRefreshing}
            className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3] transition disabled:opacity-50 cursor-pointer shadow-xs"
            title="Refresh list"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin text-[#B58A3A]" : ""} />
          </button>

          <button
            onClick={() => setShowAddFriend((p) => !p)}
            className="flex items-center gap-1.5 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-3.5 py-2 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:border-[#B58A3A]/40 transition shadow-xs cursor-pointer"
          >
            <UserPlus size={14} className="text-[#B58A3A]" />
            <span>Add Friend</span>
          </button>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-1.5 rounded-[12px] bg-[#18352B] px-3.5 py-2 text-xs font-bold text-[#F7F4EC] hover:bg-[#285443] transition shadow-xs cursor-pointer"
          >
            <span>Invite Friends</span>
          </button>
        </div>
      </div>

      {/* Add Friend Search Input (collapsible or active) */}
      {showAddFriend && (
        <div className="rounded-[14px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-5 space-y-3 shadow-[0_4px_16px_rgba(35,40,30,0.04)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#18221E] dark:text-[#F4EFE3]">
            Search Users to Add
          </h3>
          <FriendSearch
            onAddFriend={async (userId) => {
              const res = await socialService.sendFriendRequest(userId);
              if (res.success) loadData(false);
              return res.success;
            }}
          />
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="flex items-center justify-between p-3.5 rounded-[12px] bg-rose-500/10 border border-rose-500/20 text-[#A94B45] text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData(true)}
            className="px-2.5 py-1 rounded-[10px] bg-[#F7F4EC] dark:bg-[#1B2A24] font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:bg-[#EDE9DE] transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Section Filter Tabs: Online | All Friends | Requests */}
      <div className="flex items-center justify-between gap-4 border-b border-[rgba(24,34,30,0.08)] dark:border-white/8 pb-3">
        <div className="flex items-center gap-1 bg-[#F7F4EC] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.08)] dark:border-white/8 p-1 rounded-[12px]">
          <button
            onClick={() => setActiveSection("online")}
            className={`rounded-[10px] px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeSection === "online"
                ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18221E] dark:text-[#F4EFE3] shadow-xs"
                : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
            }`}
          >
            Online ({onlineFriends.length})
          </button>
          <button
            onClick={() => setActiveSection("all")}
            className={`rounded-[10px] px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeSection === "all"
                ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18221E] dark:text-[#F4EFE3] shadow-xs"
                : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
            }`}
          >
            All Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveSection("requests")}
            className={`rounded-[10px] px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeSection === "requests"
                ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18221E] dark:text-[#F4EFE3] shadow-xs"
                : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
            }`}
          >
            <span>Requests</span>
            {incomingRequests.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#B58A3A] text-[10px] font-bold text-[#18352B]">
                {incomingRequests.length}
              </span>
            )}
          </button>
        </div>

        {activeSection !== "requests" && friends.length > 0 && (
          <div className="relative w-48 sm:w-60">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#69736C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends..."
              className="w-full rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] py-1.5 pl-8 pr-3 text-xs text-[#18221E] dark:text-[#F4EFE3] placeholder-[#69736C]/60 outline-none transition focus:border-[#B58A3A] shadow-xs"
            />
          </div>
        )}
      </div>

      {/* Content Rendering */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 rounded-[14px] bg-[#F7F4EC] dark:bg-[#1B2A24] animate-pulse border border-[rgba(24,34,30,0.08)] dark:border-white/8" />
          ))}
        </div>
      ) : activeSection === "online" ? (
        /* Online Section */
        onlineFriends.length === 0 ? (
          <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#FBF9F3] dark:bg-[#21332B] p-12 text-center text-xs text-[#69736C] dark:text-[#B5BDB5] space-y-2 shadow-xs">
            <p className="text-sm font-semibold text-[#18221E] dark:text-[#F4EFE3]">No friends are online.</p>
            <p>When your friends register and log in, they will automatically appear here ready to challenge.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredFriends.map((friend) => (
              <div
                key={friend._id}
                className="flex items-center justify-between rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#FBF9F3] dark:bg-[#21332B] p-3.5 px-5 transition duration-180 hover:border-[#B58A3A]/30 hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(35,40,30,0.04)]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#18352B] dark:bg-[#1B2A24] text-xs font-bold text-[#B58A3A] border border-[rgba(24,34,30,0.12)]">
                    {friend.username.slice(0, 2).toUpperCase()}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#21332B] bg-[#27815D]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${friend.username}`}
                        className="text-xs font-bold text-[#18221E] dark:text-[#F4EFE3] hover:text-[#B58A3A] hover:underline"
                      >
                        {friend.username}
                      </Link>
                      <span className="font-mono text-[11px] text-[#69736C] dark:text-[#B5BDB5]">
                        {friend.rating || 1500}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#27815D] flex items-center gap-1 font-medium">
                      ● Online {friend.inGame ? "(In Game)" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {friend.inGame && (
                    <button
                      type="button"
                      onClick={() => handleWatch(friend)}
                      className="rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-3 py-1.5 text-xs font-medium text-[#18221E] dark:text-[#F4EFE3] hover:border-[#B58A3A]/40 transition shadow-xs cursor-pointer"
                    >
                      <Eye size={13} className="inline mr-1 text-[#B58A3A]" />
                      Watch
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handlePlay(friend)}
                    className="rounded-[12px] bg-[#18352B] px-3.5 py-1.5 text-xs font-bold text-[#F7F4EC] hover:bg-[#285443] transition cursor-pointer shadow-xs"
                  >
                    Challenge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeSection === "all" ? (
        /* All Friends Section */
        friends.length === 0 ? (
          <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#FBF9F3] dark:bg-[#21332B] p-12 text-center text-xs text-[#69736C] dark:text-[#B5BDB5] space-y-3 max-w-md mx-auto shadow-[0_4px_16px_rgba(35,40,30,0.04)]">
            <Users size={24} className="mx-auto text-[#B58A3A]" />
            <p className="text-sm font-semibold text-[#18221E] dark:text-[#F4EFE3]">No friends yet.</p>
            <p>Invite your friends to build your ChessVerse circle and challenge them to live games.</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="rounded-[12px] bg-[#18352B] px-4 py-2 text-xs font-bold text-[#F7F4EC] hover:bg-[#285443] transition shadow-xs cursor-pointer"
              >
                Invite Friends
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredFriends.map((friend) => (
              <div
                key={friend._id}
                className="flex items-center justify-between rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#FBF9F3] dark:bg-[#21332B] p-3.5 px-5 transition duration-180 hover:border-[#B58A3A]/30 hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(35,40,30,0.04)]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#18352B] dark:bg-[#1B2A24] text-xs font-bold text-[#B58A3A] border border-[rgba(24,34,30,0.12)]">
                    {friend.username.slice(0, 2).toUpperCase()}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#21332B] ${
                        friend.online ? "bg-[#27815D]" : "bg-neutral-300 dark:bg-neutral-600"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${friend.username}`}
                        className="text-xs font-bold text-[#18221E] dark:text-[#F4EFE3] hover:text-[#B58A3A] hover:underline"
                      >
                        {friend.username}
                      </Link>
                      <span className="font-mono text-[11px] text-[#69736C] dark:text-[#B5BDB5]">
                        {friend.rating || 1500}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#69736C] dark:text-[#B5BDB5]">
                      {friend.online ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMessage(friend)}
                    className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3] transition shadow-xs cursor-pointer"
                    title="Send message"
                  >
                    <MessageSquare size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlay(friend)}
                    className="rounded-[12px] bg-[#18352B] px-3.5 py-1.5 text-xs font-bold text-[#F7F4EC] hover:bg-[#285443] transition cursor-pointer shadow-xs"
                  >
                    Challenge
                  </button>
                  <button
                    type="button"
                    onClick={() => openActionModal("remove", friend)}
                    className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#69736C] dark:text-[#B5BDB5] hover:text-[#A94B45] transition cursor-pointer"
                    title="Remove friend"
                  >
                    <MoreVertical size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Requests Section */
        <div className="space-y-4">
          <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#FBF9F3] dark:bg-[#21332B] p-5 space-y-3 shadow-[0_4px_16px_rgba(35,40,30,0.04)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] block">
              Pending Requests ({incomingRequests.length + outgoingRequests.length})
            </span>

            {incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#69736C] dark:text-[#B5BDB5]">
                No pending friend requests.
              </div>
            ) : (
              <div className="space-y-2.5">
                {incomingRequests.map((req) => (
                  <FriendRequest
                    key={req.id}
                    request={req}
                    type="incoming"
                    onAccept={handleAcceptRequest}
                    onDecline={handleDeclineRequest}
                  />
                ))}

                {outgoingRequests.map((req) => (
                  <FriendRequest
                    key={req.id}
                    request={req}
                    type="outgoing"
                    onCancel={handleCancelRequest}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Challenge Drawer */}
      {challengeFriend && (
        <ChallengeModal
          isOpen={!!challengeFriend}
          onClose={() => setChallengeFriend(null)}
          targetUser={challengeFriend}
          mode="drawer"
        />
      )}

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* Social Actions Modal (Block, Remove, Report) */}
      <SocialActions
        modalType={actionModalType}
        targetUsername={targetFriend?.username || "Player"}
        targetUserId={targetFriend?._id || ""}
        onClose={() => setActionModalType(null)}
        onConfirmBlock={handleConfirmBlock}
        onConfirmRemove={handleConfirmRemove}
        onConfirmReport={handleConfirmReport}
      />
    </div>
  );
}

export default FriendsPage;
