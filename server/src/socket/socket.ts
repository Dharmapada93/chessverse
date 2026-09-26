import type { Server } from "socket.io";
import crypto from "node:crypto";
import { Chess } from "chess.js";
import {
  addPlayer,
  ensureGame,
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
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Game } from "../models/Game.js";
import { Message } from "../models/Message.js";
import { GameChat } from "../models/GameChat.js";
import { GameInvitation } from "../models/GameInvitation.js";
import { Notification } from "../models/Notification.js";
import { finishGame } from "../services/gameResult.js";
import { checkGameTimeout } from "../services/gameTimeout.js";
import { createGameForRoom } from "../services/game.js";
import { registerGameSocket } from "./gameSocket.js";
import { registerSocialSocket } from "./socialSocket.js";
import {
  addToQueue,
  removeFromQueue,
  removeSocketFromQueue,
  refreshHeartbeat,
} from "../services/matchmakingService.js";
import { logger } from "../utils/logger.js";

type RoomPlayer = {
  socketId: string;
  name: string;
  role: "player" | "spectator";
};

const roomPlayers = new Map<string, RoomPlayer[]>();
export const userSockets = new Map<string, Set<string>>();
let globalIo: Server | null = null;

// Chat rate limits and reaction storage (Step 78)
const messageReactions = new Map<string, Map<string, Set<string>>>(); // messageId -> Map<emoji, Set<userId>>
const chatRateLimits = new Map<string, number>(); // socketId -> timestamp
const reactionRateLimits = new Map<string, number>(); // socketId -> timestamp

function escapeChatText(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function setUserOnline(userId: string, socketId: string): boolean {
  let sockets = userSockets.get(userId);
  const wasOnline = !!(sockets && sockets.size > 0);
  if (!sockets) {
    sockets = new Set<string>();
    userSockets.set(userId, sockets);
  }
  sockets.add(socketId);
  return !wasOnline;
}

export function setUserOffline(userId: string, socketId: string): boolean {
  const sockets = userSockets.get(userId);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSockets.delete(userId);
    return true;
  }
  return false;
}

export function isUserOnline(userId: string): boolean {
  const sockets = userSockets.get(userId);
  return !!(sockets && sockets.size > 0);
}

export function getOnlineUsers(): string[] {
  return Array.from(userSockets.keys());
}

export function getSocketTelemetry() {
  let spectatorCount = 0;
  for (const list of roomPlayers.values()) {
    for (const p of list) {
      if (p.role === "spectator") spectatorCount++;
    }
  }

  const activeConnections = globalIo?.sockets?.sockets?.size ?? 0;
  const usersOnline = userSockets.size;
  const roomCount = roomPlayers.size;

  return {
    activeConnections,
    usersOnline,
    roomCount,
    spectatorCount,
  };
}

export function emitToUser(userId: string, event: string, payload: any) {
  if (!globalIo) return;
  const sockets = userSockets.get(userId);
  if (sockets) {
    for (const sId of sockets) {
      globalIo.to(sId).emit(event, payload);
    }
  }
}

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

      if (roomId) {
        io.to(roomId).emit("game:clock", clock);
      }
      if (gameId) {
        io.to(`game:${gameId}`).emit("game:clock", clock);
      }
    })
    .catch(() => {
      // Ignore clock broadcast errors.
    });
}

