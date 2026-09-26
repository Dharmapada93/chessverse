import type { Server, Socket } from "socket.io";
import {
  emitToUser,
  setUserOnline,
  setUserOffline,
  isUserOnline,
  userSockets,
} from "./socket.js";
import { User } from "../models/User.js";
import { Game } from "../models/Game.js";

// Disconnect grace timers: userId -> NodeJS.Timeout (R4.10)
const disconnectGraceTimers = new Map<string, NodeJS.Timeout>();

export function registerSocialSocket(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  if (userId) {
    // If a disconnect grace timer was running for this user, cancel it
    if (disconnectGraceTimers.has(userId)) {
      clearTimeout(disconnectGraceTimers.get(userId)!);
      disconnectGraceTimers.delete(userId);
    }

    const becameOnline = setUserOnline(userId, socket.id);
    if (becameOnline) {
      // Check if user is currently playing in an active game
      Game.findOne({
        status: "playing",
        $or: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
      })
        .select("_id roomId whitePlayerId blackPlayerId whitePlayerName blackPlayerName")
        .then((activeGame) => {
          const payload = {
            userId,
            online: true,
            status: activeGame ? "playing" : "online",
            inGame: !!activeGame,
            gameId: activeGame?._id?.toString(),
            roomId: activeGame?.roomId,
            opponentName: activeGame
              ? activeGame.whitePlayerId === userId
                ? activeGame.blackPlayerName
                : activeGame.whitePlayerName
              : undefined,
          };
          io.emit("presence:update", payload);
          io.emit("social:presence", payload);
        })
        .catch(() => {
          const payload = { userId, online: true, status: "online", inGame: false };
          io.emit("presence:update", payload);
          io.emit("social:presence", payload);
        });
    }
  }

  // -------------------------------------------------------------
  // R4.38: Typing Indicator (Ephemeral, non-persisted)
  // -------------------------------------------------------------
  socket.on(
    "social:typing",
    (data: { recipientId: string; isTyping: boolean }) => {
      if (!userId || !data.recipientId) return;
      emitToUser(data.recipientId, "social:typing", {
        senderId: userId,
        isTyping: !!data.isTyping,
      });
    },
  );

  // -------------------------------------------------------------
  // R4.10: Disconnect Grace Period Handler
  // -------------------------------------------------------------
  socket.on("disconnect", () => {
    if (!userId) return;

    // Check if this was the user's last remaining socket
    const userSocketsSet = userSockets.get(userId);
    const isLastSocket = !userSocketsSet || userSocketsSet.size <= 1;

    setUserOffline(userId, socket.id);

    if (isLastSocket) {
      // Start 5-second grace period before marking offline
      const timer = setTimeout(() => {
        disconnectGraceTimers.delete(userId);
        if (!isUserOnline(userId)) {
          const payload = {
            userId,
            online: false,
            status: "offline",
            inGame: false,
          };
          io.emit("presence:update", payload);
          io.emit("social:presence", payload);
        }
      }, 5000);

      disconnectGraceTimers.set(userId, timer);
    }
  });
}
