"use client";

import { socket } from "@/lib/socket";

type LiveReactionsProps = {
  roomId: string;
};

const reactions = [
  "👏",
  "🔥",
  "😮",
  "😂",
  "♟️",
];

export default function LiveReactions({
  roomId,
}: LiveReactionsProps) {
  return (
    <div className="flex items-center gap-2">
      {reactions.map(
        (reaction) => (
          <button
            key={reaction}
            onClick={() => {
              socket.emit(
                "room:reaction",
                {
                  roomId,
                  reaction,
                },
              );
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-sm transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
          >
            {reaction}
          </button>
        ),
      )}
    </div>
  );
}
