"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search, Sun, Moon } from "lucide-react";
import NotificationDropdown from "@/components/navigation/NotificationDropdown";
import UserMenu from "@/components/navigation/UserMenu";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function AppHeader() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { colorMode, toggleColorMode } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getSectionTitle = () => {
    if (pathname.startsWith("/play")) return "Play Chess";
    if (pathname.startsWith("/analysis")) return "AI Analysis";
    if (pathname.startsWith("/insights")) return "Your Chess Insights";
    if (pathname.startsWith("/watch")) return "Watch Live Games";
    if (pathname.startsWith("/puzzles") || pathname.startsWith("/training")) return "Puzzles & Tactics";
    if (pathname.startsWith("/friends")) return "Friends";
    if (pathname.startsWith("/games") || pathname.startsWith("/dashboard")) return "Game History";
    if (pathname.startsWith("/leaderboard")) return "Leaderboard";
    if (pathname.startsWith("/settings")) return "Settings";
    if (pathname.startsWith("/profile")) return "Player Profile";
    if (pathname.startsWith("/admin")) return "Administrative Center";
    return "ChessVerse";
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/profile/${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full max-w-full items-center justify-between border-b border-[var(--color-border-subtle)] bg-[#EDE9DE]/95 dark:bg-[#13201B]/95 px-3 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left: Contextual Section Title & Subtitle */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
        <div>
          <h1 className="text-sm sm:text-base md:text-lg font-serif font-bold tracking-tight text-[#18352B] dark:text-[#F4EFE3] leading-none truncate">
            {getSectionTitle()}
          </h1>
          <span className="text-[10px] text-[#69736C] dark:text-[#B5BDB5] font-medium hidden md:inline-block mt-1">
            {greeting} · {currentDate}
          </span>
        </div>
      </div>

      {/* Right Controls: Search, Notifications, Profile Button */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {searchOpen ? (
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player username..."
              onBlur={() => !searchQuery && setSearchOpen(false)}
              className="w-40 sm:w-64 rounded-full border border-[#B58A3A]/60 bg-[#F7F4EC] dark:bg-[#1B2A24] py-1.5 pl-8 pr-3 text-xs text-[#18221E] dark:text-[#F4EFE3] placeholder-[#69736C] outline-none transition focus:border-[#B58A3A] focus:ring-1 focus:ring-[#B58A3A] shadow-xs"
            />
            <Search size={14} className="absolute left-2.5 text-[#69736C]" />
          </form>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] transition-colors hover:border-[#B58A3A]/40 hover:bg-[#FBF9F3] hover:text-[#18221E] dark:hover:text-[#F4EFE3] cursor-pointer shadow-xs"
            aria-label="Search players"
            title="Search players"
          >
            <Search size={15} />
          </button>
        )}

        <button
          type="button"
          onClick={toggleColorMode}
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#D3AA58] transition-all hover:border-[#B58A3A]/40 hover:bg-[#FBF9F3] hover:text-[#18221E] dark:hover:text-[#F4EFE3] cursor-pointer shadow-xs"
          aria-label={`Switch to ${colorMode === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${colorMode === "dark" ? "Light Mode (Warm Ivory)" : "Dark Mode (Deep Forest)"}`}
        >
          {colorMode === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <NotificationDropdown />

        <UserMenu />
      </div>
    </header>
  );
}
