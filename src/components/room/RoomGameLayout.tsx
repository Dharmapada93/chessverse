"use client";

import {
  Eye,
  MessageCircle,
  Share2,
  Users,
} from "lucide-react";

type RoomGameLayoutProps = {
  children: React.ReactNode;
  roomName?: string;
  roomCode?: string;
  spectatorCount?: number;
  totalMembers?: number;
};

export default function RoomGameLayout({
  children,
  roomName = "Friday Night Chess",
  roomCode = "Private room",
  spectatorCount = 12,
  totalMembers = 18,
}: RoomGameLayoutProps) {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f4f1e9]">
      <header className="flex h-16 items-center justify-between border-b border-white/[0.08] px-6">
        <div>
          <p className="text-sm font-medium">
            {roomName}
          </p>

          <p className="text-xs text-white/35">
            {roomCode}
          </p>
        </div>

        <div className="flex items-center gap-5 text-sm text-white/45">
          <span className="flex items-center gap-2">
            <Eye size={16} />
            {spectatorCount} watching
          </span>

          <span className="flex items-center gap-2">
            <Users size={16} />
            {totalMembers} members
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          {children}
        </section>

        <aside className="hidden min-h-[700px] flex-col rounded-2xl border border-white/10 bg-[#11110f] lg:flex">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-2">
              <MessageCircle
                size={17}
              />

              <span className="text-sm font-medium">
                Room chat
              </span>
            </div>

            <button className="text-white/35 transition hover:text-white">
              <Share2 size={16} />
            </button>
          </div>

          <div className="flex-1 p-5">
            <p className="text-sm text-white/35">
              Chat messages will appear here.
            </p>
          </div>

          <div className="border-t border-white/10 p-4">
            <input
              placeholder="Message the room..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/20"
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
