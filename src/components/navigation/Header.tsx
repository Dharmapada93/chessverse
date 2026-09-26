"use client";

import React, { useEffect, useState } from "react";
import ChessVerseLogo from "@/components/brand/ChessVerseLogo";
import DesktopNav from "@/components/navigation/DesktopNav";
import MobileNav from "@/components/navigation/MobileNav";
import UserMenu from "@/components/navigation/UserMenu";
import ConnectionIndicator from "@/components/ui/ConnectionIndicator";
import NotificationDropdown from "@/components/navigation/NotificationDropdown";
import { apiFetch } from "@/lib/api";

export interface HeaderProps {
  className?: string;
}

export default function Header({ className = "" }: HeaderProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkRole() {
      try {
        const res = await apiFetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.role === "admin" || data.user?.role === "moderator") {
            setIsAdmin(true);
          }
        }
      } catch {}
    }
    checkRole();
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 sm:px-6 lg:px-8 backdrop-blur-md ${className}`}
    >
      {/* Brand & Desktop Navigation */}
      <div className="flex items-center gap-6 lg:gap-8">
        <ChessVerseLogo variant="full" size="sm" href="/dashboard" />
        <DesktopNav isAdmin={isAdmin} />
      </div>

      {/* Right Controls: Connection, Notifications, UserMenu, Mobile Hamburger */}
      <div className="flex items-center gap-3">
        <ConnectionIndicator showLabel={false} className="hidden sm:inline-flex" />
        <NotificationDropdown />
        <UserMenu />
        <MobileNav isAdmin={isAdmin} />
      </div>
    </header>
  );
}
