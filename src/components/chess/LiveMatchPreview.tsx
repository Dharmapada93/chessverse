const pieces = [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
];

export default function LiveMatchPreview() {
  return (
    <section
      id="watch"
      className="mx-auto max-w-7xl px-6 pb-32 lg:px-10"
    >
      <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-[#11110f] lg:grid-cols-[1fr_320px]">
        <div className="p-5 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                  Live match
                </span>
              </div>

              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                Dharmapada vs Rahul
              </h2>
            </div>

            <div className="text-right">
              <div className="text-lg font-medium">10:42</div>
              <div className="text-xs text-white/35">10 min</div>
            </div>
          </div>

          <div className="mx-auto grid max-w-[640px] grid-cols-8 overflow-hidden rounded-xl border border-black/30">
            {pieces.flatMap((row, rowIndex) =>
              row.map((piece, colIndex) => {
                const isLight = (rowIndex + colIndex) % 2 === 0;

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`flex aspect-square items-center justify-center text-[clamp(22px,5vw,46px)] ${
                      isLight ? "bg-[#e5ddcc]" : "bg-[#8c7658]"
                    }`}
                  >
                    <span
                      className={
                        rowIndex < 2
                          ? "text-[#25231f]"
                          : "text-[#f5f1e7]"
                      }
                    >
                      {piece}
                    </span>
                  </div>
                );
              }),
            )}
          </div>
        </div>

        <aside className="border-t border-white/10 p-6 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Watching</span>
            <span className="text-sm text-white/40">24 people</span>
          </div>

          <div className="mt-6 space-y-4">
            {[
              ["RS", "Rahul", "1512"],
              ["SA", "Sagar", "1478"],
              ["AM", "Aman", "1432"],
              ["PR", "Priya", "1396"],
            ].map(([initials, name, rating]) => (
              <div
                key={name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-xs text-white/60">
                    {initials}
                  </div>

                  <div>
                    <div className="text-sm">{name}</div>
                    <div className="text-xs text-white/30">
                      Rating {rating}
                    </div>
                  </div>
                </div>

                <span className="text-xs text-white/30">watching</span>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="text-xs uppercase tracking-[0.18em] text-white/30">
              Live chat
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <p className="text-white/55">
                <span className="text-white/80">Sagar</span>{" "}
                That knight move 👀
              </p>

              <p className="text-white/55">
                <span className="text-white/80">Aman</span>{" "}
                This is getting good.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
