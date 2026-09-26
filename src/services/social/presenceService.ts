import { socket } from "@/lib/socket";

export type PresenceListener = (data: {
  userId: string;
  online: boolean;
  status: "online" | "playing" | "away" | "offline";
  inGame?: boolean;
  gameId?: string;
  roomId?: string;
  opponentName?: string;
}) => void;

export const presenceService = {
  subscribe(listener: PresenceListener): () => void {
    const handlePresence = (data: any) => {
      if (data && data.userId) {
        listener(data);
      }
    };

    const handleCustomEvent = (e: any) => {
      if (e.detail && e.detail.userId) {
        listener(e.detail);
      }
    };

    if (socket) {
      socket.on("presence:update", handlePresence);
      socket.on("social:presence", handlePresence);
    }

    if (typeof window !== "undefined") {
      window.addEventListener("chessverse:presence", handleCustomEvent);
    }

    return () => {
      if (socket) {
        socket.off("presence:update", handlePresence);
        socket.off("social:presence", handlePresence);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("chessverse:presence", handleCustomEvent);
      }
    };
  },
};
