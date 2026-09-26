"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  title?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar, title = "Admin Panel" }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    users: any[];
    games: any[];
    reports: any[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ username: string; role: string; email: string } | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch current admin user
    apiFetch("/api/admin/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setAdminUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Debounced search (R6.57, R6.70)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiFetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.results);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults(null);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch("/api/admin/auth/logout", { method: "POST" });
    } catch {}
    localStorage.removeItem("chessverse-token");
    router.push("/admin/login");
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
          aria-label="Toggle Navigation"
        >
          ☰
        </button>
        <h1 className="text-base md:text-lg font-semibold text-[var(--color-text)] truncate">{title}</h1>
      </div>

      {/* Center: Global Search (R6.70) */}
      <div className="relative flex-1 max-w-md hidden sm:block" ref={searchRef}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search users, games, reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs md:text-sm rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-secondary)]">
            🔍
          </span>
          {isSearching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-secondary)] animate-spin">
              ◌
            </span>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {searchResults && (searchResults.users.length > 0 || searchResults.games.length > 0 || searchResults.reports.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-lg overflow-hidden z-50 divide-y divide-[var(--color-border)] max-h-96 overflow-y-auto">
            {searchResults.users.length > 0 && (
              <div className="p-2">
                <div className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase px-2 mb-1">
                  Users
                </div>
                {searchResults.users.map((u: any) => (
                  <Link
                    key={u._id}
                    href={`/admin/users/${u._id}`}
                    onClick={() => setSearchResults(null)}
                    className="flex items-center justify-between p-2 rounded hover:bg-[var(--color-surface-hover)] text-xs text-[var(--color-text)]"
                  >
                    <span className="font-medium">{u.username}</span>
                    <span className="text-[var(--color-text-secondary)] text-[11px]">{u.email}</span>
                  </Link>
                ))}
              </div>
            )}
            {searchResults.games.length > 0 && (
              <div className="p-2">
                <div className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase px-2 mb-1">
                  Games
                </div>
                {searchResults.games.map((g: any) => (
                  <Link
                    key={g._id}
                    href={`/admin/games/${g._id}`}
                    onClick={() => setSearchResults(null)}
                    className="flex items-center justify-between p-2 rounded hover:bg-[var(--color-surface-hover)] text-xs text-[var(--color-text)]"
                  >
                    <span>
                      {g.white?.username || "White"} vs {g.black?.username || "Black"}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">
                      {g.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            {searchResults.reports.length > 0 && (
              <div className="p-2">
                <div className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase px-2 mb-1">
                  Reports
                </div>
                {searchResults.reports.map((r: any) => (
                  <Link
                    key={r._id}
                    href={`/admin/reports/${r._id}`}
                    onClick={() => setSearchResults(null)}
                    className="flex items-center justify-between p-2 rounded hover:bg-[var(--color-surface-hover)] text-xs text-[var(--color-text)]"
                  >
                    <span className="font-medium">{r.category}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)] capitalize">{r.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Notifications & Admin Profile Menu */}
      <div className="flex items-center gap-3">
        {/* Notifications Bell (R6.63) */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] relative"
            aria-label="Admin Notifications"
          >
            🔔
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
          </button>
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-xl p-3 z-50 space-y-2">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                <span className="text-xs font-semibold text-[var(--color-text)]">Notifications</span>
                <span className="text-[10px] text-[var(--color-primary)] font-medium">3 unread</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-[var(--color-surface-hover)] flex flex-col gap-0.5">
                  <span className="font-medium text-[var(--color-text)]">New Cheating Report</span>
                  <span className="text-[10px] text-[var(--color-text-secondary)]">2 min ago • Game G-10482</span>
                </div>
                <div className="p-2 rounded bg-[var(--color-surface-hover)] flex flex-col gap-0.5">
                  <span className="font-medium text-[var(--color-text)]">Stockfish WASM Pool Restored</span>
                  <span className="text-[10px] text-[var(--color-text-secondary)]">14 min ago • 4 workers active</span>
                </div>
                <div className="p-2 rounded bg-[var(--color-surface-hover)] flex flex-col gap-0.5">
                  <span className="font-medium text-[var(--color-text)]">High Realtime Concurrency</span>
                  <span className="text-[10px] text-[var(--color-text-secondary)]">1 hr ago • 340 concurrent users</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Menu Dropdown (R6.52) */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] text-xs font-medium text-[var(--color-text)] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 flex items-center justify-center font-bold text-xs text-[var(--color-primary)]">
              {adminUser?.username?.[0]?.toUpperCase() || "A"}
            </div>
            <span className="hidden sm:inline font-semibold">{adminUser?.username || "Admin"}</span>
            <span className="text-[10px] text-[var(--color-text-secondary)]">▼</span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-[var(--color-border)]">
                <p className="font-semibold text-[var(--color-text)] truncate">{adminUser?.username || "Admin"}</p>
                <p className="text-[11px] text-[var(--color-text-secondary)] truncate">{adminUser?.email || "admin@chessverse.app"}</p>
              </div>
              <Link
                href="/admin/system"
                onClick={() => setIsUserMenuOpen(false)}
                className="block px-3 py-2 text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
              >
                Security & Settings
              </Link>
              <Link
                href="/admin/audit-logs"
                onClick={() => setIsUserMenuOpen(false)}
                className="block px-3 py-2 text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
              >
                Audit Trail
              </Link>
              <Link
                href="/"
                onClick={() => setIsUserMenuOpen(false)}
                className="block px-3 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border-t border-[var(--color-border)]"
              >
                Exit to Player App
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
