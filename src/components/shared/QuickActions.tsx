import Link from "next/link";
import { Plus, Swords, Eye, Users } from "lucide-react";

const actions = [
  {
    href: "/play",
    icon: Swords,
    title: "Play a game",
    description: "Find a match instantly",
  },
  {
    href: "/room/create",
    icon: Plus,
    title: "Create a room",
    description: "Private room with clock",
  },
  {
    href: "/room/join",
    icon: Users,
    title: "Join a room",
    description: "Enter with a room code",
  },
  {
    href: "/watch",
    icon: Eye,
    title: "Watch live",
    description: "Spectate ongoing matches",
  },
];

export default function QuickActions() {
  return (
    <section>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88A32]">
        Quick actions
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 backdrop-blur-md p-5 transition-all duration-200 hover:border-[#B88A32]/40 hover:bg-[#FAF8F2] hover:-translate-y-0.5 shadow-[0_8px_30px_rgba(35,30,20,0.04)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF6EE] text-[#B88A32] border border-[#B88A32]/20 transition-transform group-hover:scale-105">
                <Icon
                  size={18}
                  strokeWidth={2}
                />
              </div>

              <p className="mt-4 text-sm font-semibold text-[#171A18]">
                {action.title}
              </p>

              <p className="mt-0.5 text-xs text-[#68706A]">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
