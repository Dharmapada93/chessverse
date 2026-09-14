"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  Crown,
  Eye,
  Link2,
  Play,
  UserPlus,
} from "lucide-react";
import { getRoom } from "@/lib/room-storage";
import type { Room } from "@/types/room";

const friends = [
  {
    name: "Rahul",
    rating: 1438,
    initials: "R",
    online: true,
  },
  {
    name: "Priya",
    rating: 1512,
    initials: "P",
    online: true,
  },
  {
    name: "Sagar",
    rating: 1461,
    initials: "S",
    online: true,
  },
];

export default function RoomLobbyPage() {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedRoom = getRoom();

    if (!storedRoom) {
      router.replace("/room/create");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoom(storedRoom);
  }, [router]);

  if (!room) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <p className="text-sm text-white/40">
          Loading room...
        </p>
      </main>
    );
  }

  function copyRoomCode() {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f4f1e9]">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/8 px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <p className="text-sm font-medium">{room.settings.name}</p>
            <p className="text-xs text-white/30">Room lobby</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/35">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Room is active
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        {/* Intro */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d7b875]">
            Waiting room
          </p>

          <h1 className="mt-3 text-3xl font-medium tracking-tight">
            {room.settings.name}
          </h1>

          <p className="mt-2 text-sm text-white/35">
            Invite your friends and choose who plays first.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* Main lobby */}
          <section className="rounded-2xl border border-white/8 bg-[#11110f]">
            {/* Room information */}
            <div className="flex flex-col justify-between gap-5 border-b border-white/8 p-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs text-white/30">Room code</p>

                <div className="mt-2 flex items-center gap-3">
                  <span className="font-mono text-2xl tracking-[0.18em]">
                    {room.code}
                  </span>

                  <button
                    onClick={copyRoomCode}
                    className="rounded-lg border border-white/8 p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </div>

                <p className="mt-2 text-xs text-white/25">
                  Share this code with your friends.
                </p>
              </div>

              <button className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-xs text-white/60 transition hover:bg-white/5 hover:text-white">
                <Link2 size={15} />
                Copy invite link
              </button>
            </div>

            {/* Players */}
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium">Players</h2>
                  <p className="mt-1 text-xs text-white/30">
                    Two players are needed to start.
                  </p>
                </div>

                <span className="text-xs text-white/30">1 / 2</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Host */}
                <PlayerCard
                  name={room.host.name}
                  rating={room.host.rating}
                  initials={room.host.name.charAt(0)}
                  host
                  ready
                />

                {/* Opponent */}
                <PlayerCard
                  name="Waiting for player"
                  rating={0}
                  initials="+"
                  empty
                />
              </div>
            </div>

            {/* Friends */}
            <div className="border-t border-white/8 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium">Invite friends</h2>
                  <p className="mt-1 text-xs text-white/30">
                    Friends currently online
                  </p>
                </div>

                <UserPlus size={17} className="text-white/30" />
              </div>

              <div className="space-y-2">
                {friends.map((friend) => (
                  <div
                    key={friend.name}
                    className="flex items-center justify-between rounded-xl border border-white/6 px-4 py-3 transition hover:border-white/12"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-xs font-medium">
                        {friend.initials}

                        {friend.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#11110f] bg-emerald-400" />
                        )}
                      </div>

                      <div>
                        <p className="text-sm">{friend.name}</p>
                        <p className="text-xs text-white/30">
                          {friend.rating} rating
                        </p>
                      </div>
                    </div>

                    <button className="rounded-lg border border-white/8 px-3 py-2 text-xs text-white/45 transition hover:border-[#d7b875]/40 hover:text-[#d7b875]">
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Ready */}
            <div className="flex flex-col gap-4 border-t border-white/8 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">
                  {ready ? "You're ready." : "Ready to play?"}
                </p>

                <p className="mt-1 text-xs text-white/30">
                  The match starts when both players are ready.
                </p>
              </div>

              <button
                onClick={() => setReady(!ready)}
                className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition ${
                  ready
                    ? "border border-[#d7b875]/40 bg-[#d7b875]/10 text-[#d7b875]"
                    : "bg-[#d7b875] text-[#171512] hover:bg-[#e1c68b]"
                }`}
              >
                {ready ? <Check size={16} /> : <Play size={16} />}

                {ready ? "Ready" : "I'm ready"}
              </button>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Match settings */}
            <div className="rounded-2xl border border-white/8 bg-[#11110f] p-5">
              <h2 className="text-sm font-medium">Match settings</h2>

              <div className="mt-5 space-y-4">
                <SettingRow
                  label="Time control"
                  value={room.settings.timeControl.label}
                />

                <SettingRow
                  label="Game type"
                  value={room.settings.rated ? "Rated" : "Casual"}
                />

                <SettingRow
                  label="Visibility"
                  value={
                    room.settings.visibility === "private"
                      ? "Private"
                      : "Public"
                  }
                />

                <SettingRow
                  label="Spectators"
                  value={
                    room.settings.spectators ? "Allowed" : "Disabled"
                  }
                />
              </div>
            </div>

            {/* Spectators */}
            <div className="rounded-2xl border border-white/8 bg-[#11110f] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-white/40" />
                  <h2 className="text-sm font-medium">
                    Spectators
                  </h2>
                </div>

                <span className="text-xs text-white/25">3</span>
              </div>

              <div className="mt-5 flex -space-x-2">
                {["P", "R", "S"].map((letter) => (
                  <div
                    key={letter}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#11110f] bg-white/10 text-xs"
                  >
                    {letter}
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs leading-5 text-white/30">
                Friends can join the room as spectators and
                watch the match live.
              </p>
            </div>

            {/* Room status */}
            <div className="rounded-2xl border border-[#d7b875]/15 bg-[#d7b875]/5 p-5">
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-[#d7b875]" />

                <p className="text-sm font-medium">
                  You&apos;re the host
                </p>
              </div>

              <p className="mt-2 text-xs leading-5 text-white/35">
                You control the room and can start the match
                once another player joins.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function PlayerCard({
  name,
  rating,
  initials,
  host = false,
  ready = false,
  empty = false,
}: {
  name: string;
  rating: number;
  initials: string;
  host?: boolean;
  ready?: boolean;
  empty?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        empty
          ? "border-dashed border-white/10"
          : "border-white/8 bg-black/10"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/8 text-sm font-medium">
          {initials}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{name}</p>

            {host && (
              <Crown
                size={13}
                className="text-[#d7b875]"
              />
            )}
          </div>

          <p className="mt-1 text-xs text-white/30">
            {empty ? "Open player slot" : `${rating} rating`}
          </p>
        </div>
      </div>

      {!empty && (
        <div className="mt-5 flex items-center gap-2 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${
              ready ? "bg-emerald-400" : "bg-white/15"
            }`}
          />

          <span className="text-white/35">
            {ready ? "Ready" : "Not ready"}
          </span>
        </div>
      )}
    </div>
  );
}

function SettingRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/30">{label}</span>
      <span className="text-xs text-white/70">{value}</span>
    </div>
  );
}
