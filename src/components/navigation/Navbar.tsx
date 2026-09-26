import Link from "next/link";
import ChessVerseLogo from "@/components/brand/ChessVerseLogo";

export default function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <ChessVerseLogo variant="full" size="md" href="/" />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main Navigation">
          <Link
            href="/play"
            className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
          >
            Play
          </Link>

          <Link
            href="/watch"
            className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
          >
            Watch
          </Link>

          <Link
            href="/friends"
            className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
          >
            Friends
          </Link>

          <Link
            href="/training/dashboard"
            className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
          >
            Puzzles
          </Link>
        </nav>

        <Link
          href="/dashboard"
          className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}
