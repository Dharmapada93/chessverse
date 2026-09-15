import type { Server } from "socket.io";
import { Chess } from "chess.js";
import {
  addPlayer,
  getGame,
  makeMove,
  persistGame,
  removePlayer,
} from "./game.js";
import {
  getCurrentClock,
  startGameClock,
  updateClockAfterMove,
  type ClockColor,
} from "./clock.js";
import { User } from "../models/User.js";
import { Game } from "../models/Game.js";
import { Message } from "../models/Message.js";
import { finishGame } from "../services/gameResult.js";
import { createGameForRoom } from "../services/game.js";

type RoomPlayer = {
  socketId: string;
  name: string;
  role: "player" | "spectator";
};

const roomPlayers = new Map<string, RoomPlayer[]>();

function broadcastClock(
  io: Server,
  roomId: string,
  gameId: string,
) {
  getCurrentClock(gameId)
    .then((clock) => {
      if (!clock) {
        return;
      }

      io.to(roomId).emit(
        "game:clock",
        clock,
      );
    })
    .catch(() => {
      // Ignore clock broadcast errors.
    });
}

export function registerSocketHandlers(io: Server) {

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

        let dbGame = await Game.findOne({
          roomId,
          status: {
            $in: ["waiting", "playing"],
          },
        }).sort({ createdAt: -1 });

        if (!dbGame) {
          try {
            dbGame = await createGameForRoom(roomId);
          } catch {
            dbGame = await Game.create({
              roomId,
              status: "waiting",
              initialFen: new Chess().fen(),
              currentFen: new Chess().fen(),
              whiteTimeMs: 5 * 60 * 1000,
              blackTimeMs: 5 * 60 * 1000,
              incrementMs: 3 * 1000,
            });
          }
        }

        if (role === "player") {
          const game = addPlayer(roomId, socket.id, {
            userId: user._id.toString(),
            name: user.username,
            rating: user.rating,
          });

          const currentPlayer = game.players.find(
            (player) => player.socketId === socket.id,
          );

          if (dbGame && currentPlayer) {
            if (currentPlayer.color === "white") {
              dbGame.whitePlayerId = user._id.toString();
              dbGame.whitePlayerName = user.username;
              dbGame.whiteRating = user.rating;
              await dbGame.save();
            } else if (currentPlayer.color === "black") {
              dbGame.blackPlayerId = user._id.toString();
              dbGame.blackPlayerName = user.username;
              dbGame.blackRating = user.rating;
              await dbGame.save();
            }
          }

          if (game.players.length === 2 && dbGame) {
            await startGameClock(dbGame._id.toString());
            broadcastClock(io, roomId, dbGame._id.toString());
          }

          socket.emit("game:joined", {
            gameId: dbGame?._id.toString(),
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

          if (dbGame && dbGame.status === "playing") {
            broadcastClock(io, roomId, dbGame._id.toString());
          }
        } else {
          const game = getGame(roomId);
          socket.emit("game:joined", {
            gameId: dbGame?._id.toString(),
            color: null,
            fen: game ? game.chess.fen() : (dbGame ? dbGame.currentFen : new Chess().fen()),
            turn: game
              ? (game.chess.turn() === "w" ? "white" : "black")
              : (dbGame?.activeColor ?? "white"),
          });

          if (dbGame && dbGame.status === "playing") {
            broadcastClock(io, roomId, dbGame._id.toString());
          }
        }

        console.log(`${user.username} joined ${roomId} as ${role}`);
      },
    );

    socket.on(
      "game:clock",
      async ({
        gameId,
      }: {
        gameId: string;
      }) => {
        try {
          const clock =
            await getCurrentClock(
              gameId,
            );

          if (!clock) {
            return;
          }

          socket.emit(
            "game:clock",
            clock,
          );
        } catch {
          socket.emit(
            "game:error",
            {
              message:
                "Unable to load game clock",
            },
          );
        }
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

        const dbGame =
          await Game.findOne({
            roomId,
            status: {
              $in: [
                "waiting",
                "playing",
              ],
            },
          }).sort({ createdAt: -1 });

        if (
          result.isCheckmate ||
          result.isDraw
        ) {
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

        if (dbGame && result.turn && !result.isCheckmate && !result.isDraw) {
          await updateClockAfterMove(
            dbGame._id.toString(),
            result.turn as ClockColor,
          );
          broadcastClock(io, roomId, dbGame._id.toString());
        }

        io.to(roomId).emit("game:state", result);
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
