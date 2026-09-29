"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  History,
  Sparkles,
  Settings,
  Shield,
  LogOut,
  Sun,
  Moon,
  LogIn,
  UserPlus,
  ChevronDown,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export interface UserMenuProps {
  className?: string;
}

export default function UserMenu({ className = "" }: UserMenuProps) {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useTheme();
  const { user, loading, logout, openLogin, openRegister } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside or escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (loading) {
    return (
      <div className={`h-8 sm:h-9 w-24 rounded-full bg-[#18352B]/[0.06] dark:bg-white/[0.06] animate-pulse ${className}`} />
    );
  }

  if (!user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={openLogin}
          className="h-8.5 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-[rgba(24,34,30,0.15)] dark:border-white/15 bg-[#F7F4EC] dark:bg-[#1B2A24] text-xs font-semibold text-[#18352B] dark:text-[#F4EFE3] hover:bg-[#FBF9F3] transition cursor-pointer shadow-xs whitespace-nowrap"
        >
          <LogIn size={13} className="text-[#69736C] dark:text-[#B5BDB5]" />
          <span>Log In</span>
        </button>
        <button
          type="button"
          onClick={openRegister}
          className="h-8.5 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-[#B58A3A] hover:bg-[#C49843] text-xs font-bold text-[#18221E] transition shadow-xs cursor-pointer whitespace-nowrap"
        >
          <UserPlus size={13} />
          <span>Sign Up</span>
        </button>
      </div>
    );
  }

  const isAdmin = user.role === "admin" || user.role === "moderator";
  const userRating = user.rating ?? 1428;

  const navigateTo = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open user profile menu"
        aria-expanded={isOpen}
        className="group flex items-center gap-2 rounded-full border border-[rgba(24,34,30,0.12)] dark:border-white/12 bg-[#F7F4EC] dark:bg-[#1B2A24] p-1 pr-3 hover:bg-[#FBF9F3] hover:border-[#B58A3A]/50 transition duration-150 cursor-pointer shadow-xs select-none"
      >
        <div className="relative">
          <Avatar name={user.username} size="sm" status="online" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-[#18352B] dark:text-[#F4EFE3] group-hover:text-[#B58A3A] transition truncate max-w-[75px] sm:max-w-[130px]">
            {user.username}
          </span>
          <span className="text-[10px] text-[#69736C] dark:text-[#B5BDB5] font-mono leading-none">
            {userRating}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-[#69736C] dark:text-[#B5BDB5] group-hover:text-[#18352B] dark:group-hover:text-[#F4EFE3] transition-transform duration-200 ml-0.5 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 z-50 w-72 max-w-[calc(100vw-24px)] rounded-[18px] border border-[rgba(24,34,30,0.12)] dark:border-white/12 bg-[#FBF9F3] dark:bg-[#1B2A24] p-3 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          {/* User Profile Header Card */}
          <div className="mb-2.5 rounded-[14px] bg-[#EDE9DE]/70 dark:bg-[#13201B]/70 p-3 border border-[rgba(24,34,30,0.08)] dark:border-white/8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#18352B] dark:bg-[#285443] text-sm font-bold text-[#B58A3A] dark:text-[#D3AA58] shadow-xs">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-[#18221E] dark:text-[#F4EFE3]">
                  {user.username}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center rounded-full bg-[#B58A3A]/15 px-2 py-0.5 text-[10px] font-mono font-semibold text-[#B58A3A] dark:text-[#D3AA58]">
                    Elo {userRating}
                  </span>
                  <span className="text-[10px] text-[#27815D] font-medium flex items-center gap-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#27815D]" /> Online
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Profile Link CTA */}
            <button
              type="button"
              onClick={() => navigateTo(`/profile/${encodeURIComponent(user.username)}`)}
              className="mt-2.5 w-full flex items-center justify-between rounded-[10px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] px-3 py-1.5 text-[11px] font-bold text-[#F7F4EC] transition shadow-xs cursor-pointer"
            >
              <span>View Full Profile</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5 text-xs font-medium text-[#18221E] dark:text-[#F4EFE3]">
            <button
              type="button"
              onClick={() => navigateTo(`/profile/${encodeURIComponent(user.username)}`)}
              className="w-full flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 hover:bg-[#EDE9DE] dark:hover:bg-[#21332B] transition cursor-pointer text-left"
            >
              <User size={15} className="text-[#B58A3A] shrink-0" />
              <span>Player Showcase</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo("/games")}
              className="w-full flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 hover:bg-[#EDE9DE] dark:hover:bg-[#21332B] transition cursor-pointer text-left"
            >
              <History size={15} className="text-[#69736C] dark:text-[#B5BDB5] shrink-0" />
              <span>Game Archive & Replays</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo("/insights")}
              className="w-full flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 hover:bg-[#EDE9DE] dark:hover:bg-[#21332B] transition cursor-pointer text-left"
            >
              <Sparkles size={15} className="text-[#69736C] dark:text-[#B5BDB5] shrink-0" />
              <span>Personal Insights</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo("/settings")}
              className="w-full flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 hover:bg-[#EDE9DE] dark:hover:bg-[#21332B] transition cursor-pointer text-left"
            >
              <Settings size={15} className="text-[#69736C] dark:text-[#B5BDB5] shrink-0" />
              <span>Board & Piece Settings</span>
            </button>

            <button
              type="button"
              onClick={toggleColorMode}
              className="w-full flex items-center justify-between rounded-[10px] px-2.5 py-2 hover:bg-[#EDE9DE] dark:hover:bg-[#21332B] transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                {colorMode === "dark" ? (
                  <Sun size={15} className="text-[#D3AA58] shrink-0" />
                ) : (
                  <Moon size={15} className="text-[#18352B] shrink-0" />
                )}
                <span>Appearance</span>
              </div>
              <span className="text-[10px] font-mono text-[#69736C] dark:text-[#B5BDB5]">
                {colorMode === "dark" ? "Forest Dark" : "Ivory Light"}
              </span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => navigateTo("/admin/dashboard")}
                className="w-full flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 hover:bg-[#EDE9DE] dark:hover:bg-[#21332B] transition cursor-pointer text-left text-[#B58A3A]"
              >
                <Shield size={15} className="shrink-0" />
                <span>Admin Operations</span>
              </button>
            )}
          </div>

          {/* Divider & Logout */}
          <div className="mt-2 pt-2 border-t border-[rgba(24,34,30,0.08)] dark:border-white/8">
            <button
              type="button"
              onClick={async () => {
                setIsOpen(false);
                await logout();
              }}
              className="w-full flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-xs font-semibold text-[#A94B45] hover:bg-rose-500/10 transition cursor-pointer"
            >
              <LogOut size={14} className="shrink-0" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
