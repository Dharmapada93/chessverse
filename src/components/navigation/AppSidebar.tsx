"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Swords,
  Eye,
  Users,
  Trophy,
  Bot,
  Settings,
} from "lucide-react";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Play", href: "/play", icon: Swords },
  { label: "Watch", href: "/watch", icon: Eye },
  { label: "Friends", href: "/friends", icon: Users },
  { label: "Tournaments", href: "/tournaments", icon: Trophy },
  { label: "AI Coach", href: "/coach", icon: Bot },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/8 bg-[#0b0b0a] lg:flex lg:flex-col">
      <div className="flex h-20 items-center px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg">
            ♟
          </span>

          <span className="font-semibold tracking-[-0.02em]">
            ChessVerse
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-6">
        <p className="px-3 pb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-white/25">
          Workspace
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-white/[0.07] text-white"
                    : "text-white/45 hover:bg-white/[0.04] hover:text-white/80"
                }`}
              >
                <Icon size={17} strokeWidth={1.7} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/8 p-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <Settings size={17} strokeWidth={1.7} />
          Settings
        </Link>

        <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/[0.025] p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d7b875]/15 text-xs font-medium text-[#d7b875]">
            DS
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              Dharmapada
            </p>
            <p className="text-xs text-white/30">
              Rating 1428
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
