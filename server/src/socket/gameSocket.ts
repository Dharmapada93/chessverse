import type { Server, Socket } from "socket.io";
import mongoose from "mongoose";
import { Chess } from "chess.js";
import { Game, type IGame } from "../models/Game.js";
import { validateMove, type PlayerColor } from "../services/chessEngine.js";
import { getCurrentClock } from "../services/gameClock.js";
import { finishGame } from "../services/gameResult.js";

type MovePayload = {
  gameId: string;
  from: string;
  to: string;
  promotion?: string;
};

export async function getGame(gameId: string): Promise<IGame | null> {
  if (!gameId) return null;

  if (mongoose.Types.ObjectId.isValid(gameId)) {
    const game = await Game.findById(gameId);
    if (game) return game;
  }

  return Game.findOne({
    roomId: gameId,
    status: { $in: ["playing", "waiting", "finished"] },
  }).sort({ createdAt: -1 });
}

export function serializeGame(game: IGame) {
  const currentFen =
    game.fen ||
    game.currentFen ||
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  let derivedTurn: "w" | "b" = "w";
  try {
    derivedTurn = (game.turn || new Chess(currentFen).turn()) as "w" | "b";
  } catch {
    derivedTurn = "w";
  }

  const lastMoveItem =
    game.moves && game.moves.length > 0
      ? game.moves[game.moves.length - 1]
      : null;

  const initialTime =
    game.clock?.initialTime ?? game.whiteTimeMs ?? 10 * 60 * 1000;
  const increment = game.clock?.increment ?? game.incrementMs ?? 0;
  const whiteRemaining =
    game.clock?.whiteRemaining ?? game.whiteTimeMs ?? initialTime;
  const blackRemaining =
    game.clock?.blackRemaining ?? game.blackTimeMs ?? initialTime;
  const turnStartedAt = game.clock?.turnStartedAt
    ? new Date(game.clock.turnStartedAt).getTime()
    : game.lastClockUpdateAt
      ? new Date(game.lastClockUpdateAt).getTime()
      : Date.now();

  return {
    gameId: game._id.toString(),
    roomId: game.roomId,
    fen: currentFen,
    turn: derivedTurn,
    status: game.status,
    result: game.result,
    resultReason: game.resultReason,
    sequence: game.moves?.length ?? 0,
    lastMove: lastMoveItem
      ? {
          from: lastMoveItem.from,
          to: lastMoveItem.to,
          san: lastMoveItem.san,
        }
      : null,
    whitePlayer: {
      id: game.whitePlayerId?.toString(),
      name: game.whitePlayerName || "White",
      rating: game.whiteRating || 1500,
    },
    blackPlayer: {
      id: game.blackPlayerId?.toString(),
      name: game.blackPlayerName || "Black",
      rating: game.blackRating || 1500,
    },
    moves: (game.moves || []).map((m: any) => ({
      from: m.from,
      to: m.to,
      san: m.san,
      color: m.color,
      timestamp: m.timestamp || m.createdAt,
    })),
    clock: {
      whiteRemaining,
      blackRemaining,
      turn: derivedTurn,
      activeColor: derivedTurn,
      turnStartedAt,
      serverTime: Date.now(),
      initialTime,
      increment,
    },
  };
}

let timeoutInterval: NodeJS.Timeout | null = null;

