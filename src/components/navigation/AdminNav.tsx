"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ShieldAlert, ArrowLeft } from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { label: "Live Telemetry", href: "/admin/monitoring", icon: Activity },
    { label: "Fair-Play Moderation", href: "/admin/fair-play", icon: ShieldAlert },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 sm:px-6 py-3">
      <div className="flex items-center gap-1 sm:gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
              }`}
            >
              <Icon size={14} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
      >
        <ArrowLeft size={14} />
        <span>Return to Platform</span>
      </Link>
    </div>
  );
}
