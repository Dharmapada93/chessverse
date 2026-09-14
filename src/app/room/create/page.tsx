"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Lock,
  Play,
  Radio,
  Users,
} from "lucide-react";

const timeControls = [
  { label: "1 + 0", value: "1+0", description: "Bullet" },
  { label: "3 + 0", value: "3+0", description: "Blitz" },
  { label: "5 + 0", value: "5+0", description: "Blitz" },
  { label: "5 + 3", value: "5+3", description: "Blitz" },
  { label: "10 + 0", value: "10+0", description: "Rapid" },
  { label: "15 + 10", value: "15+10", description: "Rapid" },
];

export default function CreateRoomPage() {
  const [roomName, setRoomName] = useState("Friday Night Chess");
  const [timeControl, setTimeControl] = useState("5+3");
  const [visibility, setVisibility] = useState<"private" | "public">(
    "private",
  );
  const [rated, setRated] = useState(false);
  const [spectators, setSpectators] = useState(true);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f4f1e9]">
      {/* Header */}
      <header className="flex h-16 items-center border-b border-white/8 px-6">
        <Link
          href="/dashboard"
          className="mr-4 rounded-lg p-2 text-white/45 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft size={19} />
        </Link>

        <div>
          <p className="text-sm font-medium">Create a room</p>
          <p className="text-xs text-white/30">
            Set up a game for your friends
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-12">
        <div className="mb-10">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#d7b875]">
            New room
          </p>

          <h1 className="text-3xl font-medium tracking-tight">
            Bring your people together.
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">
            Create a private chess room, invite your friends, and let
            everyone watch the games unfold.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* Settings */}
          <section className="rounded-2xl border border-white/8 bg-[#11110f] p-6">
            <div className="mb-8">
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/35">
                Room name
              </label>

              <input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-[#d7b875]/50"
                placeholder="Give your room a name"
              />
            </div>

            {/* Time control */}
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-white/35">
                  Time control
                </label>

                <span className="text-xs text-white/25">
                  {timeControl}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {timeControls.map((control) => {
                  const active = timeControl === control.value;

                  return (
                    <button
                      key={control.value}
                      onClick={() => setTimeControl(control.value)}
                      className={`rounded-xl border p-4 text-left transition ${
                        active
                          ? "border-[#d7b875]/60 bg-[#d7b875]/8"
                          : "border-white/8 bg-black/10 hover:border-white/15"
                      }`}
                    >
                      <p
                        className={`font-mono text-sm ${
                          active ? "text-[#d7b875]" : "text-white/80"
                        }`}
                      >
                        {control.label}
                      </p>

                      <p className="mt-1 text-[11px] text-white/30">
                        {control.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visibility */}
            <div className="mb-8">
              <label className="mb-3 block text-xs uppercase tracking-wider text-white/35">
                Room visibility
              </label>

              <div className="grid grid-cols-2 gap-2">
                <ChoiceButton
                  active={visibility === "private"}
                  icon={<Lock size={16} />}
                  title="Private"
                  description="Invite only"
                  onClick={() => setVisibility("private")}
                />

                <ChoiceButton
                  active={visibility === "public"}
                  icon={<Radio size={16} />}
                  title="Public"
                  description="Anyone can join"
                  onClick={() => setVisibility("public")}
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <Toggle
                icon={<Users size={17} />}
                title="Rated game"
                description="Games affect player ratings"
                enabled={rated}
                onChange={() => setRated(!rated)}
              />

              <Toggle
                icon={<Eye size={17} />}
                title="Allow spectators"
                description="Friends can watch live matches"
                enabled={spectators}
                onChange={() => setSpectators(!spectators)}
              />
            </div>
          </section>

          {/* Preview */}
          <aside className="h-fit rounded-2xl border border-white/8 bg-[#11110f] p-5">
            <p className="text-xs uppercase tracking-wider text-white/30">
              Room preview
            </p>

            <div className="mt-5 rounded-xl border border-white/8 bg-black/15 p-4">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {roomName || "Untitled room"}
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    {visibility === "private"
                      ? "Private room"
                      : "Public room"}
                  </p>
                </div>

                <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-white/40">
                  {timeControl}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <PreviewRow
                  icon={<Users size={14} />}
                  text="Players"
                  value="0 / 2"
                />

                <PreviewRow
                  icon={<Eye size={14} />}
                  text="Spectators"
                  value={spectators ? "Allowed" : "Disabled"}
                />

                <PreviewRow
                  icon={<Radio size={14} />}
                  text="Rating"
                  value={rated ? "Rated" : "Casual"}
                />
              </div>
            </div>

            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d7b875] px-4 py-3 text-sm font-medium text-[#171512] transition hover:bg-[#e1c68b]">
              <Play size={16} />
              Create room
            </button>

            <p className="mt-4 text-center text-[11px] leading-5 text-white/25">
              You can invite friends after creating the room.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ChoiceButton({
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
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
        active
          ? "border-[#d7b875]/60 bg-[#d7b875]/8"
          : "border-white/8 hover:border-white/15"
      }`}
    >
      <span className={active ? "text-[#d7b875]" : "text-white/40"}>
        {icon}
      </span>

      <span>
        <span className="block text-sm">{title}</span>
        <span className="mt-1 block text-[11px] text-white/30">
          {description}
        </span>
      </span>
    </button>
  );
}

function Toggle({
  icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center justify-between rounded-xl border border-white/8 p-4 text-left transition hover:border-white/15"
    >
      <div className="flex items-center gap-3">
        <span className="text-white/40">{icon}</span>

        <div>
          <p className="text-sm">{title}</p>
          <p className="mt-1 text-[11px] text-white/30">
            {description}
          </p>
        </div>
      </div>

      <span
        className={`relative h-5 w-9 rounded-full transition ${
          enabled ? "bg-[#d7b875]" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-1 h-3 w-3 rounded-full bg-white transition ${
            enabled ? "left-5" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

function PreviewRow({
  icon,
  text,
  value,
}: {
  icon: React.ReactNode;
  text: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-white/40">
        {icon}
        <span>{text}</span>
      </div>

      <span className="text-white/65">{value}</span>
    </div>
  );
}
