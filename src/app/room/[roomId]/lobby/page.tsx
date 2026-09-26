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
import { socialService } from "@/services/social/socialService";
import type { Friend } from "@/services/social/types";

export default function RoomLobbyPage() {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);
  const [onlineFriends, setOnlineFriends] = useState<Friend[]>([]);
  const [invitedMap, setInvitedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedRoom = getRoom();

    if (!storedRoom) {
      router.replace("/room/create");
      return;
    }

    setRoom(storedRoom);

    // Fetch real online friends
    socialService.fetchFriends().then((friendsList) => {
      setOnlineFriends(friendsList.filter((f) => f.online));
    }).catch(() => {
      setOnlineFriends([]);
    });
  }, [router]);

  if (!room) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-transparent text-[#171A18]">
        <p className="text-sm font-medium text-[#68706A]">
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
            <p className="text-sm font-semibold text-[#171A18]">{room.settings.name}</p>
            <p className="text-xs text-[#68706A]">Room lobby</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-[#285C4D]">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Room is active
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        {/* Intro */}
        <div className="mb-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88A32]">
            Waiting Room
          </span>

          <h1 className="mt-2 text-3xl font-serif font-medium tracking-tight text-[#171A18]">
            {room.settings.name}
          </h1>

          <p className="mt-2 text-sm text-[#68706A]">
            Invite your friends and configure ready status before the game begins.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main lobby */}
          <section className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md shadow-[0_8px_30px_rgba(35,30,20,0.04)] overflow-hidden">
            {/* Room information */}
            <div className="flex flex-col justify-between gap-5 border-b border-[rgba(30,30,20,0.08)] bg-[#FAF8F2]/60 p-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#68706A]">Room Code</p>

                <div className="mt-2 flex items-center gap-3">
                  <span className="font-mono text-2xl font-bold tracking-[0.18em] text-[#171A18]">
                    {room.code}
                  </span>

                  <button
                    onClick={copyRoomCode}
                    className="rounded-lg border border-[rgba(30,30,20,0.12)] bg-white p-2 text-[#68706A] transition hover:bg-[#FAF8F2] hover:text-[#171A18] shadow-sm"
                    title="Copy code"
                  >
                    {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                  </button>
                </div>

                <p className="mt-2 text-xs text-[#68706A]">
                  Share this code with your peer.
                </p>
              </div>

              <button
                onClick={copyRoomCode}
                className="flex items-center justify-center gap-2 rounded-xl border border-[rgba(30,30,20,0.12)] bg-white px-4 py-2.5 text-xs font-semibold text-[#171A18] transition hover:bg-[#FAF8F2] shadow-sm"
              >
                <Link2 size={15} className="text-[#B88A32]" />
                Copy invite link
              </button>
            </div>

            {/* Players */}
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#171A18]">Players</h2>
                  <p className="mt-0.5 text-xs text-[#68706A]">
                    Two players are needed to start the clock.
                  </p>
                </div>

                <span className="text-xs font-mono font-medium text-[#68706A]">1 / 2</span>
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
            <div className="border-t border-[rgba(30,30,20,0.08)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#171A18]">Invite Friends</h2>
                  <p className="mt-0.5 text-xs text-[#68706A]">
                    Friends currently online
                  </p>
                </div>

                <UserPlus size={17} className="text-[#68706A]" />
              </div>

              {onlineFriends.length > 0 ? (
                <div className="space-y-2">
                  {onlineFriends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center justify-between rounded-xl border border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] px-4 py-3 transition hover:border-[#B88A32]/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-bold text-[#171A18] border border-[rgba(30,30,20,0.08)]">
                          {friend.username.charAt(0).toUpperCase()}
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#171A18]">{friend.username}</p>
                          <p className="text-xs text-[#68706A]">
                            {friend.rating} rating
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setInvitedMap((prev) => ({ ...prev, [friend._id]: true }));
                          copyRoomCode();
                        }}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          invitedMap[friend._id]
                            ? "border-emerald-500/40 bg-emerald-50 text-emerald-700"
                            : "border-[rgba(30,30,20,0.12)] bg-white text-[#171A18] hover:border-[#B88A32] hover:text-[#B88A32]"
                        }`}
                      >
                        {invitedMap[friend._id] ? "Invited" : "Invite"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] p-5 text-center">
                  <p className="text-sm font-medium text-[#171A18]">No friends online right now</p>
                  <p className="mt-1 text-xs text-[#68706A]">
                    Share your room code above to invite friends directly.
                  </p>
                </div>
              )}
            </div>

            {/* Ready */}
            <div className="flex flex-col gap-4 border-t border-[rgba(30,30,20,0.08)] bg-[#FAF8F2]/40 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#171A18]">
                  {ready ? "You're marked as ready." : "Ready to start?"}
                </p>

                <p className="mt-0.5 text-xs text-[#68706A]">
                  The match will commence when both players are seated and ready.
                </p>
              </div>

              <button
                onClick={() => setReady(!ready)}
                className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition ${
                  ready
                    ? "border border-[#B88A32] bg-[#FAF6EE] text-[#B88A32] shadow-sm"
                    : "bg-[#B88A32] text-white hover:bg-[#A07628] shadow-sm"
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
            <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-5 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
              <h2 className="text-sm font-semibold text-[#171A18]">Match Settings</h2>

              <div className="mt-4 space-y-3">
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
            <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-5 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-[#68706A]" />
                  <h2 className="text-sm font-semibold text-[#171A18]">
                    Spectators
                  </h2>
                </div>

                <span className="text-xs font-mono font-medium text-[#68706A]">Live</span>
              </div>

              <p className="mt-3 text-xs leading-5 text-[#68706A]">
                Peers can enter with the room code to watch the match in real time without interfering.
              </p>
            </div>

            {/* Room status */}
            <div className="rounded-2xl border border-[#B88A32]/25 bg-[#FAF6EE] p-5">
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-[#B88A32]" />

                <p className="text-sm font-semibold text-[#171A18]">
                  You&apos;re the host
                </p>
              </div>

              <p className="mt-2 text-xs leading-5 text-[#68706A]">
                You control the room configuration and can launch the match once the opponent connects.
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
          ? "border-dashed border-[rgba(30,30,20,0.15)] bg-transparent"
          : "border-[rgba(30,30,20,0.08)] bg-[#FAF8F2]"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${
          empty ? "bg-[rgba(30,30,20,0.04)] text-[#68706A]" : "bg-white text-[#171A18] border border-[rgba(30,30,20,0.08)] shadow-sm"
        }`}>
          {initials}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#171A18]">{name}</p>

            {host && (
              <Crown
                size={13}
                className="text-[#B88A32]"
              />
            )}
          </div>

          <p className="mt-0.5 text-xs text-[#68706A]">
            {empty ? "Open player seat" : `${rating} rating`}
          </p>
        </div>
      </div>

      {!empty && (
        <div className="mt-4 flex items-center gap-2 text-xs font-medium">
          <span
            className={`h-2 w-2 rounded-full ${
              ready ? "bg-emerald-500" : "bg-amber-400"
            }`}
          />

          <span className="text-[#68706A]">
            {ready ? "Ready" : "Waiting"}
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
    <div className="flex items-center justify-between py-1 border-b border-[rgba(30,30,20,0.04)] last:border-none">
      <span className="text-xs text-[#68706A]">{label}</span>
      <span className="text-xs font-semibold text-[#171A18]">{value}</span>
    </div>
  );
}
