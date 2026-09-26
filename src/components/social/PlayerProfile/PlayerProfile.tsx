"use client";

import React from "react";
import Link from "next/link";
import {
  Swords,
  MessageSquare,
  Eye,
  UserPlus,
  UserCheck,
  ShieldAlert,
  Flag,
  Lock,
  Trophy,
  History,
  TrendingUp,
  Award,
} from "lucide-react";
import OnlineStatus from "@/components/friends/OnlineStatus";
import type { PlayerProfileProps } from "./types";

export function PlayerProfile({
  profile,
  onPlay,
  onMessage,
  onWatch,
  onAddFriend,
  onBlock,
  onReport,
  loading = false,
}: PlayerProfileProps) {
  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-32 rounded-2xl bg-white/60 border border-[rgba(30,30,20,0.08)]" />
        <div className="h-24 rounded-2xl bg-white/40 border border-[rgba(30,30,20,0.06)]" />
        <div className="h-64 rounded-2xl bg-white/40 border border-[rgba(30,30,20,0.06)]" />
      </div>
    );
  }

  // 1. Private Profile Gate (R4.19, R4.56)
  if (profile.isPrivate) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-2xl bg-white/85 border border-[rgba(30,30,20,0.08)] max-w-md mx-auto space-y-4 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
        <div className="w-16 h-16 rounded-full bg-[#FAF8F2] border border-[rgba(30,30,20,0.08)] flex items-center justify-center text-[#68706A] mx-auto">
          <Lock className="w-7 h-7 text-[#B88A32]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#171A18]">{profile.username}</h2>
          <p className="text-xs text-[#68706A] mt-1">
            {profile.message || "This player's profile and game statistics are private."}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/friends"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[rgba(30,30,20,0.12)] hover:bg-[#FAF8F2] text-xs font-semibold text-[#171A18] transition-colors shadow-sm"
          >
            Back to Friends
          </Link>
        </div>
      </div>
    );
  }

  const stats = profile.stats || { games: 0, wins: 0, draws: 0, losses: 0, winRate: 0 };
  const ratings = profile.ratings || {
    bullet: profile.rating,
    blitz: profile.rating,
    rapid: profile.rating,
    classical: profile.rating,
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/85 border border-[rgba(30,30,20,0.08)] shadow-[0_8px_30px_rgba(35,30,20,0.04)] backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-left">
          {/* Avatar and Identity */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-[#EFECE3] flex items-center justify-center text-2xl font-bold text-[#B88A32] border border-[rgba(30,30,20,0.08)] shadow-sm overflow-hidden">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.username.slice(0, 2).toUpperCase()
              )}
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-[#171A18] tracking-tight">
                  {profile.username}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#FAF8F2] border border-[rgba(30,30,20,0.08)] text-[#B88A32] font-mono font-semibold">
                  {profile.rating}
                </span>
              </div>

              <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-2">
                <OnlineStatus
                  presence={profile.presence}
                  opponentName={profile.opponentName}
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {profile.presence === "playing" && (
              <button
                onClick={onWatch}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#B88A32]/10 text-[#B88A32] border border-[#B88A32]/30 hover:bg-[#B88A32]/20 text-xs font-semibold transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>Watch</span>
              </button>
            )}

            <button
              onClick={onPlay}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B88A32] text-white text-xs font-semibold hover:bg-[#A07628] transition-all shadow-sm hover:-translate-y-0.5"
            >
              <Swords className="w-4 h-4" />
              <span>Challenge</span>
            </button>

            <button
              onClick={onMessage}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[rgba(30,30,20,0.12)] hover:bg-[#FAF8F2] text-[#171A18] text-xs font-semibold transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message</span>
            </button>

            {profile.isFriend ? (
              <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <UserCheck className="w-4 h-4" />
                <span>Friends</span>
              </span>
            ) : (
              <button
                onClick={onAddFriend}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[rgba(30,30,20,0.12)] hover:bg-[#FAF8F2] text-[#171A18] text-xs font-semibold transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4 text-[#B88A32]" />
                <span>Add Friend</span>
              </button>
            )}

            <div className="flex items-center gap-1">
              <button
                onClick={onBlock}
                className="p-2 rounded-xl text-[#68706A] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Block User"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
              <button
                onClick={onReport}
                className="p-2 rounded-xl text-[#68706A] hover:text-[#B88A32] hover:bg-[#FAF8F2] transition-colors"
                title="Report User"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Calculated Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white/85 border border-[rgba(30,30,20,0.08)] text-center shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
          <div className="text-2xl font-bold text-[#171A18] font-mono">
            {stats.games}
          </div>
          <div className="text-xs text-[#68706A] mt-0.5">Games Played</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/85 border border-[rgba(30,30,20,0.08)] text-center shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            {stats.wins}
          </div>
          <div className="text-xs text-emerald-700 mt-0.5">Wins</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/85 border border-[rgba(30,30,20,0.08)] text-center shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
          <div className="text-2xl font-bold text-[#68706A] font-mono">
            {stats.draws}
          </div>
          <div className="text-xs text-[#68706A] mt-0.5">Draws</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/85 border border-[rgba(30,30,20,0.08)] text-center shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
          <div className="text-2xl font-bold text-[#B88A32] font-mono">
            {stats.winRate}%
          </div>
          <div className="text-xs text-[#B88A32] mt-0.5">Win Rate</div>
        </div>
      </div>

      {/* 3. Ratings Grid */}
      <div className="p-5 rounded-2xl bg-white/85 border border-[rgba(30,30,20,0.08)] space-y-3 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#171A18]">
          <Trophy className="w-4 h-4 text-[#B88A32]" />
          <span>Format Ratings</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[rgba(30,30,20,0.06)]">
            <div className="text-[11px] text-[#68706A] font-medium">Bullet</div>
            <div className="text-base font-bold text-[#171A18] font-mono mt-0.5">
              {ratings.bullet}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[rgba(30,30,20,0.06)]">
            <div className="text-[11px] text-[#68706A] font-medium">Blitz</div>
            <div className="text-base font-bold text-[#B88A32] font-mono mt-0.5">
              {ratings.blitz}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[rgba(30,30,20,0.06)]">
            <div className="text-[11px] text-[#68706A] font-medium">Rapid</div>
            <div className="text-base font-bold text-[#171A18] font-mono mt-0.5">
              {ratings.rapid}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[rgba(30,30,20,0.06)]">
            <div className="text-[11px] text-[#68706A] font-medium">Classical</div>
            <div className="text-base font-bold text-[#171A18] font-mono mt-0.5">
              {ratings.classical}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Restrained Achievements */}
      <div className="p-5 rounded-2xl bg-white/85 border border-[rgba(30,30,20,0.08)] space-y-3 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#171A18]">
          <Award className="w-4 h-4 text-[#B88A32]" />
          <span>Chess Milestones</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            {
              id: "first-victory",
              icon: "♟",
              title: "First Victory",
              desc: "Won your first rated game",
              unlocked: stats.wins >= 1,
            },
            {
              id: "tactical-mind",
              icon: "♞",
              title: "Tactical Mind",
              desc: "5+ match victories",
              unlocked: stats.wins >= 5,
            },
            {
              id: "100-games",
              icon: "♜",
              title: "100 Games",
              desc: "100 rated matches",
              unlocked: stats.games >= 100,
            },
            {
              id: "comeback",
              icon: "♛",
              title: "Comeback",
              desc: "Rating above 1500",
              unlocked: profile.rating >= 1500,
            },
          ].map((ach) => (
            <div
              key={ach.id}
              className={`p-3 rounded-xl border transition-all ${
                ach.unlocked
                  ? "border-[#B88A32]/30 bg-[#B88A32]/10 text-[#171A18] shadow-xs"
                  : "border-[rgba(30,30,20,0.06)] bg-[#FAF8F2]/60 text-[#68706A] opacity-60"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{ach.icon}</span>
                <span className="text-xs font-semibold tracking-tight text-[#171A18]">
                  {ach.title}
                </span>
              </div>
              <p className="text-[10px] text-[#68706A] mt-1 leading-snug">
                {ach.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Recent Games History */}
      <div className="p-5 rounded-2xl bg-white/85 border border-[rgba(30,30,20,0.08)] space-y-3 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#171A18]">
            <History className="w-4 h-4 text-[#B88A32]" />
            <span>Recent Games</span>
          </div>
        </div>

        {(!profile.recentGames || profile.recentGames.length === 0) ? (
          <div className="p-6 text-center text-xs text-[#68706A]">
            No completed games recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-[rgba(30,30,20,0.06)]">
            {profile.recentGames.map((g, idx) => (
              <div
                key={idx}
                className="py-2.5 flex items-center justify-between text-xs hover:bg-[#FAF8F2] px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      g.result === "win"
                        ? "bg-emerald-500"
                        : g.result === "draw"
                        ? "bg-neutral-400"
                        : "bg-rose-500"
                    }`}
                  />
                  <div>
                    <span className="font-semibold text-[#171A18]">
                      vs {g.opponent.username}
                    </span>
                    <span className="text-[11px] text-[#68706A] ml-1.5">
                      ({g.opponent.rating}) • {g.timeControl}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-semibold capitalize ${
                      g.result === "win"
                        ? "text-emerald-600"
                        : g.result === "draw"
                        ? "text-[#68706A]"
                        : "text-rose-600"
                    }`}
                  >
                    {g.result}
                  </span>
                  {g.gameId && (
                    <Link
                      href={`/analysis/${g.gameId}`}
                      className="text-[#B88A32] hover:text-[#A07628] font-semibold transition-colors"
                    >
                      Review
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerProfile;
