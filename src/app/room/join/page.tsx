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
    <main className="min-h-screen bg-[#0a0a0a] text-[#f4f1e9]">
      <header className="flex h-16 items-center border-b border-white/8 px-6">
        <button
          onClick={() => router.back()}
          className="mr-4 rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <p className="text-sm font-medium">
            Join a room
          </p>

          <p className="text-xs text-white/30">
            Play with your friends
          </p>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center justify-center px-5 py-12">
        <div className="grid w-full max-w-4xl gap-5 lg:grid-cols-[1fr_300px]">
          {/* Main */}
          <section className="rounded-2xl border border-white/8 bg-[#11110f] p-7 sm:p-9">
            <div className="mb-9">
              <p className="text-xs uppercase tracking-[0.2em] text-[#d7b875]">
                Join room
              </p>

              <h1 className="mt-3 text-3xl font-medium tracking-tight">
                Enter the room.
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-white/35">
                Enter the room code shared by your friend.
                You can join the game or simply watch.
              </p>
            </div>

            {/* Code */}
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/35">
                Room code
              </label>

              <div className="relative">
                <Hash
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
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
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-4 pl-11 pr-4 font-mono text-lg tracking-[0.15em] outline-none transition placeholder:text-white/15 focus:border-[#d7b875]/50"
                />
              </div>

              {error && (
                <p className="mt-2 text-xs text-red-400">
                  {error}
                </p>
              )}
            </div>

            {/* Join mode */}
            <div className="mt-8">
              <label className="mb-3 block text-xs uppercase tracking-wider text-white/35">
                Join as
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
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d7b875] px-5 py-3.5 text-sm font-medium text-[#171512] transition hover:bg-[#e1c68b]"
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

          {/* Info */}
          <aside className="h-fit rounded-2xl border border-white/8 bg-[#11110f] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
              <Users size={19} className="text-[#d7b875]" />
            </div>

            <h2 className="mt-5 text-sm font-medium">
              How rooms work
            </h2>

            <div className="mt-5 space-y-5">
              <InfoRow
                number="01"
                title="Join"
                text="Enter the code shared by your friend."
              />

              <InfoRow
                number="02"
                title="Choose"
                text="Play the match or join as a spectator."
              />

              <InfoRow
                number="03"
                title="Connect"
                text="Chat and react while the game happens."
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
          ? "border-[#d7b875]/60 bg-[#d7b875]/8"
          : "border-white/8 hover:border-white/15"
      }`}
    >
      <div
        className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${
          active
            ? "bg-[#d7b875]/10 text-[#d7b875]"
            : "bg-white/5 text-white/40"
        }`}
      >
        {icon}
      </div>

      <p className="text-sm font-medium">{title}</p>

      <p className="mt-1 text-xs text-white/30">
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
      <span className="font-mono text-[10px] text-[#d7b875]/60">
        {number}
      </span>

      <div>
        <p className="text-xs font-medium">{title}</p>

        <p className="mt-1 text-[11px] leading-5 text-white/30">
          {text}
        </p>
      </div>
    </div>
  );
}
