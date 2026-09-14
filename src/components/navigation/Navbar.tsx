import Link from "next/link";

export default function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="ChessVerse home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg">
            ♟
          </span>

          <span className="text-[15px] font-semibold tracking-[-0.02em]">
            ChessVerse
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#play"
            className="text-sm text-white/55 transition-colors hover:text-white"
          >
            Play
          </Link>

          <Link
            href="#watch"
            className="text-sm text-white/55 transition-colors hover:text-white"
          >
            Watch
          </Link>

          <Link
            href="#features"
            className="text-sm text-white/55 transition-colors hover:text-white"
          >
            Features
          </Link>
        </nav>

        <button className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/[0.08]">
          Sign in
        </button>
      </div>
    </header>
  );
}
