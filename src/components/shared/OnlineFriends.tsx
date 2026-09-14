import Link from "next/link";
import { Swords } from "lucide-react";

const friends = [
  { initials: "RS", name: "Rahul", rating: 1512, status: "Playing" },
  { initials: "SA", name: "Sagar", rating: 1478, status: "Online" },
  { initials: "AM", name: "Aman", rating: 1432, status: "Online" },
  { initials: "PR", name: "Priya", rating: 1396, status: "Online" },
];

export default function OnlineFriends() {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/25">
            Your people
          </p>

          <h2 className="mt-2 text-xl font-medium tracking-tight">
            Friends online
          </h2>
        </div>

        <Link
          href="/friends"
          className="text-xs text-white/35 transition-colors hover:text-white"
        >
          View all
        </Link>
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#11110f] p-2">
        {friends.map((friend) => (
          <div
            key={friend.name}
            className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-white/[0.03]"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-xs text-white/60">
                  {friend.initials}
                </div>

                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#11110f] bg-emerald-400" />
              </div>

              <div>
                <p className="text-sm">{friend.name}</p>

                <p className="mt-0.5 text-xs text-white/30">
                  {friend.rating} · {friend.status}
                </p>
              </div>
            </div>

            <button
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white"
              aria-label={`Challenge ${friend.name}`}
            >
              <Swords size={14} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
