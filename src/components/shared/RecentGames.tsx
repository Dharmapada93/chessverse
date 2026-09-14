const games = [
  {
    opponent: "Rahul",
    result: "Win",
    rating: "+18",
    date: "Today",
  },
  {
    opponent: "Sagar",
    result: "Draw",
    rating: "+2",
    date: "Yesterday",
  },
  {
    opponent: "Aman",
    result: "Loss",
    rating: "-14",
    date: "Sep 11",
  },
];

export default function RecentGames() {
  return (
    <section>
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.18em] text-white/25">
          Your games
        </p>

        <h2 className="mt-2 text-xl font-medium tracking-tight">
          Recent games
        </h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#11110f]">
        {games.map((game, index) => (
          <div
            key={game.opponent}
            className={`flex items-center justify-between p-4 ${
              index !== games.length - 1 ? "border-b border-white/8" : ""
            }`}
          >
            <div>
              <p className="text-sm">
                vs {game.opponent}
              </p>

              <p className="mt-1 text-xs text-white/30">
                {game.date}
              </p>
            </div>

            <div className="text-right">
              <p
                className={`text-sm ${
                  game.result === "Win"
                    ? "text-emerald-400"
                    : game.result === "Loss"
                      ? "text-red-400"
                      : "text-white/50"
                }`}
              >
                {game.result}
              </p>

              <p className="mt-1 text-xs text-white/30">
                {game.rating}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
