"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

type Reaction = {
  id: string;
  reaction: string;
};

export default function ReactionOverlay() {
  const [
    reactions,
    setReactions,
  ] = useState<Reaction[]>([]);

  useEffect(() => {
    function handleReaction(
      reaction: Reaction,
    ) {
      setReactions(
        (current) => [
          ...current,
          reaction,
        ],
      );

      setTimeout(() => {
        setReactions(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                reaction.id,
            ),
        );
      }, 2200);
    }

    socket.on(
      "room:reaction",
      handleReaction,
    );

    return () => {
      socket.off(
        "room:reaction",
        handleReaction,
      );
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-30">
      {reactions.map(
        (item, index) => (
          <div
            key={item.id}
            className="absolute bottom-10 animate-bounce text-3xl select-none"
            style={{
              right:
                20 +
                index * 48,
            }}
          >
            {item.reaction}
          </div>
        ),
      )}
    </div>
  );
}
