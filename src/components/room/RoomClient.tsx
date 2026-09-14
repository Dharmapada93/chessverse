"use client";

import { useRoomSocket } from "@/hooks/useRoomSocket";

type RoomClientProps = {
  roomId: string;
};

export default function RoomClient({
  roomId,
}: RoomClientProps) {
  useRoomSocket({
    roomId,
    name: "You",
    role: "player",
  });

  return null;
}
