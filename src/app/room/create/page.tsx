"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom } from "@/lib/room-storage";
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
  const router = useRouter();
  const [roomName, setRoomName] = useState("Friday Night Chess");
  const [timeControl, setTimeControl] = useState("5+3");
  const [visibility, setVisibility] = useState<"private" | "public">(
    "private",
  );
  const [rated, setRated] = useState(false);
  const [spectators, setSpectators] = useState(true);

  return (
    <main className="min-h-screen bg-transparent text-[#171A18] animate-pageEnter">
      {/* Header */}
      <header className="flex h-16 items-center border-b border-[rgba(30,30,20,0.08)] bg-[#F7F4EC]/90 backdrop-blur-md px-6">
        <Link
          href="/dashboard"
          className="mr-4 rounded-xl p-2 text-[#68706A] transition hover:bg-white hover:text-[#171A18]"
        >
          <ArrowLeft size={19} />
        </Link>

        <div>
          <p className="text-sm font-semibold text-[#171A18]">Create a room</p>
          <p className="text-xs text-[#68706A]">
            Set up a game for your friends
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-12">
        <div className="mb-10">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#B88A32] font-bold">
            New room
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[#171A18]">
            Bring your people together.
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#68706A]">
            Create a private chess room, invite your friends, and let
            everyone watch the games unfold.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* Settings */}
          <section className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 p-6 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
            <div className="mb-8">
              <label className="mb-2 block text-xs uppercase tracking-wider text-[#68706A] font-semibold">
                Room name
              </label>

              <input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                className="w-full rounded-xl border border-[rgba(30,30,20,0.12)] bg-white px-4 py-3 text-sm text-[#171A18] outline-none transition placeholder:text-[#68706A]/40 focus:border-[#B88A32] shadow-sm"
                placeholder="Give your room a name"
              />
            </div>

            {/* Time control */}
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-[#68706A] font-semibold">
                  Time control
                </label>

                <span className="text-xs text-[#68706A] font-mono">
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
                      className={`rounded-xl border p-4 text-left transition cursor-pointer shadow-sm ${
                        active
                          ? "border-[#B88A32] bg-[#B88A32]/10"
                          : "border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] hover:border-[rgba(30,30,20,0.2)]"
                      }`}
                    >
                      <p
                        className={`font-mono text-sm font-bold ${
                          active ? "text-[#B88A32]" : "text-[#171A18]"
                        }`}
                      >
                        {control.label}
                      </p>

                      <p className="mt-1 text-[11px] text-[#68706A]">
                        {control.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visibility */}
            <div className="mb-8">
              <label className="mb-3 block text-xs uppercase tracking-wider text-[#68706A] font-semibold">
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
          <aside className="h-fit rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 p-5 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
            <p className="text-xs uppercase tracking-wider text-[#68706A] font-semibold">
              Room preview
            </p>

            <div className="mt-5 rounded-xl border border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] p-4">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#171A18]">
                    {roomName || "Untitled room"}
                  </p>

                  <p className="mt-1 text-xs text-[#68706A]">
                    {visibility === "private"
                      ? "Private room"
                      : "Public room"}
                  </p>
                </div>

                <span className="rounded-md bg-white border border-[rgba(30,30,20,0.08)] px-2 py-1 text-[10px] text-[#68706A] font-mono">
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

            <button
              onClick={() => {
                const selectedTimeControl =
                  timeControls.find(
                    (control) => control.value === timeControl,
                  ) ?? timeControls[0];

                const room = createRoom({
                  name: roomName || "Untitled room",
                  visibility,
                  rated,
                  spectators,
                  timeControl: {
                    label: selectedTimeControl.label,
                    minutes: Number(
                      selectedTimeControl.value.split("+")[0],
                    ),
                    increment: Number(
                      selectedTimeControl.value.split("+")[1],
                    ),
                  },
                });

                router.push(`/room/${room.id}/lobby`);
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#B88A32] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#A07628] shadow-sm hover:-translate-y-0.5 cursor-pointer"
            >
              <Play size={16} />
              Create room
            </button>

            <p className="mt-4 text-center text-[11px] leading-5 text-[#68706A]">
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
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer shadow-sm ${
        active
          ? "border-[#B88A32] bg-[#B88A32]/10"
          : "border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] hover:border-[rgba(30,30,20,0.2)]"
      }`}
    >
      <span className={active ? "text-[#B88A32]" : "text-[#68706A]"}>
        {icon}
      </span>

      <span>
        <span className="block text-sm font-semibold text-[#171A18]">{title}</span>
        <span className="mt-1 block text-[11px] text-[#68706A]">
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
      className="flex w-full items-center justify-between rounded-xl border border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] p-4 text-left transition hover:border-[rgba(30,30,20,0.2)] cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <span className="text-[#68706A]">{icon}</span>

        <div>
          <p className="text-sm font-medium text-[#171A18]">{title}</p>
          <p className="mt-1 text-[11px] text-[#68706A]">
            {description}
          </p>
        </div>
      </div>

      <span
        className={`relative h-5 w-9 rounded-full transition ${
          enabled ? "bg-[#B88A32]" : "bg-neutral-200"
        }`}
      >
        <span
          className={`absolute top-1 h-3 w-3 rounded-full bg-white transition shadow-sm ${
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
      <div className="flex items-center gap-2 text-[#68706A]">
        {icon}
        <span>{text}</span>
      </div>

      <span className="text-[#171A18] font-medium">{value}</span>
    </div>
  );
}
