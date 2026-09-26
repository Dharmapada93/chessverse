"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  isAdminOnly?: boolean;
}

export const defaultNavItems: NavItem[] = [
  { label: "Play", href: "/play" },
  { label: "Friends", href: "/friends" },
  { label: "Watch", href: "/watch" },
  { label: "Puzzles", href: "/training/dashboard" },
  { label: "Analysis", href: "/analysis" },
  { label: "Games", href: "/games" },
  { label: "Features", href: "/features" },
  { label: "Leaderboard", href: "/leaderboard" },
];

export interface DesktopNavProps {
  isAdmin?: boolean;
  className?: string;
}

export default function DesktopNav({ isAdmin = false, className = "" }: DesktopNavProps) {
  const pathname = usePathname() || "";

  const items = [...defaultNavItems];
  if (isAdmin) {
    items.push({ label: "Admin", href: "/admin/dashboard", isAdminOnly: true });
  }

  return (
    <nav aria-label="Desktop Navigation" className={`hidden md:flex items-center gap-1 ${className}`}>
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-[var(--radius-md)] px-3.5 py-1.5 text-xs font-medium transition-all duration-120 select-none ${
              isActive
                ? "bg-[var(--color-surface-elevated)] text-[var(--color-primary)] font-semibold border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
            } ${item.isAdminOnly ? "text-purple-400 font-semibold" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
