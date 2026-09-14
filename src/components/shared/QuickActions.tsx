import Link from "next/link";
import { Plus, Swords, Eye } from "lucide-react";

const actions = [
  {
    href: "/play",
    icon: Swords,
    title: "Play a game",
    description: "Find an opponent",
  },
  {
    href: "/room/create",
    icon: Plus,
    title: "Create a room",
    description: "Invite your friends",
  },
  {
    href: "/watch",
    icon: Eye,
    title: "Watch live",
    description: "See who's playing",
  },
];

export default function QuickActions() {
  return (
    <section>
      <p className="mb-4 text-xs uppercase tracking-[0.18em] text-white/25">
        Quick actions
      </p>

      <div className="grid gap-2 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-2xl border border-white/8 bg-[#11110f] p-5 transition-colors hover:border-white/15 hover:bg-[#141412]"
            >
              <Icon
                size={18}
                strokeWidth={1.7}
                className="text-white/40 transition-colors group-hover:text-[#d7b875]"
              />

              <p className="mt-7 text-sm font-medium">
                {action.title}
              </p>

              <p className="mt-1 text-xs text-white/30">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
