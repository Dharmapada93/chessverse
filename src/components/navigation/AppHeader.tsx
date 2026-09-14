import { Bell, Search } from "lucide-react";

export default function AppHeader() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-white/8 px-5 sm:px-8">
      <div>
        <p className="text-xs text-white/30">Monday, September 14</p>
        <h1 className="mt-1 text-lg font-medium tracking-tight">
          Good morning, Dharmapada.
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/8 text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white sm:flex"
          aria-label="Search"
        >
          <Search size={17} />
        </button>

        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/8 text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white"
          aria-label="Notifications"
        >
          <Bell size={17} />

          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#d7b875]" />
        </button>
      </div>
    </header>
  );
}
