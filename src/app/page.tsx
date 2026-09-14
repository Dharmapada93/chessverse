export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-16 lg:px-10">
        <section className="max-w-3xl">
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-white/45">
            ChessVerse
          </p>

          <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
            Play with your people.
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
            Create a room, challenge your friends, and let everyone else
            watch the game unfold.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <button className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform duration-200 hover:scale-[1.02]">
              Play now
            </button>

            <button className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white/80 transition-colors duration-200 hover:bg-white/5">
              Watch live
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
