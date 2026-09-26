"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Swords,
  Eye,
  BrainCircuit,
  Users,
  History,
  Award,
  Settings,
  Sparkles,
  Bot,
  LogIn,
  UserPlus,
} from "lucide-react";
import ChessVerseLogo from "@/components/brand/ChessVerseLogo";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  { label: "Play", href: "/play", icon: Swords },
  { label: "Analysis", href: "/analysis", icon: Bot },
  { label: "Insights", href: "/insights", icon: Sparkles },
  { label: "Watch", href: "/watch", icon: Eye },
  { label: "Puzzles", href: "/puzzles", icon: BrainCircuit },
  { label: "Friends", href: "/friends", icon: Users },
  { label: "Games", href: "/games", icon: History },
  { label: "Leaderboard", href: "/leaderboard", icon: Award },
];

export default function AppSidebar() {
  const pathname = usePathname() || "";
  const { user: currentUser, loading: loadingUser, openLogin, openRegister } = useAuth();

  return (
    <aside
      className="hidden w-[250px] shrink-0 border-r border-[var(--color-border-subtle)] bg-[#F7F4EC]/95 dark:bg-[#1B2A24]/95 backdrop-blur-md lg:flex lg:flex-col select-none z-20"
      aria-label="ChessVerse Sidebar"
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-[var(--color-border-subtle)] bg-[#F7F4EC]/60 dark:bg-[#1B2A24]/60">
        <ChessVerseLogo variant="full" size="sm" href="/" />
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto" aria-label="Sidebar Navigation">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#69736C] dark:text-[#828E85]">
          Navigation
        </div>

        {navigation.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-[var(--radius-btn)] px-3 py-2.5 text-xs transition-all duration-180 ${
                active
                  ? "bg-[#18352B]/[0.08] dark:bg-[#D3AA58]/[0.12] text-[#18352B] dark:text-[#F4EFE3] border-l-[3px] border-[#B58A3A] font-semibold"
                  : "text-[#18352B] dark:text-[#F4EFE3]/80 bg-transparent hover:bg-[#18352B]/[0.04] dark:hover:bg-white/[0.04] hover:text-[#18352B] dark:hover:text-[#F4EFE3]"
              }`}
            >
              <Icon
                size={16}
                strokeWidth={active ? 2.2 : 1.8}
                className={`transition-all duration-180 ${
                  active
                    ? "text-[#B58A3A] scale-105"
                    : "text-[#69736C] dark:text-[#B5BDB5] group-hover:text-[#18352B] dark:group-hover:text-[#F4EFE3] group-hover:translate-x-0.5"
                }`}
              />
              <span className="tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: Settings & Profile Card */}
      <div className="border-t border-[var(--color-border-subtle)] p-3 space-y-2 bg-[#F7F4EC]/50 dark:bg-[#1B2A24]/50">
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-[var(--radius-btn)] px-3 py-2.5 text-xs transition-colors duration-180 ${
            pathname.startsWith("/settings")
              ? "bg-[#18352B]/[0.08] dark:bg-[#D3AA58]/[0.12] text-[#B58A3A] border-l-[3px] border-[#B58A3A] font-semibold"
              : "text-[#69736C] dark:text-[#B5BDB5] hover:bg-[#18352B]/[0.04] dark:hover:bg-white/[0.04] hover:text-[#18352B] dark:hover:text-[#F4EFE3]"
          }`}
        >
          <Settings size={16} strokeWidth={1.8} />
          <span>Settings</span>
        </Link>

        {loadingUser ? (
          <div className="h-12 rounded-[var(--radius-card-sm)] bg-[#18352B]/[0.04] dark:bg-white/[0.04] animate-pulse border border-[var(--color-border-subtle)]" />
        ) : currentUser ? (
          /* R16 Bottom Profile Card */
          <Link
            href={`/profile/${currentUser.username}`}
            className={`flex items-center gap-3 rounded-[var(--radius-card-sm)] bg-[#F7F4EC] dark:bg-[#1B2A24] p-2.5 transition-all duration-180 hover:-translate-y-0.5 hover:shadow-sm border ${
              pathname.startsWith(`/profile/${currentUser.username}`)
                ? "border-[#B58A3A]/60 shadow-xs"
                : "border-[rgba(24,34,30,0.10)] dark:border-white/10"
            }`}
          >
            {/* Avatar: Deep forest circle with champagne initial */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18352B] dark:bg-[#285443] text-xs font-bold text-[#B58A3A] dark:text-[#D3AA58] shadow-xs">
              {currentUser.username.slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              {/* Name: Deep forest */}
              <p className="truncate text-xs font-semibold text-[#18352B] dark:text-[#F4EFE3]">
                {currentUser.username}
              </p>
              {/* Rating: Muted green-gray */}
              <p className="text-[10px] text-[#69736C] dark:text-[#B5BDB5] font-mono">
                Rating {currentUser.rating ?? 1500}
              </p>
            </div>
          </Link>
        ) : (
          /* Logged out state */
          <div className="flex items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={openLogin}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-[var(--radius-btn)] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-transparent py-2 text-xs font-semibold text-[#18352B] dark:text-[#F4EFE3] hover:bg-[#18352B]/[0.05] dark:hover:bg-white/[0.05] transition cursor-pointer"
            >
              <LogIn size={13} />
              <span>Log In</span>
            </button>
            <button
              type="button"
              onClick={openRegister}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-[var(--radius-btn)] bg-[#B58A3A] py-2 text-xs font-bold text-[#18352B] hover:bg-[#D6B66A] transition cursor-pointer shadow-xs"
            >
              <UserPlus size={13} />
              <span>Register</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
