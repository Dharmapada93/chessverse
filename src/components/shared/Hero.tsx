export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#d7b875]/[0.035] blur-[140px]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-24 pt-32 lg:px-10">
        <div className="max-w-4xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d7b875]" />
            <span className="text-xs tracking-wide text-white/55">
              A better place to play chess together
            </span>
          </div>

          <h1 className="max-w-4xl text-6xl font-semibold leading-[0.95] tracking-[-0.065em] text-white sm:text-7xl lg:text-[100px]">
            Play with
            <br />
            your people.
          </h1>

          <p className="mt-8 max-w-xl text-base leading-7 text-white/45 sm:text-lg">
            Create a room, challenge your friends, and let everyone else
            watch the game unfold.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <button className="rounded-full bg-[#f4f1e9] px-6 py-3 text-sm font-semibold text-[#0a0a0a] transition-transform hover:scale-[1.02]">
              Play a game
            </button>

            <button className="rounded-full border border-white/10 bg-white/[0.025] px-6 py-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/[0.07]">
              Watch live
            </button>
          </div>

          <div className="mt-12 flex items-center gap-6 text-xs text-white/35">
            <span>Real-time games</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>Private rooms</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>Live spectators</span>
          </div>
        </div>
      </div>
    </section>
  );
}
