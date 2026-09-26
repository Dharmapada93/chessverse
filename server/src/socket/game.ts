import { Chess } from "chess.js";
import { Game } from "../models/Game.js";

export type GamePlayer = {
  socketId: string;
  userId: string;
  name: string;
  rating: number;
  color: "white" | "black";
};

type GameState = {
  chess: Chess;
  players: GamePlayer[];
};

const games = new Map<string, GameState>();

export function createGame(roomId: string) {
  if (!games.has(roomId)) {
    games.set(roomId, {
      chess: new Chess(),
      players: [],
    });
  }

  return games.get(roomId)!;
}

export function getGame(roomId: string) {
  return games.get(roomId);
}

export function ensureGame(
  roomId: string,
  fen?: string,
  players?: GamePlayer[],
) {
  let game = games.get(roomId);
  if (!game) {
    try {
      game = {
        chess: fen ? new Chess(fen) : new Chess(),
        players: players || [],
      };
    } catch {
      game = {
        chess: new Chess(),
        players: players || [],
      };
    }
    games.set(roomId, game);
  } else if (fen && game.chess.fen() !== fen) {
    try {
      game.chess = new Chess(fen);
    } catch {}
  }

  if (players && players.length > 0) {
    for (const p of players) {
      const existing = game.players.find(
        (ep) => (ep.userId && ep.userId === p.userId) || ep.color === p.color,
      );
      if (existing) {
        existing.socketId = p.socketId || existing.socketId;
        existing.name = p.name || existing.name;
        existing.rating = p.rating || existing.rating;
        existing.color = p.color || existing.color;
      } else if (game.players.length < 2) {
        game.players.push(p);
      }
    }
  }

  return game;
}

export function addPlayer(
  roomId: string,
  socketId: string,
  user: {
    userId: string;
    name: string;
    rating: number;
  },
) {
  const game = createGame(roomId);

  const existingByUserId = game.players.find(
    (player) => player.userId === user.userId,
  );
  if (existingByUserId) {
    existingByUserId.socketId = socketId;
    existingByUserId.name = user.name;
    existingByUserId.rating = user.rating;
    return game;
  }

  if (
    game.players.some(
      (player) => player.socketId === socketId,
    )
  ) {
    return game;
  }

  if (game.players.length >= 2) {
    return game;
  }

  const color =
    game.players.length === 0 ? "white" : "black";

  game.players.push({
    socketId,
    userId: user.userId,
    name: user.name,
    rating: user.rating,
    color,
  });

  return game;
}

export function removePlayer(
  roomId: string,
  socketId: string,
) {
  const game = games.get(roomId);

  if (!game) {
    return;
  }

  // Do not delete game state on temporary disconnects
  game.players = game.players.filter(
    (player) => player.socketId !== socketId,
  );
}

export function makeMove(
  roomId: string,
  socketId: string,
  from: string,
  to: string,
  promotion?: string,
  userId?: string,
) {
  const game = games.get(roomId);

  if (!game) {
    return {
      success: false,
      error: "Game not found",
    };
  }

  let player = game.players.find(
    (item) => item.socketId === socketId,
  );

  if (!player && userId) {
    player = game.players.find((item) => item.userId === userId);
    if (player) {
      player.socketId = socketId;
    }
  }

  if (!player) {
    return {
      success: false,
      error: "You are not a player",
    };
  }

  const expectedColor =
    game.chess.turn() === "w"
      ? "white"
      : "black";

  if (player.color !== expectedColor) {
    return {
      success: false,
      error: "It is not your turn",
    };
  }

  try {
    const move = game.chess.move({
      from,
      to,
      promotion: promotion ?? "q",
    });

    const nextColor =
      game.chess.turn() === "w"
        ? "white"
        : "black";

    return {
      success: true,
      move,
      fen: game.chess.fen(),
      turn: nextColor,
      isCheck: game.chess.inCheck(),
      isCheckmate: game.chess.isCheckmate(),
      isDraw: game.chess.isDraw(),
      movedColor: player.color,
    };
  } catch {
    return {
      success: false,
      error: "Illegal move",
    };
  }
}

export async function persistGame(
  roomId: string,
  chess: Chess,
  move: {
    from: string;
    to: string;
    promotion?: string;
    san: string;
  },
) {
  const game =
    await Game.findOne({
      roomId,
      status: {
        $in: [
          "waiting",
          "playing",
        ],
      },
    });

  if (!game) {
    return;
  }

  game.currentFen =
    chess.fen();

  game.moves.push({
    from: move.from,
    to: move.to,
    promotion: move.promotion,
    san: move.san,
    fen: chess.fen(),
    createdAt: new Date(),
  });

  await game.save();
}
