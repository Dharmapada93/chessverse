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
  roomName = "Private Match Room",
  roomCode = "Room Session",
  spectatorCount = 0,
  totalMembers = 2,
}: RoomGameLayoutProps) {
  return (
    <main className="min-h-screen bg-transparent text-[#171A18] animate-pageEnter">
      <header className="flex h-16 items-center justify-between border-b border-[rgba(30,30,20,0.08)] bg-[#FAF8F2]/80 backdrop-blur-md px-6">
        <div>
          <p className="text-sm font-semibold text-[#171A18]">
            {roomName}
          </p>

          <p className="text-xs text-[#68706A]">
            {roomCode}
          </p>
        </div>

        <div className="flex items-center gap-5 text-sm text-[#68706A]">
          <span className="flex items-center gap-2">
            <Eye size={16} className="text-[#B88A32]" />
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

        <aside className="hidden min-h-[700px] flex-col rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md shadow-[0_8px_30px_rgba(35,30,20,0.04)] lg:flex">
          <div className="flex items-center justify-between border-b border-[rgba(30,30,20,0.08)] px-5 py-4">
            <div className="flex items-center gap-2">
              <MessageCircle
                size={17}
                className="text-[#B88A32]"
              />

              <span className="text-sm font-semibold text-[#171A18]">
                Room chat
              </span>
            </div>

            <button className="text-[#68706A] transition hover:text-[#171A18]">
              <Share2 size={16} />
            </button>
          </div>

          <div className="flex-1 p-5">
            <p className="text-sm text-[#68706A]">
              Chat messages will appear here.
            </p>
          </div>

          <div className="border-t border-[rgba(30,30,20,0.08)] p-4">
            <input
              placeholder="Message the room..."
              className="w-full rounded-xl border border-[rgba(30,30,20,0.12)] bg-[#FAF8F2] px-4 py-3 text-sm text-[#171A18] outline-none placeholder:text-[#68706A]/40 focus:border-[#B88A32]"
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
