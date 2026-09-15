import type { Server } from "socket.io";
import crypto from "node:crypto";
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
import { checkGameTimeout } from "../services/gameTimeout.js";

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
  setInterval(async () => {
    for (const roomId of roomPlayers.keys()) {
      try {
        const game = await Game.findOne({
          roomId,
          status: "playing",
        });

        if (game) {
          const timeout = await checkGameTimeout(game._id.toString());
          if (timeout) {
            await finishGame(
              game._id.toString(),
              timeout.result,
              timeout.reason,
            );
            io.to(roomId).emit("game:finished", {
              result: timeout.result,
              reason: timeout.reason,
            });
          }
        }
      } catch {
        // Ignore background timeout check errors
      }
    }
  }, 1000);

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
        const activeGame = await Game.findOne({
          roomId,
          status: "playing",
        });

        if (activeGame) {
          const timeout = await checkGameTimeout(activeGame._id.toString());
          if (timeout) {
            await finishGame(
              activeGame._id.toString(),
              timeout.result,
              timeout.reason,
            );
            io.to(roomId).emit("game:finished", {
              result: timeout.result,
              reason: timeout.reason,
            });
            socket.emit("game:moveRejected", {
              error: "Time expired",
            });
            return;
          }
        }

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
      "game:resign",
      async ({
        gameId,
      }: {
        gameId: string;
      }) => {
        try {
          const game =
            await Game.findById(
              gameId,
            );

          if (
            !game ||
            game.status !==
              "playing"
          ) {
            return;
          }

          const userId =
            socket.data.userId;

          let result:
            | "white"
            | "black";

          if (
            game.whitePlayerId ===
            userId
          ) {
            result = "black";
          } else if (
            game.blackPlayerId ===
            userId
          ) {
            result = "white";
          } else {
            return;
          }

          await finishGame(
            game._id.toString(),
            result,
            "resignation",
          );

          io.to(
            game.roomId,
          ).emit(
            "game:finished",
            {
              result,
              reason:
                "resignation",
            },
          );
        } catch {
          socket.emit(
            "game:error",
            {
              message:
                "Unable to resign",
            },
          );
        }
      },
    );

    socket.on(
      "game:drawOffer",
      ({
        roomId,
      }: {
        roomId: string;
      }) => {
        socket.to(roomId).emit(
          "game:drawOffer",
          {
            userId:
              socket.data.userId,
          },
        );
      },
    );

    socket.on(
      "game:drawAccept",
      async ({
        gameId,
      }: {
        gameId: string;
      }) => {
        try {
          const game =
            await Game.findById(
              gameId,
            );

          if (
            !game ||
            game.status !==
              "playing"
          ) {
            return;
          }

          await finishGame(
            game._id.toString(),
            "draw",
            "draw",
          );

          io.to(
            game.roomId,
          ).emit(
            "game:finished",
            {
              result: "draw",
              reason: "draw",
            },
          );
        } catch {
          socket.emit(
            "game:error",
            {
              message:
                "Unable to accept draw",
            },
          );
        }
      },
    );

    socket.on(
      "game:rematch",
      async ({
        roomId,
      }: {
        roomId: string;
      }) => {
        const previousGame =
          await Game.findOne({
            roomId,
            status: "finished",
          }).sort({
            finishedAt: -1,
          });

        if (!previousGame) {
          return;
        }

        const newGame =
          await Game.create({
            roomId,

            status: "playing",

            whitePlayerId:
              previousGame.blackPlayerId,

            blackPlayerId:
              previousGame.whitePlayerId,

            whitePlayerName:
              previousGame.blackPlayerName,

            blackPlayerName:
              previousGame.whitePlayerName,

            whiteRating:
              previousGame.blackRating,

            blackRating:
              previousGame.whiteRating,

            initialFen:
              new Chess().fen(),

            currentFen:
              new Chess().fen(),

            whiteTimeMs:
              previousGame.whiteTimeMs,

            blackTimeMs:
              previousGame.blackTimeMs,

            incrementMs:
              previousGame.incrementMs,

            activeColor:
              "white",

            startedAt:
              new Date(),
          });

        const inMemGame = getGame(roomId);
        if (inMemGame) {
          inMemGame.chess = new Chess();
          for (const p of inMemGame.players) {
            p.color = p.color === "white" ? "black" : "white";
          }
        }

        await startGameClock(newGame._id.toString());

        io.to(roomId).emit(
          "game:rematchCreated",
          {
            gameId:
              newGame._id.toString(),

            fen:
              newGame.currentFen,
          },
        );

        broadcastClock(io, roomId, newGame._id.toString());
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

    socket.on(
      "room:reaction",
      ({
        roomId,
        reaction,
      }: {
        roomId: string;
        reaction: string;
      }) => {
        const allowed =
          [
            "👏",
            "🔥",
            "😮",
            "😂",
            "♟️",
          ];

        if (
          !allowed.includes(
            reaction,
          )
        ) {
          return;
        }

        io.to(roomId).emit(
          "room:reaction",
          {
            id:
              crypto.randomUUID(),

            userId:
              socket.data.userId,

            reaction,

            createdAt:
              new Date().toISOString(),
          },
        );
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
