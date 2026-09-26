"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Swords, Eye, Users, BrainCircuit } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname() || "";

  const tabs = [
    {
      label: "Home",
      href: "/",
      icon: (active: boolean) => (
        <span className={`text-base font-serif ${active ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`}>
          ♟
        </span>
      ),
    },
    {
      label: "Play",
      href: "/play",
      icon: (active: boolean) => (
        <Swords
          size={18}
          className={active ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}
        />
      ),
    },
    {
      label: "Watch",
      href: "/watch",
      icon: (active: boolean) => (
        <Eye
          size={18}
          className={active ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}
        />
      ),
    },
    {
      label: "Puzzles",
      href: "/puzzles",
      icon: (active: boolean) => (
        <BrainCircuit
          size={18}
          className={active ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}
        />
      ),
    },
    {
      label: "Friends",
      href: "/friends",
      icon: (active: boolean) => (
        <Users
          size={18}
          className={active ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}
        />
      ),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md md:hidden px-1"
    >
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center py-1 transition-colors ${
              isActive
                ? "text-[var(--color-text)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            <div className="flex h-5 items-center justify-center">
              {tab.icon(isActive)}
            </div>
            <span
              className={`mt-1 text-[11px] font-medium tracking-tight ${
                isActive
                  ? "text-[var(--color-primary)] font-semibold"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