export function startGameTimeoutChecker(io: Server) {
  if (timeoutInterval) return;

  timeoutInterval = setInterval(async () => {
    try {
      const activeGames = await Game.find({ status: "playing" });

      for (const game of activeGames) {
        const turnStartedAt = game.clock?.turnStartedAt
          ? new Date(game.clock.turnStartedAt).getTime()
          : game.lastClockUpdateAt
            ? new Date(game.lastClockUpdateAt).getTime()
            : null;

        if (!turnStartedAt) continue;

        const currentFen =
          game.fen || game.currentFen || new Chess().fen();
        let turn: "w" | "b" = "w";
        try {
          turn = (game.turn || new Chess(currentFen).turn()) as "w" | "b";
        } catch {}

        const clock = getCurrentClock({
          whiteRemaining:
            game.clock?.whiteRemaining ?? game.whiteTimeMs ?? 600000,
          blackRemaining:
            game.clock?.blackRemaining ?? game.blackTimeMs ?? 600000,
          turn,
          turnStartedAt,
        });

        const remaining =
          turn === "w" ? clock.whiteRemaining : clock.blackRemaining;

        if (remaining <= 0) {
          game.status = "finished";
          game.result = turn === "w" ? "0-1" : "1-0";
          game.resultReason = "timeout";

          if (game.clock) {
            if (turn === "w") game.clock.whiteRemaining = 0;
            else game.clock.blackRemaining = 0;
          }

          await game.save();

          const serialized = serializeGame(game);
          io.to(`game:${game._id}`).emit("game:timeout", {
            result: game.result,
          });
          io.to(`game:${game._id}`).emit("game:finished", {
            result: game.result,
            reason: "timeout",
          });
          io.to(`game:${game._id}`).emit("game:state", serialized);

          if (game.roomId) {
            io.to(game.roomId).emit("game:finished", {
              result: game.result,
              reason: "timeout",
            });
            io.to(game.roomId).emit("game:state", serialized);
          }
        }
      }
    } catch {
      // Ignore background timeout check errors
    }
  }, 500);
}

export function broadcastSpectatorCount(
  io: Server,
  gameId: string,
  whitePlayerId?: string,
  blackPlayerId?: string,
) {
  const room = io.sockets.adapter.rooms.get(`game:${gameId}`);
  if (!room) return;

  let count = 0;
  for (const sId of room) {
    const s = io.sockets.sockets.get(sId);
    if (!s) continue;
    const uId = s.data.userId;
    const isPlayer =
      uId &&
      ((whitePlayerId && uId === whitePlayerId) ||
        (blackPlayerId && uId === blackPlayerId));

    if (s.data.role === "spectator" || !isPlayer) {
      count++;
    }
  }

  io.to(`game:${gameId}`).emit("game:viewers", { count });
}

// Rate limit and Disconnect Manager
const moveRateLimits = new Map<string, number>();
const drawOfferRateLimits = new Map<string, number>();

