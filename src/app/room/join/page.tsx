"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  Hash,
  Play,
  Users,
} from "lucide-react";
import { getRoom } from "@/lib/room-storage";

type JoinMode = "player" | "spectator";

export default function JoinRoomPage() {
  const router = useRouter();

  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<JoinMode>("player");
  const [error, setError] = useState("");

  function joinRoom() {
    const code = roomCode.trim().toUpperCase();

    if (!code) {
      setError("Enter a room code.");
      return;
    }

    if (code.length < 4) {
      setError("Please enter a valid room code.");
      return;
    }

    const room = getRoom();

    if (!room) {
      setError(
        "Room not found. Create a room first in this browser.",
      );
      return;
    }

    if (room.code !== code) {
      setError("That room code doesn't exist.");
      return;
    }

    setError("");

    sessionStorage.setItem(
      "chessverse-join-mode",
      mode,
    );

    router.push(`/room/${room.id}/lobby`);
  }

  return (
    <main className="min-h-screen bg-transparent text-[#171A18] animate-pageEnter">
      <header className="flex h-16 items-center border-b border-[rgba(30,30,20,0.08)] bg-[#FAF8F2]/80 backdrop-blur-md px-6">
        <button
          onClick={() => router.back()}
          className="mr-4 rounded-lg p-2 text-[#68706A] transition hover:bg-[rgba(30,30,20,0.05)] hover:text-[#171A18]"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <p className="text-sm font-semibold text-[#171A18]">
            Join a Room
          </p>

          <p className="text-xs text-[#68706A]">
            Enter a match or spectate live
          </p>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center justify-center px-5 py-12">
        <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[1fr_300px]">
          {/* Main Card */}
          <section className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-7 sm:p-9 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
            <div className="mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88A32]">
                Join Room
              </span>

              <h1 className="mt-2 text-3xl font-serif font-medium tracking-tight text-[#171A18]">
                Enter the room.
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-[#68706A]">
                Enter the room code shared by your peer. You can join directly to take a seat or spectate the game live.
              </p>
            </div>

            {/* Code Input */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#68706A]">
                Room Code
              </label>

              <div className="relative">
                <Hash
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#68706A]/50"
                />

                <input
                  value={roomCode}
                  onChange={(event) => {
                    setRoomCode(
                      event.target.value
                        .toUpperCase()
                        .slice(0, 8),
                    );

                    setError("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      joinRoom();
                    }
                  }}
                  placeholder="CV-4821"
                  className="w-full rounded-xl border border-[rgba(30,30,20,0.12)] bg-[#FAF8F2] py-4 pl-11 pr-4 font-mono text-lg tracking-[0.15em] text-[#171A18] outline-none transition placeholder:text-[#68706A]/40 focus:border-[#B88A32] focus:ring-2 focus:ring-[#B88A32]/20"
                />
              </div>

              {error && (
                <p className="mt-2 text-xs font-medium text-rose-600">
                  {error}
                </p>
              )}
            </div>

            {/* Join mode */}
            <div className="mt-8">
              <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-[#68706A]">
                Join As
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <JoinModeCard
                  active={mode === "player"}
                  icon={<Play size={18} />}
                  title="Player"
                  description="Take a seat and play"
                  onClick={() => setMode("player")}
                />

                <JoinModeCard
                  active={mode === "spectator"}
                  icon={<Eye size={18} />}
                  title="Spectator"
                  description="Watch the match live"
                  onClick={() => setMode("spectator")}
                />
              </div>
            </div>

            <button
              onClick={joinRoom}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#B88A32] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#A07628] hover:-translate-y-0.5 shadow-sm"
            >
              {mode === "player" ? (
                <Play size={16} />
              ) : (
                <Eye size={16} />
              )}

              {mode === "player"
                ? "Join as player"
                : "Join as spectator"}
            </button>
          </section>

          {/* Info Sidebar */}
          <aside className="h-fit rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-6 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF6EE] text-[#B88A32] border border-[#B88A32]/20">
              <Users size={19} />
            </div>

            <h2 className="mt-5 text-sm font-semibold text-[#171A18]">
              How rooms work
            </h2>

            <div className="mt-5 space-y-5">
              <InfoRow
                number="01"
                title="Join"
                text="Enter the unique code shared by your friend or club member."
              />

              <InfoRow
                number="02"
                title="Choose"
                text="Take your seat as a player or join to observe as a spectator."
              />

              <InfoRow
                number="03"
                title="Connect"
                text="Realtime board sync, live chat, and clock synchronization."
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function JoinModeCard({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-5 text-left transition ${
        active
          ? "border-[#B88A32] bg-[#FAF6EE] shadow-sm"
          : "border-[rgba(30,30,20,0.08)] bg-white hover:border-[rgba(30,30,20,0.16)]"
      }`}
    >
      <div
        className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${
          active
            ? "bg-[#B88A32]/10 text-[#B88A32]"
            : "bg-[#FAF8F2] text-[#68706A]"
        }`}
      >
        {icon}
      </div>

      <p className="text-sm font-semibold text-[#171A18]">{title}</p>

      <p className="mt-1 text-xs text-[#68706A]">
        {description}
      </p>
    </button>
  );
}

function InfoRow({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="font-mono text-[10px] font-bold text-[#B88A32]">
        {number}
      </span>

      <div>
        <p className="text-xs font-semibold text-[#171A18]">{title}</p>

        <p className="mt-1 text-[11px] leading-5 text-[#68706A]">
          {text}
        </p>
      </div>
    </div>
  );
}
