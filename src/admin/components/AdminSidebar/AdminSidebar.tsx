"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number | string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { label: "Users", href: "/admin/users", icon: "👥" },
      { label: "Games", href: "/admin/games", icon: "♟️" },
      { label: "Reports", href: "/admin/reports", icon: "🚨" },
      { label: "Moderation", href: "/admin/moderation", icon: "🛡️" },
    ],
  },
  {
    title: "AI",
    items: [
      { label: "AI Activity", href: "/admin/ai", icon: "🤖" },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { label: "Announcements", href: "/admin/announcements", icon: "📢" },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: "📈" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "System Settings", href: "/admin/system", icon: "⚙️" },
      { label: "System Health", href: "/admin/system/health", icon: "🩺" },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: "📜" },
    ],
  },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col transition-transform duration-200 md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--color-border)]">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 font-bold text-lg text-[var(--color-text)]">
          <span className="text-2xl leading-none">♟</span>
          <span className="tracking-tight">
            Chess<span className="text-[var(--color-primary)]">Verse</span>
          </span>
          <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30 ml-1">
            Admin
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
            aria-label="Close Sidebar"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 text-[10px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase opacity-75">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive =
                item.href === "/admin/dashboard"
                  ? pathname === "/admin/dashboard" || pathname === "/admin"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose?.()}
                  className={`flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-semibold"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-red-500/20 text-red-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] flex items-center justify-between">
        <span>ChessVerse v1.0.0</span>
        <span className="text-emerald-400 flex items-center gap-1 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Online
        </span>
      </div>
    </aside>
  );
};
