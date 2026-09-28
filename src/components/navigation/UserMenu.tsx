"use client";

import React from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown";
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

  if (loading) {
    return (
      <div className={`h-8 sm:h-9 w-20 sm:w-24 rounded-full bg-[#18352B]/[0.06] dark:bg-white/[0.06] animate-pulse ${className}`} />
    );
  }

  if (!user) {
    return (
      <div className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
        <button
          type="button"
          onClick={openLogin}
          className="h-8 sm:h-9 px-2.5 sm:px-3.5 inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-[10px] border border-[rgba(24,34,30,0.14)] dark:border-white/10 bg-transparent text-xs font-semibold text-[#18352B] dark:text-[#F4EFE3] hover:bg-[#18352B]/[0.05] dark:hover:bg-white/[0.05] transition duration-150 cursor-pointer shadow-xs whitespace-nowrap"
        >
          <LogIn size={13} className="text-[#69736C] dark:text-[#B5BDB5]" />
          <span>Log In</span>
        </button>
        <button
          type="button"
          onClick={openRegister}
          className="h-8 sm:h-9 px-2.5 sm:px-4 inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-[10px] bg-[#B58A3A] hover:bg-[#D6B66A] text-xs font-bold text-[#18352B] transition duration-150 shadow-xs cursor-pointer whitespace-nowrap"
        >
          <UserPlus size={13} />
          <span className="sm:hidden">Sign Up</span>
          <span className="hidden sm:inline">Create Account</span>
        </button>
      </div>
    );
  }

  const isAdmin = user.role === "admin" || user.role === "moderator";

  const dropdownItems: (DropdownItem | "divider")[] = [
    {
      id: "profile",
      label: "Profile",
      icon: <User size={15} />,
      onClick: () => router.push(`/profile/${user.username}`),
    },
    {
      id: "games",
      label: "Game History",
      icon: <History size={15} />,
      onClick: () => router.push("/games"),
    },
    {
      id: "statistics",
      label: "Statistics",
      icon: <Sparkles size={15} />,
      onClick: () => router.push("/insights"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={15} />,
      onClick: () => router.push("/settings"),
    },
    {
      id: "mode",
      label: colorMode === "dark" ? "Light Mode (Premium Ivory)" : "Dark Mode (Premium Forest)",
      icon: colorMode === "dark" ? <Sun size={15} /> : <Moon size={15} />,
      onClick: toggleColorMode,
    },
  ];

  if (isAdmin) {
    dropdownItems.push("divider");
    dropdownItems.push({
      id: "admin",
      label: "Admin Panel",
      icon: <Shield size={15} className="text-[#B58A3A]" />,
      onClick: () => router.push("/admin/dashboard"),
    });
  }

  dropdownItems.push("divider");
  dropdownItems.push({
    id: "logout",
    label: "Logout",
    icon: <LogOut size={15} />,
    isDangerous: true,
    onClick: logout,
  });

  return (
    <div className={className}>
      <Dropdown
        trigger={
          <button
            type="button"
            aria-label="Open user menu"
            className="group flex items-center gap-2 rounded-full border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] p-1 pr-2.5 sm:pr-3 hover:bg-[#FBF9F3] hover:border-[#B58A3A]/50 transition duration-150 cursor-pointer shadow-xs"
          >
            <Avatar name={user.username} size="sm" status="online" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-[#18352B] dark:text-[#F4EFE3] group-hover:text-[#B58A3A] transition">
                {user.username}
              </span>
              <span className="text-[10px] text-[#69736C] dark:text-[#B5BDB5] font-mono leading-none">
                {user.rating ?? 1500}
              </span>
            </div>
            <ChevronDown size={14} className="text-[#69736C] group-hover:text-[#18352B] dark:group-hover:text-[#F4EFE3] transition ml-0.5" />
          </button>
        }
        items={dropdownItems}
        align="right"
      />
    </div>
  );
}
