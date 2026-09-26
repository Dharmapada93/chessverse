"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swords, UserPlus } from "lucide-react";
import { socialService, type Friend } from "@/services/social";

export default function OnlineFriends() {
  const [onlineFriends, setOnlineFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socialService
      .fetchFriends()
      .then((friends) => {
        setOnlineFriends(friends.filter((f) => f.online));
      })
      .catch(() => setOnlineFriends([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88A32]">
            Your circle
          </span>
          <h2 className="mt-1 text-xl font-serif font-semibold tracking-tight text-[#171A18]">
            Friends online
          </h2>
        </div>

        <Link
          href="/friends"
          className="text-xs font-semibold text-[#68706A] transition-colors hover:text-[#171A18]"
        >
          View all
        </Link>
      </div>

      <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-3 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
        {loading ? (
          <div className="p-4 text-center text-xs text-[#68706A]">Checking online friends...</div>
        ) : onlineFriends.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#68706A] space-y-2">
            <p className="text-[#171A18] font-semibold">No friends online right now.</p>
            <p>Connect with players to see their live availability.</p>
            <div className="pt-2">
              <Link
                href="/friends"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B88A32] hover:underline"
              >
                <UserPlus size={13} />
                Find friends
              </Link>
            </div>
          </div>
        ) : (
          onlineFriends.map((friend) => (
            <div
              key={friend._id}
              className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-[#FAF8F2]"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF8F2] border border-[rgba(30,30,20,0.08)] text-xs font-bold text-[#171A18]">
                    {friend.username.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#171A18]">{friend.username}</p>
                  <p className="mt-0.5 text-xs text-[#68706A] font-mono">
                    {friend.rating || 1500} Elo · Online
                  </p>
                </div>
              </div>

              <Link
                href={`/play?mode=friends&challenge=${friend._id}`}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(30,30,20,0.12)] bg-white text-[#68706A] transition-colors hover:bg-[#FAF6EE] hover:text-[#B88A32] hover:border-[#B88A32] shadow-sm"
                aria-label={`Challenge ${friend.username}`}
              >
                <Swords size={14} />
              </Link>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
