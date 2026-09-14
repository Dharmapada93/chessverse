import Link from "next/link";
import { Eye, ArrowUpRight } from "lucide-react";

const matches = [
  {
    white: "Sagar",
    black: "Aman",
    whiteRating: 1518,
    blackRating: 1472,
    spectators: 24,
  },
  {
    white: "Rahul",
    black: "Rohan",
    whiteRating: 1624,
    blackRating: 1587,
    spectators: 11,
  },
];

export default function LiveMatches() {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/25">
            Happening now
          </p>

          <h2 className="mt-2 text-xl font-medium tracking-tight">
            Live matches
          </h2>
        </div>

        <Link
          href="/watch"
          className="flex items-center gap-1 text-xs text-white/35 transition-colors hover:text-white"
        >
          See all
          <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="space-y-2">
        {matches.map((match) => (
          <Link
            href="/watch"
            key={`${match.white}-${match.black}`}
            className="group flex items-center justify-between rounded-2xl border border-white/8 bg-[#11110f] p-4 transition-colors hover:border-white/15 hover:bg-[#141412]"
          >
            <div className="flex items-center gap-4">
              <span className="h-2 w-2 rounded-full bg-red-400" />

              <div>
                <p className="text-sm font-medium">
                  {match.white}
                </p>

                <p className="mt-1 text-xs text-white/30">
                  {match.whiteRating}
                </p>
              </div>

              <span className="text-xs text-white/20">vs</span>

              <div>
                <p className="text-sm font-medium">
                  {match.black}
                </p>

                <p className="mt-1 text-xs text-white/30">
                  {match.blackRating}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/30">
              <Eye size={14} />
              {match.spectators}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
