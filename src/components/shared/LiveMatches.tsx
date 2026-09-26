"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, ArrowUpRight, Swords } from "lucide-react";
import { apiFetch } from "@/lib/api";

type ActiveMatch = {
  id: string;
  white: string;
  black: string;
  whiteRating: number;
  blackRating: number;
  spectators: number;
};

export default function LiveMatches() {
  const [matches, setMatches] = useState<ActiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/games/live/active")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.games)) {
          setMatches(
            data.games.map((g: any) => ({
              id: g.roomId || g._id,
              white: g.whitePlayerName || "White",
              black: g.blackPlayerName || "Black",
              whiteRating: g.whiteRating || 1500,
              blackRating: g.blackRating || 1500,
              spectators: g.spectators || 0,
            }))
          );
        }
      })
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88A32]">
            Happening now
          </span>
          <h2 className="mt-1 text-xl font-serif font-semibold tracking-tight text-[#171A18]">
            Live matches
          </h2>
        </div>

        <Link
          href="/watch"
          className="flex items-center gap-1 text-xs font-semibold text-[#68706A] transition-colors hover:text-[#171A18]"
        >
          See all
          <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="space-y-2.5">
        {loading ? (
          <div className="p-6 text-center text-xs text-[#68706A] border border-[rgba(30,30,20,0.08)] rounded-2xl bg-white/85">
            Checking live arena...
          </div>
        ) : matches.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#68706A] border border-[rgba(30,30,20,0.08)] rounded-2xl bg-white/85 backdrop-blur-md shadow-[0_8px_30px_rgba(35,30,20,0.04)] space-y-2">
            <p className="text-[#171A18] font-semibold text-sm">The arena is quiet.</p>
            <p>No active live games right now. Start a match or invite a friend to appear here.</p>
            <div className="pt-2">
              <Link
                href="/play"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B88A32] hover:underline"
              >
                <Swords size={13} />
                Play a game
              </Link>
            </div>
          </div>
        ) : (
          matches.map((match) => (
            <Link
              href={`/game/${match.id}`}
              key={match.id}
              className="group flex items-center justify-between rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/90 backdrop-blur-md p-4 transition-all duration-200 hover:border-[#B88A32]/40 hover:bg-[#FAF8F2] hover:shadow-[0_8px_30px_rgba(35,30,20,0.04)]"
            >
              <div className="flex items-center gap-4">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <p className="text-sm font-semibold text-[#171A18]">{match.white}</p>
                  <p className="mt-0.5 text-xs text-[#68706A] font-mono">{match.whiteRating}</p>
                </div>
                <span className="text-xs text-[#68706A]/50 font-serif italic">vs</span>
                <div>
                  <p className="text-sm font-semibold text-[#171A18]">{match.black}</p>
                  <p className="mt-0.5 text-xs text-[#68706A] font-mono">{match.blackRating}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#68706A] font-mono">
                <Eye size={13} className="text-[#B88A32]" />
                <span>{match.spectators}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
