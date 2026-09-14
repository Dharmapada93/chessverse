import Link from "next/link";
import { ArrowLeft, Copy, Crown, MessageCircle, Users } from "lucide-react";
import ChessGame from "@/components/chess/ChessGame";

const spectators = [
  { name: "Priya", rating: 1512, online: true, isHost: true },
  { name: "Rahul", rating: 1438, online: true },
  { name: "Aman", rating: 1396, online: true },
  { name: "Rohan", rating: 1472, online: false },
];

const messages = [
  { name: "Priya", text: "That opening was clean." },
  { name: "Rahul", text: "I think Aman has a tactic here." },
  { name: "Aman", text: "Don't spoil it 😄" },
];

export default function ChessRoomPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f4f1e9]">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/8 px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Friday Night Chess</p>
              <Crown size={13} className="text-[#d7b875]" />
            </div>
            <p className="text-xs text-white/35">Room #CV-4821</p>
          </div>
        </div>

        <button className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 transition hover:bg-white/5 hover:text-white">
          <Copy size={14} />
          Copy invite
        </button>
      </header>

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-5 p-5 lg:grid-cols-[1fr_300px_320px]">
        {/* Chess Area */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                Live Match
              </p>
              <h1 className="mt-1 text-xl font-medium">
                Aman vs Rohan
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/40">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live
            </div>
          </div>

          {/* Player top */}
          <div className="mb-3 flex items-center justify-between rounded-xl border border-white/8 bg-[#11110f] px-4 py-3">
            <div>
              <p className="text-sm font-medium">Rohan</p>
              <p className="text-xs text-white/35">1,472</p>
            </div>

            <div className="font-mono text-xl">08:42</div>
          </div>

          {/* Board */}
          <div className="mx-auto w-full max-w-[720px]">
            <ChessGame />
          </div>

          {/* Player bottom */}
          <div className="mt-3 flex items-center justify-between rounded-xl border border-white/8 bg-[#11110f] px-4 py-3">
            <div>
              <p className="text-sm font-medium">Aman</p>
              <p className="text-xs text-white/35">1,396</p>
            </div>

            <div className="font-mono text-xl">09:18</div>
          </div>
        </section>

        {/* Spectators */}
        <section className="rounded-xl border border-white/8 bg-[#11110f]">
          <div className="border-b border-white/8 p-5">
            <div className="flex items-center gap-2">
              <Users size={17} className="text-white/50" />
              <h2 className="text-sm font-medium">Spectators</h2>
            </div>

            <p className="mt-1 text-xs text-white/35">
              24 people watching
            </p>
          </div>

          <div className="divide-y divide-white/6">
            {spectators.map((person) => (
              <div
                key={person.name}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-xs font-medium">
                    {person.name.charAt(0)}
                  </div>

                  <div>
                    <p className="text-sm">{person.name}</p>
                    <p className="text-xs text-white/30">
                      {person.rating}
                    </p>
                  </div>
                </div>

                <span
                  className={`h-2 w-2 rounded-full ${
                    person.online ? "bg-emerald-400" : "bg-white/15"
                  }`}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Chat */}
        <section className="flex min-h-[620px] flex-col rounded-xl border border-white/8 bg-[#11110f]">
          <div className="flex items-center gap-2 border-b border-white/8 p-5">
            <MessageCircle size={17} className="text-white/50" />
            <h2 className="text-sm font-medium">Room Chat</h2>
          </div>

          <div className="flex-1 space-y-5 overflow-auto p-5">
            {messages.map((message, index) => (
              <div key={index}>
                <p className="mb-1 text-xs font-medium text-white/45">
                  {message.name}
                </p>
                <p className="text-sm leading-6 text-white/75">
                  {message.text}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/8 p-4">
            <input
              type="text"
              placeholder="Say something..."
              className="w-full rounded-lg border border-white/8 bg-black/20 px-3 py-2.5 text-sm outline-none placeholder:text-white/20 focus:border-white/20"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
