"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Swords, Clock, AlertTriangle, ArrowRight, Loader2, Trophy } from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import { invitationService } from "@/services/social";

type InviteRouteProps = {
  params: Promise<{
    token: string;
  }>;
};

export default function GameInviteRoute({ params }: InviteRouteProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const router = useRouter();

  const [invite, setInvite] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await invitationService.fetchInviteLink(token);
        if (res.success && res.invite) {
          setInvite(res.invite);
        } else {
          setError(res.message || "Invitation link not found or expired.");
        }
      } catch {
        setError("Network error loading invitation.");
      } finally {
        setIsLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  async function handleJoin() {
    setIsJoining(true);
    setError(null);
    try {
      const res = await invitationService.acceptInviteLink(token);
      if (res.success && res.gameId) {
        router.push(`/game/${res.gameId}`);
      } else {
        setError(res.message || "Failed to join game.");
      }
    } catch {
      setError("Network error accepting invitation.");
    } finally {
      setIsJoining(false);
    }
  }

  const initialMin = invite?.timeControl
    ? Math.round(invite.timeControl.initialTime / 60000)
    : 10;
  const incSec = invite?.timeControl ? invite.timeControl.increment : 0;

  return (
    <div className="min-h-screen bg-transparent text-[#18221E] dark:text-[#F4EFE3] flex flex-col animate-pageEnter">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-[20px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[rgba(24,34,30,0.10)] dark:border-white/10 shadow-[0_20px_50px_rgba(24,34,30,0.15)] p-6 sm:p-8 space-y-6 text-center">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#B58A3A] animate-spin" />
              <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">Loading chess match invitation...</p>
            </div>
          ) : error ? (
            <div className="space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-rose-500/10 text-[#A94B45] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h2 className="text-base font-bold text-[#18221E] dark:text-[#F4EFE3]">
                Invitation Unavailable
              </h2>
              <p className="text-xs text-[#69736C] dark:text-[#B5BDB5] max-w-xs mx-auto">{error}</p>
              <div className="pt-2">
                <Link
                  href="/friends"
                  className="inline-block px-4 py-2 rounded-[12px] bg-[#F7F4EC] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.12)] hover:border-[#B58A3A]/40 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] transition-colors"
                >
                  Return to Friends
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Challenger Avatar & Identity */}
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#18352B] dark:bg-[#1B2A24] border-2 border-[rgba(24,34,30,0.12)] flex items-center justify-center text-xl font-bold text-[#B58A3A] mx-auto shadow-sm">
                  {invite?.creator?.avatar ? (
                    <img
                      src={invite.creator.avatar}
                      alt={invite.creator.username}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    invite?.creator?.username?.slice(0, 2).toUpperCase() || "CH"
                  )}
                </div>

                <div>
                  <h1 className="text-lg font-bold text-[#18221E] dark:text-[#F4EFE3]">
                    {invite?.creator?.username || "A player"} invited you to play!
                  </h1>
                  <span className="text-xs text-[#69736C] dark:text-[#B5BDB5] font-mono">
                    Rating: {invite?.creator?.rating || 1500}
                  </span>
                </div>
              </div>

              {/* Match Settings Card */}
              <div className="p-4 rounded-[14px] bg-[#F7F4EC] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.08)] space-y-2.5 text-xs text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[#69736C] dark:text-[#B5BDB5] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Time Control:</span>
                  </span>
                  <span className="font-semibold text-[#18221E] dark:text-[#F4EFE3]">
                    {initialMin}+{incSec} ({initialMin >= 10 ? "Rapid" : "Blitz"})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#69736C] dark:text-[#B5BDB5] flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5" />
                    <span>Color:</span>
                  </span>
                  <span className="font-semibold text-[#18221E] dark:text-[#F4EFE3] capitalize">
                    {invite?.colorPreference || "Random"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#69736C] dark:text-[#B5BDB5] flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Rated Match:</span>
                  </span>
                  <span className="font-semibold text-[#B58A3A]">
                    {invite?.rated ? "Yes (Rated)" : "Casual (Unrated)"}
                  </span>
                </div>
              </div>

              {/* Join Action Button */}
              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="w-full py-3 rounded-[12px] bg-[#18352B] text-[#F7F4EC] font-bold text-xs uppercase tracking-wider hover:bg-[#285443] transition-all shadow-xs active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isJoining ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#B58A3A]" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-[#B58A3A]" />
                )}
                <span>{isJoining ? "Entering Room..." : "Join Game"}</span>
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
