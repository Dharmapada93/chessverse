"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Swords,
  Eye,
  Users,
  BrainCircuit,
  User,
  Palette,
  Settings,
  Shield,
  History,
} from "lucide-react";
import ChessVerseLogo from "@/components/brand/ChessVerseLogo";

export interface MobileNavProps {
  isAdmin?: boolean;
}

export default function MobileNav({ isAdmin = false }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname() || "";

  const primaryItems = [
    { label: "Play", href: "/play", icon: Swords },
    { label: "Watch", href: "/watch", icon: Eye },
    { label: "Friends", href: "/friends", icon: Users },
    { label: "Puzzles", href: "/training/dashboard", icon: BrainCircuit },
    { label: "Games", href: "/games", icon: History },
  ];

  const secondaryItems = [
    { label: "Profile", href: "/profile/Dharmapada", icon: User },
    { label: "Theme Studio", href: "/theme-studio", icon: Palette },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="md:hidden">
      {/* Hamburger Toggle Button */}
      <button
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)] cursor-pointer"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Drawer Backdrop & Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 top-16 z-50 flex flex-col bg-[var(--color-bg)]/95 backdrop-blur-lg animate-in fade-in duration-150 p-6 overflow-y-auto"
        >
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-2 px-2">
                Main
              </p>
              <nav className="space-y-1">
                {primaryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex min-h-[44px] items-center gap-3 rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-[var(--color-surface-elevated)] text-[var(--color-primary)] font-semibold border border-[var(--color-border)]"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                      }`}
                    >
                      <Icon size={18} className={isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-2 px-2">
                Preferences
              </p>
              <nav className="space-y-1">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex min-h-[44px] items-center gap-3 rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-[var(--color-surface-elevated)] text-[var(--color-primary)] font-semibold"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                      }`}
                    >
                      <Icon size={18} className="text-[var(--color-text-muted)]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {isAdmin && (
                  <Link
                    href="/admin/monitoring"
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-[44px] items-center gap-3 rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm font-semibold text-purple-400 hover:bg-purple-500/10 transition"
                  >
                    <Shield size={18} />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