export async function getFullGameState(gameIdOrRoom: string) {
  let dbGame = null;
  if (mongoose.Types.ObjectId.isValid(gameIdOrRoom)) {
    dbGame = await Game.findById(gameIdOrRoom);
  }
  if (!dbGame) {
    dbGame = await Game.findOne({
      roomId: gameIdOrRoom,
      status: { $in: ["playing", "waiting", "finished"] },
    }).sort({ createdAt: -1 });
  }

  if (!dbGame) return null;

  const inMemGame = ensureGame(dbGame.roomId, dbGame.currentFen);
  const currentFen = inMemGame ? inMemGame.chess.fen() : dbGame.currentFen;
  const chess = inMemGame ? inMemGame.chess : new Chess(currentFen);

  let clock = null;
  try {
    clock = await getCurrentClock(dbGame._id.toString());
  } catch {}

  const lastMove =
    dbGame.moves.length > 0 ? dbGame.moves[dbGame.moves.length - 1] : null;

  return {
    gameId: dbGame._id.toString(),
    roomId: dbGame.roomId,
    fen: currentFen,
    turn: chess.turn() === "w" ? "white" : "black",
    status: dbGame.status,
    result: dbGame.result,
    resultReason: dbGame.resultReason,
    isCheck: chess.inCheck(),
    isCheckmate: chess.isCheckmate(),
    isDraw: chess.isDraw(),
    whitePlayer: {
      id: dbGame.whitePlayerId,
      name: dbGame.whitePlayerName || "White",
      rating: dbGame.whiteRating || 1500,
    },
    blackPlayer: {
      id: dbGame.blackPlayerId,
      name: dbGame.blackPlayerName || "Black",
      rating: dbGame.blackRating || 1500,
    },
    moves: dbGame.moves.map((m: any) => ({
      from: m.from,
      to: m.to,
      promotion: m.promotion,
      san: m.san,
    })),
    lastMove: lastMove ? { from: lastMove.from, to: lastMove.to } : null,
    clocks: clock || {
      whiteTime: dbGame.whiteTimeMs,
      blackTime: dbGame.blackTimeMs,
      activeColor: dbGame.activeColor === "white" ? "w" : "b",
      serverTime: Date.now(),
    },
  };
}

