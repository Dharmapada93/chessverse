"use client";

import { useRoomSocket } from "@/hooks/useRoomSocket";

type RoomClientProps = {
  roomId: string;
  role?: "player" | "spectator";
};

export default function RoomClient({
  roomId,
  role = "player",
}: RoomClientProps) {
  useRoomSocket({
    roomId,
    role,
  });

  return null;
}
