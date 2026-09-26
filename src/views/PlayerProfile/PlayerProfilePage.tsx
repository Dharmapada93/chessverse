"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserX } from "lucide-react";
import Link from "next/link";
import { socialService, type ProfileData, type Friend } from "@/services/social";
import PlayerProfile from "@/components/social/PlayerProfile";
import InviteModal from "@/components/invitations/InviteModal";
import SocialActions, { type SocialActionModalType } from "@/components/social/SocialActions";
import type { PlayerProfilePageProps } from "./types";

export function PlayerProfilePage({ username, className = "" }: PlayerProfilePageProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Challenge modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Social action modal
  const [actionType, setActionType] = useState<SocialActionModalType>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await socialService.fetchPlayerProfile(username);
        setProfile(data);
      } finally {
        setLoading(false);
      }
    }
    if (username) load();
  }, [username]);

  function handlePlay() {
    setIsInviteOpen(true);
  }

  function handleWatch() {
    const targetId = profile?.currentGameId || profile?.roomId;
    if (targetId) router.push(`/game/${targetId}/watch`);
  }

  function handleMessage() {
    if (profile?._id) router.push(`/messages?userId=${profile._id}`);
  }

  async function handleAddFriend() {
    if (!profile?._id) return;
    const res = await socialService.sendFriendRequest(profile._id);
    if (res.success) {
      setProfile((prev) => (prev ? { ...prev, isFriend: true } : prev));
    }
  }

  async function handleConfirmBlock(userId: string) {
    await socialService.blockUser(userId);
    router.push("/friends");
  }

  async function handleConfirmReport(payload: any) {
    await socialService.reportUser(payload);
  }

  if (!loading && !profile) {
    return (
      <div className="max-w-md mx-auto p-12 text-center rounded-[20px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[var(--color-border)] space-y-4 my-12 shadow-sm">
        <div className="w-14 h-14 rounded-[14px] bg-[#EDE9DE] dark:bg-[#18352B] flex items-center justify-center text-[#B58A3A] mx-auto">
          <UserX className="w-6 h-6" />
        </div>
        <h2 className="text-base font-serif font-bold text-[var(--color-text)]">Player Not Found</h2>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          No user exists with the username &quot;{username}&quot;.
        </p>
        <Link
          href="/friends"
          className="inline-block px-4 py-2 rounded-[12px] bg-[#18352B] hover:bg-[#285443] text-xs font-semibold text-[#FBF9F3] transition-colors shadow-sm"
        >
          Return to Friends
        </Link>
      </div>
    );
  }

  const friendObj: Friend | null = profile
    ? {
        _id: profile._id,
        username: profile.username,
        avatar: profile.avatar,
        rating: profile.rating,
        online: profile.online,
        inGame: profile.inGame,
        currentGameId: profile.currentGameId,
        roomId: profile.roomId,
        opponentName: profile.opponentName,
        presence: profile.presence,
      }
    : null;

  return (
    <div className={`max-w-4xl mx-auto px-4 py-6 sm:py-8 ${className}`}>
      {profile && (
        <PlayerProfile
          profile={profile}
          onPlay={handlePlay}
          onMessage={handleMessage}
          onWatch={handleWatch}
          onAddFriend={handleAddFriend}
          onBlock={() => setActionType("block")}
          onReport={() => setActionType("report")}
          loading={loading}
        />
      )}

      {/* Challenge Modal */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        friend={friendObj}
      />

      {/* Social Actions (Block, Report) */}
      <SocialActions
        modalType={actionType}
        targetUsername={profile?.username || username}
        targetUserId={profile?._id || ""}
        onClose={() => setActionType(null)}
        onConfirmBlock={handleConfirmBlock}
        onConfirmReport={handleConfirmReport}
      />
    </div>
  );
}

export default PlayerProfilePage;
