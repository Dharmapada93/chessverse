"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Crown,
  Eye,
  Swords,
  Users,
} from "lucide-react";
import ChessGame from "@/components/chess/ChessGame";
import GameChat from "@/components/game/GameChat";
import RoomClient from "@/components/room/RoomClient";

type RoomData = {
  code: string;
  name?: string;
  status: string;
  hostId?: {
    username: string;
    avatar?: string;
    rating?: number;
  };
  guestId?: {
    username: string;
    avatar?: string;
    rating?: number;
  };
  spectators?: Array<{
    username: string;
    avatar?: string;
    rating?: number;
  }>;
};

export default function ChessRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams?: Promise<{ role?: string }>;
}) {
  const resolvedParams = use(params);
  const resolvedSearchParams = searchParams ? use(searchParams) : undefined;

  const roomId = resolvedParams.roomId;
  const role =
    resolvedSearchParams?.role === "spectator" ? "spectator" : "player";

  const [room, setRoom] = useState<RoomData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:4000";

    fetch(`${apiUrl}/api/rooms/${roomId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.room) {
          setRoom(data.room);
        }
      })
      .catch(() => {});
  }, [roomId]);

  function copyInvite() {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://chessverse.app";
    const inviteUrl = `${origin}/room/${room?.code || roomId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const roomCode = room?.code || roomId.toUpperCase();

  return (
    <>
      <RoomClient roomId={roomId} role={role} />
      <main className="min-h-screen bg-transparent text-[#171A18] animate-pageEnter">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-[rgba(30,30,20,0.08)] bg-[#FAF8F2]/80 backdrop-blur-md px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/play"
              className="rounded-lg p-2 text-[#68706A] transition hover:bg-[rgba(30,30,20,0.05)] hover:text-[#171A18]"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#171A18]">
                  {room?.name || "Private Chess Room"}
                </p>
                <Crown size={14} className="text-[#B88A32]" />
              </div>
              <p className="text-xs text-[#68706A]">
                Room #{roomCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/watch/${roomCode}`}
              className="flex items-center gap-2 rounded-lg border border-[rgba(30,30,20,0.12)] bg-white px-3 py-2 text-xs font-medium text-[#68706A] transition hover:bg-[#FAF8F2] hover:text-[#171A18] shadow-sm"
            >
              <Eye size={14} />
              <span>Watch Mode</span>
            </Link>

            <button
              onClick={copyInvite}
              className="flex items-center gap-2 rounded-lg bg-[#B88A32] px-3.5 py-2 text-xs font-medium text-white transition hover:bg-[#A07628] shadow-sm"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-200" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Invite</span>
                </>
              )}
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-6 space-y-6">
          {/* Room Banner & Player Cards */}
          <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-6 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B88A32]">
                  Room Access Code
                </p>
                <h1 className="mt-1 text-3xl font-mono font-bold tracking-wider text-[#171A18]">
                  {roomCode}
                </h1>
                <p className="mt-1 text-xs text-[#68706A]">
                  Share this code with your peer to start playing in real time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-xl border border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#68706A]">
                  Status: {room?.status || "Waiting"}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <PlayerCard
                label="White (Host)"
                username={room?.hostId?.username || "Host Player"}
                rating={room?.hostId?.rating || 1200}
                isHost
              />

              <PlayerCard
                label="Black (Guest)"
                username={
                  room?.guestId?.username || "Waiting for opponent..."
                }
                rating={room?.guestId?.rating}
              />
            </div>
          </div>

          {/* Main Board & Live Chat Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            {/* Chess Area */}
            <section className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-6 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
              <div className="mx-auto w-full max-w-[720px]">
                <ChessGame roomId={roomId} role={role} />
              </div>
            </section>

            {/* Live Social Chat */}
            <aside>
              <GameChat roomId={roomId} />
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

function PlayerCard({
  label,
  username,
  rating,
  isHost,
}: {
  label: string;
  username: string;
  rating?: number;
  isHost?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#68706A]">
          {label}
        </p>
        {isHost && (
          <span className="text-xs font-semibold text-[#B88A32] flex items-center gap-1">
            <Crown size={12} /> Host
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-base font-semibold text-[#171A18]">
          {username}
        </p>
        {rating && (
          <span className="text-xs font-mono font-medium text-[#68706A]">
            {rating}
          </span>
        )}
      </div>
    </div>
  );
}