export function registerGameSocket(io: Server, socket: Socket) {
  startGameTimeoutChecker(io);

  socket.on(
    "game:join",
    async ({
      gameId,
      role,
    }: {
      gameId: string;
      role?: "player" | "spectator";
    }) => {
      try {
        const game = await getGame(gameId);

        if (!game) {
          socket.emit("game:error", {
            message: "Game not found.",
          });
          return;
        }

        socket.join(`game:${game._id}`);
        if (game.roomId) {
          socket.join(game.roomId);
        }

        socket.data.gameId = game._id.toString();

        const userId = socket.data.userId;
        const isWhite =
          game.whitePlayerId && game.whitePlayerId.toString() === userId;
        const isBlack =
          game.blackPlayerId && game.blackPlayerId.toString() === userId;

        if (role === "spectator" || (!isWhite && !isBlack && game.status === "playing")) {
          socket.data.role = "spectator";
          socket.data.color = null;
        } else {
          socket.data.role = "player";
          socket.data.color = isWhite ? "w" : isBlack ? "b" : null;
        }

        socket.emit("game:state", serializeGame(game));
        socket.emit("game:joined", {
          gameId: game._id.toString(),
          role: socket.data.role,
          color: socket.data.color,
        });

        if (socket.data.role === "spectator") {
          io.to(`game:${game._id}`).emit("game:spectator-joined", {
            spectatorId: userId,
            timestamp: Date.now(),
          });
        }

        broadcastSpectatorCount(
          io,
          game._id.toString(),
          game.whitePlayerId?.toString(),
          game.blackPlayerId?.toString(),
        );
      } catch (error) {
        console.error("game:join error:", error);
        socket.emit("game:error", {
          message: "Unable to join game.",
        });
      }
    },
  );

// Disconnect Manager
type DisconnectTimer = {
  gameId: string;
  userId: string;
  color: "white" | "black";
  timeoutId: NodeJS.Timeout;
  startedAt: number;
};
const disconnectTimers = new Map<string, DisconnectTimer>();

  socket.on("disconnect", async () => {
    if (socket.data.gameId) {
      if (socket.data.role === "spectator") {
        io.to(`game:${socket.data.gameId}`).emit("game:spectator-left", {
          spectatorId: socket.data.userId,
          timestamp: Date.now(),
        });
      }

      broadcastSpectatorCount(io, socket.data.gameId);

      const userId = socket.data.userId;
      const gameId = socket.data.gameId;
      if (userId && socket.data.role === "player") {
        try {
          const game = await getGame(gameId);
          if (game && game.status === "playing") {
            const isWhite = game.whitePlayerId && game.whitePlayerId.toString() === userId;
            const playerColor = isWhite ? "white" : "black";
            const timerKey = `${gameId}:${userId}`;

            if (disconnectTimers.has(timerKey)) {
              clearTimeout(disconnectTimers.get(timerKey)!.timeoutId);
            }

            // Emit disconnect alert to room with 30s grace window
            io.to(`game:${game._id}`).emit("player:disconnected", {
              userId,
              color: playerColor,
              gracePeriodSeconds: 30,
            });

            const timeoutId = setTimeout(async () => {
              disconnectTimers.delete(timerKey);
              try {
                const refreshedGame = await getGame(gameId);
                if (refreshedGame && refreshedGame.status === "playing") {
                  const winnerColor = playerColor === "white" ? "black" : "white";
                  await finishGame(gameId, winnerColor, "timeout");
                  io.to(`game:${gameId}`).emit("game:finished", {
                    result: winnerColor,
                    reason: "timeout",
                    message: `${playerColor === "white" ? "White" : "Black"} disconnected and did not return.`,
                  });
                  io.to(`game:${gameId}`).emit("game:ended", {
                    result: winnerColor,
                    reason: "timeout",
                  });
                }
              } catch (err) {
                console.error("[GracePeriod] Error forfeiting game:", err);
              }
            }, 30000);

            disconnectTimers.set(timerKey, {
              gameId,
              userId,
              color: playerColor,
              timeoutId,
              startedAt: Date.now(),
            });
          }
        } catch {}
      }
    }
  });

  socket.on("game:rejoin", async ({ gameId }: { gameId: string }) => {
    try {
      const game = await getGame(gameId);

      if (!game) {
        socket.emit("game:error", {
          message: "Game no longer exists.",
        });
        return;
      }

      socket.join(`game:${game._id}`);
      if (game.roomId) {
        socket.join(game.roomId);
      }

      socket.data.gameId = game._id.toString();

      const userId = socket.data.userId;
      const isWhite =
        game.whitePlayerId && game.whitePlayerId.toString() === userId;
      const isBlack =
        game.blackPlayerId && game.blackPlayerId.toString() === userId;

      if (socket.data.role !== "spectator") {
        if (isWhite) {
          socket.data.role = "player";
          socket.data.color = "w";
        } else if (isBlack) {
          socket.data.role = "player";
          socket.data.color = "b";
        }
      }

      // Check if this player was in disconnect grace period and cancel timer
      if (userId) {
        const timerKey = `${game._id}:${userId}`;
        if (disconnectTimers.has(timerKey)) {
          clearTimeout(disconnectTimers.get(timerKey)!.timeoutId);
          disconnectTimers.delete(timerKey);
          io.to(`game:${game._id}`).emit("player:reconnected", {
            userId,
            color: isWhite ? "white" : "black",
          });
        }
      }

      socket.emit("game:state", serializeGame(game));
    } catch (error) {
      console.error("game:rejoin error:", error);
      socket.emit("game:error", {
        message: "Unable to rejoin game.",
      });
    }
  });

  socket.on("game:sync", async ({ gameId }: { gameId: string }) => {
    try {
      const game = await getGame(gameId);
      if (game) {
        socket.emit("game:state", serializeGame(game));
      }
    } catch {}
  });

  // R3.27: Authoritative Draw Flow
  const handleDrawOffer = async ({ gameId, roomId: rawRoomId }: { gameId?: string; roomId?: string }) => {
    if (socket.data.role === "spectator") {
      socket.emit("game:error", { message: "Spectators cannot offer draws." });
      return;
    }
    const lastOffer = drawOfferRateLimits.get(socket.id) || 0;
    if (Date.now() - lastOffer < 10000) {
      socket.emit("game:error", { message: "Please wait before offering another draw." });
      return;
    }
    drawOfferRateLimits.set(socket.id, Date.now());

    const game = await getGame(gameId || rawRoomId || "");
    if (!game || game.status !== "playing") return;
    const userId = socket.data.userId;
    if (game.whitePlayerId !== userId && game.blackPlayerId !== userId) return;

    const payload = {
      gameId: game._id.toString(),
      userId,
      color: game.whitePlayerId === userId ? "white" : "black",
    };
    socket.to(`game:${game._id}`).emit("game:draw-offered", payload);
    socket.to(`game:${game._id}`).emit("game:drawOffer", payload);
    if (game.roomId) {
      socket.to(game.roomId).emit("game:draw-offered", payload);
      socket.to(game.roomId).emit("game:drawOffer", payload);
    }
  };
  socket.on("game:draw-offer", handleDrawOffer);
  socket.on("game:drawOffer", handleDrawOffer);

  const handleDrawAccept = async ({ gameId, roomId: rawRoomId }: { gameId?: string; roomId?: string }) => {
    if (socket.data.role === "spectator") {
      socket.emit("game:error", { message: "Spectators cannot accept draws." });
      return;
    }
    const game = await getGame(gameId || rawRoomId || "");
    if (!game || game.status !== "playing") return;
    const userId = socket.data.userId;
    if (game.whitePlayerId !== userId && game.blackPlayerId !== userId) return;

    await finishGame(game._id.toString(), "draw", "draw");
    const payload = { result: "1/2-1/2", reason: "draw_agreement" };
    io.to(`game:${game._id}`).emit("game:draw-accepted", payload);
    io.to(`game:${game._id}`).emit("game:finished", payload);
    io.to(`game:${game._id}`).emit("game:ended", payload);
    if (game.roomId) {
      io.to(game.roomId).emit("game:draw-accepted", payload);
      io.to(game.roomId).emit("game:finished", payload);
      io.to(game.roomId).emit("game:ended", payload);
    }
  };
  socket.on("game:draw-accept", handleDrawAccept);
  socket.on("game:drawAccept", handleDrawAccept);

  const handleDrawDecline = async ({ gameId, roomId: rawRoomId }: { gameId?: string; roomId?: string }) => {
    const game = await getGame(gameId || rawRoomId || "");
    if (!game) return;
    const userId = socket.data.userId;
    const payload = { gameId: game._id.toString(), userId };
    socket.to(`game:${game._id}`).emit("game:draw-declined", payload);
    if (game.roomId) socket.to(game.roomId).emit("game:draw-declined", payload);
  };
  socket.on("game:draw-decline", handleDrawDecline);
  socket.on("game:drawDecline", handleDrawDecline);

  // R3.28: Authoritative Resign Flow
  const handleResign = async ({ gameId, roomId: rawRoomId }: { gameId?: string; roomId?: string }) => {
    if (socket.data.role === "spectator") {
      socket.emit("game:error", { message: "Spectators cannot resign games." });
      return;
    }
    const game = await getGame(gameId || rawRoomId || "");
    if (!game || game.status !== "playing") return;
    const userId = socket.data.userId;
    const isWhite = game.whitePlayerId && game.whitePlayerId.toString() === userId;
    const isBlack = game.blackPlayerId && game.blackPlayerId.toString() === userId;
    if (!isWhite && !isBlack) return;

    const winnerColor = isWhite ? "black" : "white";
    await finishGame(game._id.toString(), winnerColor, "resignation");
    const payload = {
      result: winnerColor === "white" ? "1-0" : "0-1",
      reason: "resignation",
      resignedColor: isWhite ? "white" : "black",
    };
    io.to(`game:${game._id}`).emit("game:resigned", payload);
    io.to(`game:${game._id}`).emit("game:finished", payload);
    io.to(`game:${game._id}`).emit("game:ended", payload);
    if (game.roomId) {
      io.to(game.roomId).emit("game:resigned", payload);
      io.to(game.roomId).emit("game:finished", payload);
      io.to(game.roomId).emit("game:ended", payload);
    }
  };
  socket.on("game:resign", handleResign);

  // R3.29: Authoritative 2-Player Mutual Rematch Flow
  const handleRematch = async ({ gameId, roomId: rawRoomId }: { gameId?: string; roomId?: string }) => {
    if (socket.data.role === "spectator") {
      socket.emit("game:error", { message: "Spectators cannot request rematches." });
      return;
    }
    const game = await getGame(gameId || rawRoomId || "");
    if (!game) return;
    const userId = socket.data.userId;
    const isWhite = game.whitePlayerId && game.whitePlayerId.toString() === userId;
    const isBlack = game.blackPlayerId && game.blackPlayerId.toString() === userId;
    if (!isWhite && !isBlack) return;

    if (!Array.isArray(game.rematchRequestedBy)) {
      game.rematchRequestedBy = [];
    }

    const alreadyRequested = game.rematchRequestedBy.some((id) => id?.toString() === userId);
    if (!alreadyRequested && userId) {
      game.rematchRequestedBy.push(userId);
      await game.save();
    }

    const opponentId = isWhite ? game.blackPlayerId : game.whitePlayerId;
    const opponentAgreed = game.rematchRequestedBy.some((id) => id?.toString() === opponentId?.toString());

    if (opponentAgreed) {
      // Both players agreed! Create new game with reversed colors and reset clocks
      const newGame = await Game.create({
        roomId: game.roomId || `rematch-${Date.now()}`,
        status: "playing",
        whitePlayerId: game.blackPlayerId,
        blackPlayerId: game.whitePlayerId,
        whitePlayerName: game.blackPlayerName,
        blackPlayerName: game.whitePlayerName,
        whiteRating: game.blackRating,
        blackRating: game.whiteRating,
        initialFen: new Chess().fen(),
        currentFen: new Chess().fen(),
        fen: new Chess().fen(),
        turn: "w",
        whiteTimeMs: game.clock?.initialTime ?? game.whiteTimeMs ?? 600000,
        blackTimeMs: game.clock?.initialTime ?? game.blackTimeMs ?? 600000,
        incrementMs: game.clock?.increment ?? game.incrementMs ?? 0,
        clock: {
          initialTime: game.clock?.initialTime ?? game.whiteTimeMs ?? 600000,
          increment: game.clock?.increment ?? game.incrementMs ?? 0,
          whiteRemaining: game.clock?.initialTime ?? game.whiteTimeMs ?? 600000,
          blackRemaining: game.clock?.initialTime ?? game.blackTimeMs ?? 600000,
          turnStartedAt: new Date(),
        },
        moves: [],
        rematchRequestedBy: [],
        rated: game.rated !== false,
      });

      game.rematchGameId = newGame._id;
      await game.save();

      const acceptedPayload = {
        newGameId: newGame._id.toString(),
        previousGameId: game._id.toString(),
      };

      io.to(`game:${game._id}`).emit("game:rematch-accepted", acceptedPayload);
      io.to(`game:${game._id}`).emit("game:rematch-created", acceptedPayload);
      if (game.roomId) {
        io.to(game.roomId).emit("game:rematch-accepted", acceptedPayload);
        io.to(game.roomId).emit("game:rematch-created", acceptedPayload);
      }
    } else {
      const offeredPayload = {
        gameId: game._id.toString(),
        offeredBy: isWhite ? "white" : "black",
        userId,
      };
      socket.to(`game:${game._id}`).emit("game:rematch-offered", offeredPayload);
      if (game.roomId) {
        socket.to(game.roomId).emit("game:rematch-offered", offeredPayload);
      }
    }
  };
  socket.on("game:rematch", handleRematch);
  socket.on("game:rematch-offer", handleRematch);
  socket.on("game:rematch-accept", handleRematch);

  socket.on("game:move", async (payload: MovePayload) => {
    try {
      await handleMove(io, socket, payload);
    } catch (error) {
      console.error("game:move error:", error);
      socket.emit("game:error", {
        message: "Move could not be processed.",
      });
    }
  });
}

