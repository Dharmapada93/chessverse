"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Swords,
  UserPlus,
  Share2,
  Award,
  Settings as SettingsIcon,
  LogOut,
  Clock,
  History,
  Check,
  Eye,
  Bot,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { socket } from "@/lib/socket";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import ChallengeModal from "@/components/social/ChallengeModal";
import { useAuth } from "@/context/AuthContext";

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

type ActiveTab = "overview" | "games" | "achievements" | "settings";

export default function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const router = useRouter();
  const { logout } = useAuth();

  const [profileData, setProfileData] = useState<any>(null);
  const [progressionData, setProgressionData] = useState<any>(null);
  const [achievementsList, setAchievementsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [currentAuthUser, setCurrentAuthUser] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [profileRes, friendsRes, progRes, meRes] = await Promise.all([
          apiFetch(`/api/users/${encodeURIComponent(username)}`),
          apiFetch("/api/friends"),
          apiFetch("/api/progression/me"),
          apiFetch("/api/auth/me"),
        ]);

        if (meRes.ok) {
          const mData = await meRes.json();
          if (mData.user?.username) {
            setCurrentAuthUser(mData.user.username);
          }
        }

        if (profileRes.ok) {
          const pData = await profileRes.json();
          if (pData.success && pData.user) {
            setProfileData(pData.user);
          }
        }

        if (progRes.ok) {
          const prData = await progRes.json();
          if (prData.success) {
            setProgressionData(prData.progression);
            if (Array.isArray(prData.achievements)) {
              setAchievementsList(prData.achievements);
            }
          }
        }

        if (friendsRes.ok) {
          const fData = await friendsRes.json();
          if (fData.success && Array.isArray(fData.friends)) {
            const found = fData.friends.find(
              (f: any) => f.username?.toLowerCase() === username.toLowerCase()
            );
            if (found) {
              setIsFriend(true);
            }
          }
        }
      } catch {
        // Handled silently
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [username]);

  const isOwnProfile =
    currentAuthUser?.toLowerCase() === username.toLowerCase();

  const handleLogout = async () => {
    await logout();
  };

  const handleAddFriend = async () => {
    if (!profileData?._id) return;
    try {
      const res = await apiFetch("/api/friends/request", {
        method: "POST",
        body: JSON.stringify({ userId: profileData._id }),
      });
      if (res.ok) {
        setIsPending(true);
      }
    } catch {}
  };

  const handleCopyProfile = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-transparent text-[#17221D] animate-pageEnter">
        <AppSidebar />
        <div className="min-w-0 flex-1 pb-16 md:pb-0">
          <AppHeader />
          <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 space-y-8">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[rgba(30,40,30,0.08)] pb-8">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#EAE4D7]/50 animate-pulse border border-[rgba(30,40,30,0.08)]" />
                <div className="space-y-2">
                  <div className="h-7 w-40 rounded-lg bg-[#EAE4D7]/50 animate-pulse" />
                  <div className="h-4 w-28 rounded-lg bg-[#EAE4D7]/40 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-24 rounded-xl bg-[#EAE4D7]/40 animate-pulse" />
                <div className="h-9 w-28 rounded-xl bg-[#EAE4D7]/40 animate-pulse" />
              </div>
            </div>

            {/* 4 Stat card skeletons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-20 rounded-2xl bg-[#EAE4D7]/40 animate-pulse border border-[rgba(30,40,30,0.08)]" />
              ))}
            </div>

            {/* Content card skeleton */}
            <div className="h-64 rounded-3xl bg-[#EAE4D7]/30 animate-pulse border border-[rgba(30,40,30,0.08)]" />
          </main>
        </div>
      </div>
    );
  }

  const stats = profileData?.stats || {
    games: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    winRate: 0,
  };

  const recentGames = Array.isArray(profileData?.recentGames)
    ? profileData.recentGames
    : [];

  const ratings = profileData?.ratings || {
    bullet: profileData?.rating || 1500,
    blitz: profileData?.rating || 1500,
    rapid: profileData?.rating || 1500,
  };

  return (
    <div className="flex min-h-screen bg-transparent text-[#18221E] dark:text-[#F4EFE3] animate-pageEnter">
      <AppSidebar />

      <div className="min-w-0 flex-1 pb-16 md:pb-0">
        <AppHeader />

        <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 space-y-8">
          {/* Header: Avatar, Name, Rating & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[rgba(24,34,30,0.08)] dark:border-white/8 pb-8">
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#18352B] dark:bg-[#1B2A24] text-xl sm:text-2xl font-bold text-[#B58A3A] border border-[rgba(24,34,30,0.12)] shadow-xs">
                {username.slice(0, 2).toUpperCase()}
                <span
                  className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white dark:border-[#21332B] ${
                    profileData?.online ? "bg-[#27815D]" : "bg-neutral-400 dark:bg-neutral-600"
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3]">
                    {username}
                  </h1>
                  {profileData?.online && (
                    <span className="text-[10px] font-semibold text-[#27815D] bg-[#27815D]/10 border border-[#27815D]/20 px-2.5 py-0.5 rounded-full">
                      ● Online
                    </span>
                  )}
                </div>
                <p className="mt-1 font-mono text-xs sm:text-sm text-[#B58A3A] font-semibold">
                  Elo Rating {profileData?.rating || 1500}
                </p>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyProfile}
                className="flex items-center gap-1.5 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-3.5 py-2 text-xs font-semibold text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3] transition shadow-xs cursor-pointer"
              >
                {copiedLink ? <Check size={14} className="text-[#27815D]" /> : <Share2 size={14} />}
                <span>{copiedLink ? "Copied" : "Share"}</span>
              </button>

              {!isOwnProfile && (
                <>
                  {!isFriend && (
                    <button
                      type="button"
                      onClick={handleAddFriend}
                      disabled={isPending}
                      className="flex items-center gap-1.5 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-3.5 py-2 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:border-[#B58A3A]/40 transition shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <UserPlus size={14} className="text-[#B58A3A]" />
                      <span>{isPending ? "Requested" : "Add Friend"}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsChallengeOpen(true)}
                    className="flex items-center gap-1.5 rounded-[12px] bg-[#18352B] px-4 py-2 text-xs font-bold text-[#F7F4EC] hover:bg-[#285443] transition shadow-xs cursor-pointer"
                  >
                    <Swords size={14} className="text-[#B58A3A]" />
                    <span>Challenge</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats Bar: Games, Wins, Draws, Losses (Only Real Values) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#FBF9F3] dark:bg-[#21332B] p-4 text-center shadow-[0_4px_16px_rgba(35,40,30,0.04)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] block">
                Total Games
              </span>
              <span className="mt-1 font-mono text-2xl font-bold text-[#18221E] dark:text-[#F4EFE3]">
                {stats.games}
              </span>
            </div>

            <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#FBF9F3] dark:bg-[#21332B] p-4 text-center shadow-[0_4px_16px_rgba(35,40,30,0.04)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#27815D] block">
                Wins
              </span>
              <span className="mt-1 font-mono text-2xl font-bold text-[#27815D]">
                {stats.wins}
              </span>
            </div>

            <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#FBF9F3] dark:bg-[#21332B] p-4 text-center shadow-[0_4px_16px_rgba(35,40,30,0.04)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B58A3A] block">
                Draws
              </span>
              <span className="mt-1 font-mono text-2xl font-bold text-[#B58A3A]">
                {stats.draws}
              </span>
            </div>

            <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#FBF9F3] dark:bg-[#21332B] p-4 text-center shadow-[0_4px_16px_rgba(35,40,30,0.04)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A94B45] block">
                Losses
              </span>
              <span className="mt-1 font-mono text-2xl font-bold text-[#A94B45]">
                {stats.losses}
              </span>
            </div>
          </div>

          {/* Section Navigation Tabs: Overview | Games | Achievements | Settings */}
          <div className="flex items-center gap-1 border-b border-[rgba(24,34,30,0.08)] dark:border-white/8 pb-3">
            <div className="flex items-center gap-1 rounded-[12px] bg-[#F7F4EC] dark:bg-[#1B2A24] p-1 border border-[rgba(24,34,30,0.08)] dark:border-white/8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`rounded-[10px] px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18221E] dark:text-[#F4EFE3] shadow-xs"
                    : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("games")}
                className={`rounded-[10px] px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  activeTab === "games"
                    ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18221E] dark:text-[#F4EFE3] shadow-xs"
                    : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
                }`}
              >
                Games ({stats.games})
              </button>
              <button
                onClick={() => setActiveTab("achievements")}
                className={`rounded-[10px] px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  activeTab === "achievements"
                    ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18221E] dark:text-[#F4EFE3] shadow-xs"
                    : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
                }`}
              >
                Achievements
              </button>
              {isOwnProfile && (
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`rounded-[10px] px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    activeTab === "settings"
                      ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18221E] dark:text-[#F4EFE3] shadow-xs"
                      : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
                  }`}
                >
                  Settings
                </button>
              )}
            </div>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="rounded-[20px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-6 space-y-4 shadow-[0_4px_16px_rgba(35,40,30,0.04)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5]">
                  Format Ratings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#F7F4EC] dark:bg-[#1B2A24] p-4 text-center">
                    <span className="text-[10px] uppercase font-semibold text-[#69736C] dark:text-[#B5BDB5]">Bullet</span>
                    <span className="font-mono text-xl font-bold text-[#18221E] dark:text-[#F4EFE3] block mt-1">
                      {ratings.bullet}
                    </span>
                  </div>
                  <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#F7F4EC] dark:bg-[#1B2A24] p-4 text-center">
                    <span className="text-[10px] uppercase font-semibold text-[#B58A3A]">Blitz</span>
                    <span className="font-mono text-xl font-bold text-[#B58A3A] block mt-1">
                      {ratings.blitz}
                    </span>
                  </div>
                  <div className="rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#F7F4EC] dark:bg-[#1B2A24] p-4 text-center">
                    <span className="text-[10px] uppercase font-semibold text-[#69736C] dark:text-[#B5BDB5]">Rapid</span>
                    <span className="font-mono text-xl font-bold text-[#18221E] dark:text-[#F4EFE3] block mt-1">
                      {ratings.rapid}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Games Archive */}
          {activeTab === "games" && (
            <div className="space-y-4">
              {recentGames.length === 0 ? (
                <div className="rounded-[20px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-12 text-center text-xs text-[#69736C] dark:text-[#B5BDB5] space-y-2 shadow-[0_4px_16px_rgba(35,40,30,0.04)]">
                  <p className="text-sm font-semibold text-[#18221E] dark:text-[#F4EFE3]">No games played yet.</p>
                  <p>When completed matches are registered, they will appear here in the player archive.</p>
                  {isOwnProfile && (
                    <div className="pt-2">
                      <Link
                        href="/play"
                        className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#18352B] px-4 py-2 text-xs font-bold text-[#F7F4EC] hover:bg-[#285443] transition shadow-xs"
                      >
                        Play a Game
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentGames.map((game: any) => (
                    <div
                      key={game.gameId || game._id}
                      className="flex items-center justify-between rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#FBF9F3] dark:bg-[#21332B] p-3.5 px-5 transition duration-180 hover:border-[#B58A3A]/30 text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-[8px] font-bold ${
                            game.result === "win"
                              ? "bg-[#27815D]/10 text-[#27815D] border border-[#27815D]/20"
                              : game.result === "loss"
                              ? "bg-[#A94B45]/10 text-[#A94B45] border border-[#A94B45]/20"
                              : "bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] border border-[rgba(24,34,30,0.08)]"
                          }`}
                        >
                          {game.result === "win" ? "W" : game.result === "loss" ? "L" : "½"}
                        </span>
                        <div>
                          <span className="font-semibold text-[#18221E] dark:text-[#F4EFE3]">
                            vs {game.opponent?.username || "Opponent"}
                          </span>
                          <span className="text-[11px] text-[#69736C] dark:text-[#B5BDB5] font-mono block">
                            {game.timeControl} · {game.movesCount || 0} moves
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/analysis?gameId=${game.gameId || game._id}`}
                        className="flex items-center gap-1.5 rounded-[10px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-3 py-1.5 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] hover:border-[#B58A3A]/40 hover:text-[#B58A3A] transition shadow-xs"
                      >
                        <Bot size={13} className="text-[#B58A3A]" />
                        <span>Analyze</span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Achievements */}
          {activeTab === "achievements" && (
            <div className="rounded-[20px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-6 space-y-4 shadow-[0_4px_16px_rgba(35,40,30,0.04)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5]">
                Milestones & Badges
              </h3>
              {achievementsList.length === 0 ? (
                <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">No achievements unlocked yet. Play games to earn badges.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {achievementsList.map((ach) => (
                    <div
                      key={ach.id}
                      className="flex items-center gap-3 rounded-[14px] border border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#F7F4EC] dark:bg-[#1B2A24] p-3.5"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#18352B] dark:bg-[#1B2A24] text-[#B58A3A]">
                        <Award size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#18221E] dark:text-[#F4EFE3]">{ach.title}</h4>
                        <p className="text-[11px] text-[#69736C] dark:text-[#B5BDB5]">{ach.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Settings (If own profile) */}
          {activeTab === "settings" && isOwnProfile && (
            <div className="rounded-[20px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-6 space-y-4 shadow-[0_4px_16px_rgba(35,40,30,0.04)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5]">
                Quick Settings
              </h3>
              <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                Manage your board style, audio soundscapes, and account preferences.
              </p>
              <div className="pt-2">
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 rounded-[12px] bg-[#18352B] px-4 py-2.5 text-xs font-semibold text-[#F7F4EC] hover:bg-[#285443] transition shadow-xs"
                >
                  <SettingsIcon size={14} className="text-[#B58A3A]" />
                  <span>Open Full Settings</span>
                </Link>
              </div>
            </div>
          )}

          {/* Bottom Log Out (Required for profile) */}
          {isOwnProfile && (
            <div className="pt-4 border-t border-[rgba(24,34,30,0.08)] dark:border-white/8 flex justify-end">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-[12px] border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-[#A94B45] hover:bg-rose-500/20 transition cursor-pointer"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Challenge Drawer */}
      {isChallengeOpen && profileData && (
        <ChallengeModal
          isOpen={isChallengeOpen}
          onClose={() => setIsChallengeOpen(false)}
          targetUser={profileData}
          mode="drawer"
        />
      )}

    </div>
  );
}
