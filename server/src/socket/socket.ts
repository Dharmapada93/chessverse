import type { Server } from "socket.io";
import {
  addPlayer,
  getGame,
  makeMove,
  removePlayer,
} from "./game.js";
import {
  createClock,
  getClock,
  startClock,
  switchClock,
} from "./clock.js";

type RoomPlayer = {
  socketId: string;
  name: string;
  role: "player" | "spectator";
};

const roomPlayers = new Map<string, RoomPlayer[]>();

export function registerSocketHandlers(io: Server) {
  setInterval(() => {
    for (const roomId of roomPlayers.keys()) {
      const clock = getClock(roomId);

      if (clock) {
        io.to(roomId).emit("clock:state", clock);
      }
    }
  }, 250);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on(
      "room:join",
      ({
        roomId,
        name,
        role,
      }: {
        roomId: string;
        name: string;
        role: "player" | "spectator";
      }) => {
        socket.join(roomId);

        const players = roomPlayers.get(roomId) ?? [];

        players.push({
          socketId: socket.id,
          name,
          role,
        });

        roomPlayers.set(roomId, players);

        io.to(roomId).emit("room:members", {
          members: players,
        });

        socket.emit("room:joined", {
          roomId,
          role,
        });

        if (role === "player") {
          const game = addPlayer(roomId, socket.id);

          if (game.players.length === 2) {
            createClock(roomId, 5, 3);
            startClock(roomId, "white");
            io.to(roomId).emit("clock:state", getClock(roomId));
          }

          const currentPlayer = game.players.find(
            (player) => player.socketId === socket.id,
          );

          socket.emit("game:joined", {
            color: currentPlayer?.color,
            fen: game.chess.fen(),
            turn:
              game.chess.turn() === "w"
                ? "white"
                : "black",
          });

          io.to(roomId).emit("game:players", {
            players: game.players,
          });
        } else {
          const game = getGame(roomId);
          if (game) {
            socket.emit("game:joined", {
              color: null,
              fen: game.chess.fen(),
              turn:
                game.chess.turn() === "w"
                  ? "white"
                  : "black",
            });
          }
        }

        console.log(`${name} joined ${roomId} as ${role}`);
      },
    );

    socket.on(
      "game:move",
      ({
        roomId,
        from,
        to,
        promotion,
      }: {
        roomId: string;
        from: string;
        to: string;
        promotion?: string;
      }) => {
        const result = makeMove(
          roomId,
          socket.id,
          from,
          to,
          promotion,
        );

        if (!result.success) {
          socket.emit("game:moveRejected", {
            error: result.error,
          });
          return;
        }

        if (result.turn) {
          switchClock(roomId, result.turn as "white" | "black");
        }

        io.to(roomId).emit("game:state", result);
        io.to(roomId).emit("clock:state", getClock(roomId));
      },
    );

    socket.on(
      "room:leave",
      ({ roomId }: { roomId: string }) => {
        socket.leave(roomId);

        removePlayer(roomId, socket.id);
        removePlayerInRoom(socket.id, roomId);

        io.to(roomId).emit("room:members", {
          members: roomPlayers.get(roomId) ?? [],
        });
      },
    );

    socket.on(
      "chat:send",
      ({
        roomId,
        name,
        message,
      }: {
        roomId: string;
        name: string;
        message: string;
      }) => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage) {
          return;
        }

        io.to(roomId).emit("chat:message", {
          id: crypto.randomUUID(),
          name,
          message: trimmedMessage,
          createdAt: new Date().toISOString(),
        });
      },
    );

    socket.on("disconnect", () => {
      for (const roomId of roomPlayers.keys()) {
        removePlayer(roomId, socket.id);
      }

      for (const roomId of roomPlayers.keys()) {
        const removed = removePlayerInRoom(socket.id, roomId);

        if (removed) {
          io.to(roomId).emit("room:members", {
            members: roomPlayers.get(roomId) ?? [],
          });
        }
      }

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

function removePlayerInRoom(socketId: string, roomId: string) {
  const players = roomPlayers.get(roomId);

  if (!players) {
    return false;
  }

  const filtered = players.filter(
    (player) => player.socketId !== socketId,
  );

  if (filtered.length === 0) {
    roomPlayers.delete(roomId);
  } else {
    roomPlayers.set(roomId, filtered);
  }

  return filtered.length !== players.length;
}
