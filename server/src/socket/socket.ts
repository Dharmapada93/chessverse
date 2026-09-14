import type { Server } from "socket.io";
import {
  addPlayer,
  getGame,
  makeMove,
  persistGame,
  removePlayer,
} from "./game.js";
import {
  createClock,
  getClock,
  startClock,
  switchClock,
} from "./clock.js";
import { User } from "../models/User.js";
import { Game } from "../models/Game.js";
import { Message } from "../models/Message.js";
import { finishGame } from "../services/gameResult.js";

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
      async ({
        roomId,
        role,
      }: {
        roomId: string;
        role: "player" | "spectator";
      }) => {
        const user =
          await User.findById(
            socket.data.userId,
          );

        if (!user) {
          return;
        }

        socket.join(roomId);

        const players =
          roomPlayers.get(roomId) ?? [];

        players.push({
          socketId: socket.id,
          name: user.username,
          role,
        });

        roomPlayers.set(
          roomId,
          players,
        );

        io.to(roomId).emit(
          "room:members",
          {
            members: players,
          },
        );

        socket.emit(
          "room:joined",
          {
            roomId,
            role,
            user: {
              id: user._id,
              username: user.username,
              rating: user.rating,
            },
          },
        );

        if (role === "player") {
          const game = addPlayer(roomId, socket.id, {
            userId: user._id.toString(),
            name: user.username,
            rating: user.rating,
          });

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

        console.log(`${user.username} joined ${roomId} as ${role}`);
      },
    );

    socket.on(
      "game:move",
      async ({
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

        const game = getGame(roomId);
        if (game && result.move) {
          await persistGame(roomId, game.chess, {
            from,
            to,
            promotion,
            san: result.move.san,
          });
        }

        if (
          result.isCheckmate ||
          result.isDraw
        ) {
          const dbGame =
            await Game.findOne({
              roomId,
              status: {
                $in: [
                  "waiting",
                  "playing",
                ],
              },
            });

          if (dbGame) {
            const winner =
              result.isCheckmate
                ? result.turn === "white"
                  ? "black"
                  : "white"
                : "draw";

            const reason =
              result.isCheckmate
                ? "checkmate"
                : "draw";

            await finishGame(
              dbGame._id.toString(),
              winner,
              reason,
            );

            io.to(roomId).emit(
              "game:finished",
              {
                result: winner,
                reason,
              },
            );
          }
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
      async ({
        roomId,
        message,
      }: {
        roomId: string;
        message: string;
      }) => {
        try {
          const user =
            await User.findById(
              socket.data.userId,
            );

          if (!user) {
            return;
          }

          const trimmedMessage =
            message.trim();

          if (!trimmedMessage) {
            return;
          }

          const savedMessage =
            await Message.create({
              roomId,
              userId:
                user._id.toString(),
              username:
                user.username,
              message:
                trimmedMessage,
            });

          io.to(roomId).emit(
            "chat:message",
            {
              id: savedMessage._id.toString(),
              userId:
                savedMessage.userId,
              name:
                savedMessage.username,
              message:
                savedMessage.message,
              createdAt:
                savedMessage.createdAt,
            },
          );
        } catch (error) {
          console.error(
            "Chat message error:",
            error,
          );
        }
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