async function handleMove(
  io: Server,
  socket: Socket,
  payload: MovePayload,
) {
  const now = Date.now();
  const lastMove = moveRateLimits.get(socket.id) || 0;
  if (now - lastMove < 80) {
    socket.emit("game:error", { message: "Moves submitted too quickly." });
    return;
  }
  moveRateLimits.set(socket.id, now);

  const { gameId, from, to, promotion } = payload;

  const game = await getGame(gameId);

  if (!game) {
    socket.emit("game:error", {
      message: "Game not found.",
    });
    return;
  }

  if (game.status !== "playing") {
    socket.emit("game:error", {
      message: "Game is not active.",
    });
    return;
  }

  /*
   * Never allow spectators to make moves.
   */
  if (socket.data.role === "spectator") {
    socket.emit("game:error", {
      message: "Spectators cannot make moves.",
    });
    return;
  }

  /*
   * Verify the player is actually participating in this game.
   */
  const userId = socket.data.userId;
  const isWhite =
    game.whitePlayerId && game.whitePlayerId.toString() === userId;
  const isBlack =
    game.blackPlayerId && game.blackPlayerId.toString() === userId;

  if (!isWhite && !isBlack) {
    socket.emit("game:error", {
      message: "You are not a player in this game.",
    });
    return;
  }

  const playerColor: PlayerColor = isWhite ? "w" : "b";
  socket.data.color = playerColor;
  socket.data.role = "player";

  const currentFen =
    game.fen ||
    game.currentFen ||
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  let currentTurn: PlayerColor = "w";
  try {
    currentTurn = (game.turn || new Chess(currentFen).turn()) as PlayerColor;
  } catch {
    currentTurn = "w";
  }

  /*
   * Verify whose turn it is.
   */
  if (currentTurn !== playerColor) {
    socket.emit("game:error", {
      message: "It is not your turn.",
    });
    return;
  }

  /*
   * Server clock calculation before move processing.
   */
  const initialTime =
    game.clock?.initialTime ?? game.whiteTimeMs ?? 10 * 60 * 1000;
  const increment = game.clock?.increment ?? game.incrementMs ?? 0;
  const whiteRemaining =
    game.clock?.whiteRemaining ?? game.whiteTimeMs ?? initialTime;
  const blackRemaining =
    game.clock?.blackRemaining ?? game.blackTimeMs ?? initialTime;
  const turnStartedAt = game.clock?.turnStartedAt
    ? new Date(game.clock.turnStartedAt).getTime()
    : game.lastClockUpdateAt
      ? new Date(game.lastClockUpdateAt).getTime()
      : Date.now();

  const currentClock = getCurrentClock({
    whiteRemaining,
    blackRemaining,
    turn: currentTurn,
    turnStartedAt,
  });

  const remaining =
    playerColor === "w"
      ? currentClock.whiteRemaining
      : currentClock.blackRemaining;

  if (remaining <= 0) {
    game.status = "finished";
    game.result = playerColor === "w" ? "0-1" : "1-0";
    game.resultReason = "timeout";
    await game.save();

    const timeoutState = serializeGame(game);
    io.to(`game:${game._id}`).emit("game:timeout", {
      result: game.result,
    });
    io.to(`game:${game._id}`).emit("game:finished", {
      result: game.result,
      reason: "timeout",
    });
    io.to(`game:${game._id}`).emit("game:state", timeoutState);
    if (game.roomId) {
      io.to(game.roomId).emit("game:finished", {
        result: game.result,
        reason: "timeout",
      });
      io.to(game.roomId).emit("game:state", timeoutState);
    }
    return;
  }

  /*
   * Validate actual chess move with chess.js rule engine.
   */
  const result = validateMove(currentFen, from, to, promotion);

  if (!result.legal || !result.move) {
    socket.emit("game:error", {
      message: "Illegal move.",
    });
    return;
  }

  /*
   * Update clocks with increment and start new turn timer.
   */
  let nextWhiteRemaining = currentClock.whiteRemaining;
  let nextBlackRemaining = currentClock.blackRemaining;

  if (playerColor === "w") {
    nextWhiteRemaining += increment;
  } else {
    nextBlackRemaining += increment;
  }

  game.clock = {
    initialTime,
    increment,
    whiteRemaining: nextWhiteRemaining,
    blackRemaining: nextBlackRemaining,
    turnStartedAt: new Date(),
  };

  game.whiteTimeMs = nextWhiteRemaining;
  game.blackTimeMs = nextBlackRemaining;
  game.lastClockUpdateAt = new Date();

  /*
   * Update game state in database.
   */
  game.fen = result.fen!;
  game.currentFen = result.fen!;
  game.turn = result.turn!;
  game.activeColor = result.turn === "w" ? "white" : "black";

  game.moves.push({
    from,
    to,
    promotion: promotion || undefined,
    san: result.move.san,
    fen: result.fen!,
    color: playerColor,
    timestamp: new Date(),
    createdAt: new Date(),
  });

  if (result.isCheckmate) {
    game.status = "finished";
    game.result = playerColor === "w" ? "1-0" : "0-1";
    game.resultReason = "checkmate";
  } else if (result.isDraw) {
    game.status = "finished";
    game.result = "1/2-1/2";
    game.resultReason = "draw";
  }

  await game.save();

  // Step 88.2: Record game telemetry asynchronously
  try {
    const { recordMoveTelemetry, evaluateGameFairPlay } = await import(
      "../services/fairPlay/fairPlayService.js"
    );
    const timeSpent = Math.max(0, Date.now() - turnStartedAt);
    recordMoveTelemetry({
      gameId: game._id.toString(),
      userId,
      color: playerColor === "w" ? "white" : "black",
      moveNumber: game.moves.length,
      moveSan: result.move.san,
      moveUci: `${from}${to}${promotion || ""}`,
      timeSpentMs: timeSpent,
      timeRemainingMs: playerColor === "w" ? nextWhiteRemaining : nextBlackRemaining,
    }).catch(() => {});

    if (result.isCheckmate || result.isDraw) {
      evaluateGameFairPlay(game._id.toString()).catch(() => {});
    }
  } catch {}

  /*
   * Broadcast authoritative state to all clients (players & spectators).
   */
  const serialized = serializeGame(game);

  // Step 94.9: Lightweight move event for low-latency clients and spectators
  const moveEventPayload = {
    type: "MOVE_ACCEPTED",
    gameId: game._id.toString(),
    move: result.move.san,
    moveNumber: game.moves ? game.moves.length : 1,
    fen: game.fen,
    turn: game.turn,
    clock: {
      whiteRemaining: nextWhiteRemaining,
      blackRemaining: nextBlackRemaining,
    },
  };
  io.to(`game:${game._id}`).emit("game:move", moveEventPayload);
  if (game.roomId) {
    io.to(game.roomId).emit("game:move", moveEventPayload);
  }

  io.to(`game:${game._id}`).emit("game:state", serialized);
  if (game.roomId) {
    io.to(game.roomId).emit("game:state", serialized);
  }

  if (result.isCheckmate || result.isDraw) {
    const finishedPayload = {
      result: game.result,
      reason: game.resultReason,
    };
    io.to(`game:${game._id}`).emit("game:finished", finishedPayload);
    io.to(`game:${game._id}`).emit("game:ended", finishedPayload);
    if (game.roomId) {
      io.to(game.roomId).emit("game:finished", finishedPayload);
      io.to(game.roomId).emit("game:ended", finishedPayload);
    }
  }
}
