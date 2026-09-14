import { Chess } from "chess.js";

type GamePlayer = {
  socketId: string;
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

export function addPlayer(
  roomId: string,
  socketId: string,
) {
  const game = createGame(roomId);

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

  game.players = game.players.filter(
    (player) => player.socketId !== socketId,
  );

  if (game.players.length === 0) {
    games.delete(roomId);
  }
}

export function makeMove(
  roomId: string,
  socketId: string,
  from: string,
  to: string,
  promotion?: string,
) {
  const game = games.get(roomId);

  if (!game) {
    return {
      success: false,
      error: "Game not found",
    };
  }

  const player = game.players.find(
    (item) => item.socketId === socketId,
  );

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