export function registerSocketHandlers(io: Server) {
  globalIo = io;

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
    logger.info("websocket_connected", {
      socketId: socket.id,
      userId: socket.data.userId,
      role: socket.data.role,
    });

    if (socket.data.userId) {
      const becameOnline = setUserOnline(socket.data.userId, socket.id);
      if (becameOnline) {
        io.emit("presence:update", {
          userId: socket.data.userId,
          status: "online",
          online: true,
        });
      }
    }

    registerGameSocket(io, socket);
    registerSocialSocket(io, socket);

    socket.on(
      "room:join",
      async (data: {
        roomId?: string;
        roomCode?: string;
        role?: "player" | "spectator";
      }) => {
        const roomId = data.roomId || data.roomCode || "";
        const roomCode = data.roomCode || data.roomId || "";
        const role = data.role || "player";

        socket.data.roomCode = roomCode;
        socket.data.role = role;

        const user =
          await User.findById(
            socket.data.userId,
          );

        if (!user) {
          return;
        }

        socket.join(roomId);
        if (roomCode) {
          socket.join(`room:${roomCode}`);
        }

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

        if (roomCode) {
          io.to(`room:${roomCode}`).emit("room:presence", {
            socketId: socket.id,
            role,
          });
        }

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
              lastClockUpdateAt: new Date(),
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
      "game:resign",
      async ({
        gameId,
        roomId: rawRoomId,
      }: {
        gameId?: string;
        roomId?: string;
      }) => {
        try {
          let game = null;
          if (gameId && mongoose.Types.ObjectId.isValid(gameId)) {
            game = await Game.findById(gameId);
          }
          if (!game && rawRoomId) {
            game = await Game.findOne({
              roomId: rawRoomId,
              status: "playing",
            });
          }

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

          const payload = {
            result,
            reason: "resignation",
          };

          io.to(game.roomId).emit("game:finished", payload);
          io.to(`game:${game._id.toString()}`).emit("game:finished", payload);
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

    const handleDrawOffer = async ({
      roomId,
      gameId,
    }: {
      roomId?: string;
      gameId?: string;
    }) => {
      if (socket.data.role === "spectator") {
        socket.emit("game:error", { message: "Spectators cannot offer draws." });
        return;
      }
      let game = null;
      if (gameId && mongoose.Types.ObjectId.isValid(gameId)) {
        game = await Game.findById(gameId);
      } else if (roomId) {
        game = await Game.findOne({ roomId, status: "playing" });
      }
      if (!game || (game.whitePlayerId !== socket.data.userId && game.blackPlayerId !== socket.data.userId)) {
        return;
      }
      const payload = {
        userId: socket.data.userId,
      };
      if (roomId) {
        socket.to(roomId).emit("game:drawOffer", payload);
      }
      if (gameId) {
        socket.to(`game:${gameId}`).emit("game:drawOffer", payload);
      }
    };

    socket.on("game:drawOffer", handleDrawOffer);
    socket.on("game:draw-offer", handleDrawOffer);

    const handleDrawAccept = async ({
      gameId,
      roomId: rawRoomId,
    }: {
      gameId?: string;
      roomId?: string;
    }) => {
      try {
        if (socket.data.role === "spectator") {
          socket.emit("game:error", { message: "Spectators cannot accept draws." });
          return;
        }

        let game = null;
        if (gameId && mongoose.Types.ObjectId.isValid(gameId)) {
          game = await Game.findById(gameId);
        }
        if (!game && rawRoomId) {
          game = await Game.findOne({
            roomId: rawRoomId,
            status: "playing",
          });
        }

        if (
          !game ||
          game.status !== "playing" ||
          (game.whitePlayerId !== socket.data.userId && game.blackPlayerId !== socket.data.userId)
        ) {
          return;
        }

        await finishGame(
          game._id.toString(),
          "draw",
          "draw",
        );

        const payload = {
          result: "draw",
          reason: "draw",
        };

        io.to(game.roomId).emit("game:finished", payload);
        io.to(`game:${game._id.toString()}`).emit("game:finished", payload);
      } catch {
        socket.emit(
          "game:error",
          {
            message:
              "Unable to accept draw",
          },
        );
      }
    };

    socket.on("game:drawAccept", handleDrawAccept);
    socket.on("game:draw-accept", handleDrawAccept);

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

            lastClockUpdateAt:
              new Date(),

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

    async function handleChatMessage(data: {
      roomId?: string;
      gameId?: string;
      message: string;
    }) {
      try {
        const userId = socket.data.userId;
        if (!userId) {
          socket.emit("chat:error", { message: "Authentication required." });
          return;
        }

        // Rate limit: 1 message per 800ms
        const now = Date.now();
        const lastChat = chatRateLimits.get(socket.id) || 0;
        if (now - lastChat < 800) {
          socket.emit("chat:error", { message: "Slow down! You are sending messages too quickly." });
          return;
        }
        chatRateLimits.set(socket.id, now);

        const cleanMessage = escapeChatText(String(data.message || "").trim().slice(0, 300));
        if (!cleanMessage) {
          return;
        }

        const user = await User.findById(userId);
        if (!user) {
          return;
        }

        // Validate game membership if gameId provided
        if (data.gameId) {
          if (!mongoose.Types.ObjectId.isValid(data.gameId)) return;
          const game = await Game.findById(data.gameId);
          if (!game) return;
        }

        let savedId = crypto.randomUUID();
        let createdAt = new Date();

        if (data.gameId && mongoose.Types.ObjectId.isValid(data.gameId)) {
          try {
            const gameChat = await GameChat.create({
              gameId: data.gameId,
              userId: user._id,
              message: cleanMessage,
            });
            savedId = gameChat.id;
            createdAt = gameChat.createdAt;
          } catch (err) {
            console.error("GameChat error:", err);
          }
        }

        if (data.roomId) {
          try {
            const savedMessage = await Message.create({
              roomId: data.roomId,
              userId: user._id.toString(),
              username: user.username,
              message: cleanMessage,
            });
            savedId = savedMessage._id.toString();
            createdAt = savedMessage.createdAt;
          } catch {}
        }

        const messagePayload = {
          id: savedId,
          userId: user._id.toString(),
          username: user.username,
          name: user.username,
          message: cleanMessage,
          createdAt,
          reactions: {},
        };

        if (data.roomId) {
          io.to(data.roomId).emit("chat:message", messagePayload);
        }
        if (socket.data.roomCode && socket.data.roomCode !== data.roomId) {
          io.to(`room:${socket.data.roomCode}`).emit("chat:message", messagePayload);
        }
        if (data.gameId) {
          io.to(`game:${data.gameId}`).emit("chat:message", messagePayload);
        }
      } catch (error) {
        console.error("Chat message error:", error);
      }
    }

    socket.on("chat:message", handleChatMessage);
    socket.on("chat:send", handleChatMessage);

    // Emoji reactions on messages (Step 78.4)
    const ALLOWED_REACTIONS = ["👍", "👏", "🔥", "😮", "GG", "❤️"];
    socket.on(
      "chat:react",
      (data: {
        gameId?: string;
        roomId?: string;
        messageId: string;
        reaction: string;
      }) => {
        try {
          const userId = socket.data.userId;
          if (!userId || !data?.messageId || !ALLOWED_REACTIONS.includes(data.reaction)) {
            return;
          }

          // Rate limit: 1 reaction per 500ms
          const now = Date.now();
          const lastReact = reactionRateLimits.get(socket.id) || 0;
          if (now - lastReact < 500) return;
          reactionRateLimits.set(socket.id, now);

          if (!messageReactions.has(data.messageId)) {
            messageReactions.set(data.messageId, new Map());
          }
          const msgMap = messageReactions.get(data.messageId)!;
          if (!msgMap.has(data.reaction)) {
            msgMap.set(data.reaction, new Set());
          }
          const userSet = msgMap.get(data.reaction)!;

          if (userSet.has(userId)) {
            userSet.delete(userId);
          } else {
            userSet.add(userId);
          }

          const summary: Record<string, number> = {};
          for (const [emoji, users] of msgMap.entries()) {
            if (users.size > 0) {
              summary[emoji] = users.size;
            }
          }

          const reactionPayload = {
            messageId: data.messageId,
            reactions: summary,
            reaction: data.reaction,
            userId,
          };

          if (data.gameId) {
            io.to(`game:${data.gameId}`).emit("chat:reaction", reactionPayload);
          }
          if (data.roomId) {
            io.to(data.roomId).emit("chat:reaction", reactionPayload);
          }
        } catch (err) {
          console.error("chat:react error:", err);
        }
      },
    );

    socket.on("presence:join", () => {
      if (socket.data.userId) {
        const becameOnline = setUserOnline(socket.data.userId, socket.id);
        io.emit("presence:update", {
          userId: socket.data.userId,
          status: "online",
          online: true,
        });
        socket.emit("presence:list", {
          onlineUsers: getOnlineUsers(),
        });
      }
    });

    socket.on("presence:get", () => {
      socket.emit("presence:list", {
        onlineUsers: getOnlineUsers(),
      });
    });

    // Step 73: Real-Time Matchmaking
    socket.on(
      "matchmaking:join",
      async (data: {
        category?: "bullet" | "blitz" | "rapid" | "classical";
        initialTime?: number;
        increment?: number;
      }) => {
        try {
          const userId = socket.data.userId;
          if (!userId) {
            socket.emit("matchmaking:error", { message: "Authentication required." });
            return;
          }

          const user = await User.findById(userId);
          if (!user) {
            socket.emit("matchmaking:error", { message: "User not found." });
            return;
          }

          const initialSec = data?.initialTime || 180;
          const incSec = data?.increment || 0;
          const initialMs = initialSec * 1000;

          const category =
            data?.category ||
            (initialSec < 180
              ? "bullet"
              : initialSec <= 300
              ? "blitz"
              : initialSec <= 1800
              ? "rapid"
              : "classical");

          const rating =
            user.ratings?.[category] || user.rating || 1500;

          const queueResult = await addToQueue({
            userId: user._id.toString(),
            socketId: socket.id,
            username: user.username,
            rating,
            category,
            initialTime: initialMs,
            increment: incSec,
            joinedAt: Date.now(),
            lastHeartbeat: Date.now(),
          });

          if (!queueResult.success) {
            socket.emit("matchmaking:error", { message: queueResult.message || "Cannot join queue." });
            return;
          }

          socket.emit("matchmaking:queued", {
            category,
            initialTime: initialSec,
            increment: incSec,
            rating,
          });
        } catch (err) {
          console.error("matchmaking:join error:", err);
          socket.emit("matchmaking:error", { message: "Failed to join matchmaking queue." });
        }
      },
    );

    socket.on("matchmaking:heartbeat", () => {
      if (socket.data.userId) {
        refreshHeartbeat(socket.data.userId);
      }
    });

    socket.on("matchmaking:cancel", () => {
      if (socket.data.userId) {
        removeFromQueue(socket.data.userId);
        socket.emit("matchmaking:cancelled");
      }
    });

    // Step 66.3: Send Challenge
    socket.on(
      "challenge:send",
      async (data: {
        receiverId: string;
        timeControl: { initialTime: number; increment: number };
        colorPreference?: "random" | "white" | "black";
      }) => {
        try {
          const senderId = socket.data.userId;
          if (!senderId) {
            socket.emit("challenge:error", { message: "Authentication required." });
            return;
          }

          if (senderId === data.receiverId) {
            socket.emit("challenge:error", { message: "Cannot challenge yourself." });
            return;
          }

          const [sender, receiver] = await Promise.all([
            User.findById(senderId),
            User.findById(data.receiverId),
          ]);

          if (!sender || !receiver) {
            socket.emit("challenge:error", { message: "User not found." });
            return;
          }

          const initialTime = data.timeControl?.initialTime || 300000;
          const increment = data.timeControl?.increment || 0;
          const colorPreference = data.colorPreference || "random";

          const invitation = await GameInvitation.create({
            senderId,
            receiverId: data.receiverId,
            timeControl: { initialTime, increment },
            colorPreference,
            status: "pending",
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          });

          const notification = await Notification.create({
            userId: receiver._id,
            type: "game_invite",
            actorId: sender._id,
            actorUsername: sender.username,
            title: "Game Challenge",
            message: `${sender.username} challenged you to a chess game (${Math.round(initialTime / 60000)}+${increment}).`,
            referenceId: invitation._id.toString(),
          });

          const invitePayload = {
            invitationId: invitation._id.toString(),
            sender: {
              id: sender._id.toString(),
              username: sender.username,
              rating: sender.rating,
              avatar: sender.avatar,
            },
            timeControl: { initialTime, increment },
            colorPreference,
            expiresAt: invitation.expiresAt,
          };

          emitToUser(data.receiverId, "challenge:received", invitePayload);
          emitToUser(data.receiverId, "notification:new", notification);
          socket.emit("challenge:sent", { success: true, invitation: invitePayload });
        } catch (err) {
          console.error("challenge:send error:", err);
          socket.emit("challenge:error", { message: "Failed to send challenge." });
        }
      },
    );

    // Step 66.4: Accept Challenge
    socket.on("challenge:accept", async ({ invitationId }: { invitationId: string }) => {
      try {
        const userId = socket.data.userId;
        if (!userId) return;

        const invitation = await GameInvitation.findOne({
          _id: invitationId,
          receiverId: userId,
          status: "pending",
        });

        if (!invitation) {
          socket.emit("challenge:error", { message: "Invitation not found or already accepted." });
          return;
        }

        if (new Date() > invitation.expiresAt) {
          invitation.status = "expired";
          await invitation.save();
          socket.emit("challenge:error", { message: "Invitation has expired." });
          return;
        }

        invitation.status = "accepted";

        let whitePlayerId = invitation.senderId.toString();
        let blackPlayerId = invitation.receiverId.toString();

        if (invitation.colorPreference === "white") {
          whitePlayerId = invitation.senderId.toString();
          blackPlayerId = invitation.receiverId.toString();
        } else if (invitation.colorPreference === "black") {
          whitePlayerId = invitation.receiverId.toString();
          blackPlayerId = invitation.senderId.toString();
        } else {
          if (Math.random() > 0.5) {
            whitePlayerId = invitation.receiverId.toString();
            blackPlayerId = invitation.senderId.toString();
          }
        }

        const [whiteUser, blackUser] = await Promise.all([
          User.findById(whitePlayerId),
          User.findById(blackPlayerId),
        ]);

        const roomCode = `CV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const initialTime = invitation.timeControl.initialTime;
        const incrementMs = invitation.timeControl.increment * 1000;

        const newGame = await Game.create({
          roomId: roomCode,
          status: "playing",
          whitePlayerId,
          blackPlayerId,
          whitePlayerName: whiteUser?.username || "White",
          blackPlayerName: blackUser?.username || "Black",
          whiteRating: whiteUser?.rating || 1500,
          blackRating: blackUser?.rating || 1500,
          initialFen: new Chess().fen(),
          currentFen: new Chess().fen(),
          turn: "w",
          activeColor: "white",
          whiteTimeMs: initialTime,
          blackTimeMs: initialTime,
          incrementMs,
          lastClockUpdateAt: new Date(),
          startedAt: new Date(),
          clock: {
            initialTime,
            increment: incrementMs,
            whiteRemaining: initialTime,
            blackRemaining: initialTime,
            turn: "w",
            turnStartedAt: new Date(),
          },
        });

        invitation.gameId = newGame._id;
        await invitation.save();

        await startGameClock(newGame._id.toString());

        emitToUser(whitePlayerId, "challenge:accepted", {
          gameId: newGame._id.toString(),
          roomId: roomCode,
          color: "white",
          opponent: {
            id: blackPlayerId,
            username: blackUser?.username || "Black",
            rating: blackUser?.rating || 1500,
          },
          timeControl: invitation.timeControl,
        });

        emitToUser(blackPlayerId, "challenge:accepted", {
          gameId: newGame._id.toString(),
          roomId: roomCode,
          color: "black",
          opponent: {
            id: whitePlayerId,
            username: whiteUser?.username || "White",
            rating: whiteUser?.rating || 1500,
          },
          timeControl: invitation.timeControl,
        });
      } catch (err) {
        console.error("challenge:accept error:", err);
        socket.emit("challenge:error", { message: "Could not accept challenge." });
      }
    });

    // Step 66.4: Decline Challenge
    socket.on("challenge:decline", async ({ invitationId }: { invitationId: string }) => {
      try {
        const userId = socket.data.userId;
        if (!userId) return;

        const invitation = await GameInvitation.findOne({
          _id: invitationId,
          receiverId: userId,
          status: "pending",
        });

        if (invitation) {
          invitation.status = "declined";
          await invitation.save();
          emitToUser(invitation.senderId.toString(), "challenge:declined", {
            invitationId,
          });
        }
      } catch (err) {
        console.error("challenge:decline error:", err);
      }
    });

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
      logger.info("websocket_disconnected", {
        socketId: socket.id,
        userId: socket.data.userId,
      });
      removeSocketFromQueue(socket.id);

      if (socket.data.userId) {
        const becameOffline = setUserOffline(socket.data.userId, socket.id);
        if (becameOffline) {
          io.emit("presence:update", {
            userId: socket.data.userId,
            status: "offline",
            online: false,
          });
        }
      }

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
