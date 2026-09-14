"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket";

type RoomRole = "player" | "spectator";

type UseRoomSocketProps = {
  roomId: string;
  name: string;
  role: RoomRole;
};

export function useRoomSocket({
  roomId,
  name,
  role,
}: UseRoomSocketProps) {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("room:join", {
      roomId,
      name,
      role,
    });

    return () => {
      socket.emit("room:leave", {
        roomId,
      });

      socket.disconnect();
    };
  }, [roomId, name, role]);
}
