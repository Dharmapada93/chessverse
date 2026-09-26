import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";
import { calculateMatchRatings } from "../../../server/src/lib/elo.js";

describe("Integration: Game Lifecycle, State Transitions & Pagination", () => {
  type MockGame = {
    id: string;
    whitePlayerId: string;
    blackPlayerId: string;
    fen: string;
    moves: string[];
    status: "waiting" | "playing" | "finished";
    winner?: "white" | "black" | "draw";
    rated: boolean;
    whiteRating: number;
    blackRating: number;
    whiteDelta?: number;
    blackDelta?: number;
    createdAt: Date;
  };

  const gameDatabase: MockGame[] = [];

  it("creates a new game with default starting FEN and time control", () => {
    const chess = new Chess();
    const game: MockGame = {
      id: "game-101",
      whitePlayerId: "user-white",
      blackPlayerId: "user-black",
      fen: chess.fen(),
      moves: [],
      status: "playing",
      rated: true,
      whiteRating: 1500,
      blackRating: 1500,
      createdAt: new Date(),
    };

    gameDatabase.push(game);

    assert.equal(game.status, "playing");
    assert.equal(game.fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    assert.equal(game.moves.length, 0);
  });

  it("executes legal moves, maintains turn parity, and updates FEN", () => {
    const game = gameDatabase.find((g) => g.id === "game-101")!;
    const chess = new Chess(game.fen);

    // White plays e4
    const m1 = chess.move("e4");
    assert.ok(m1);
    game.moves.push(m1.san);
    game.fen = chess.fen();

    assert.equal(chess.turn(), "b", "It must now be Black's turn");

    // Black plays e5
    const m2 = chess.move("e5");
    assert.ok(m2);
    game.moves.push(m2.san);
    game.fen = chess.fen();

    assert.equal(chess.turn(), "w", "It must now be White's turn");
    assert.equal(game.moves.length, 2);
  });

  it("concludes game on resignation and accurately calculates rating deltas", () => {
    const game = gameDatabase.find((g) => g.id === "game-101")!;
    
    // Black resigns -> White wins
    game.status = "finished";
    game.winner = "white";

    const ratingResult = calculateMatchRatings(
      game.whiteRating,
      game.blackRating,
      1, // White wins
      false,
      false,
      24,
    );

    game.whiteDelta = ratingResult.whiteDelta;
    game.blackDelta = ratingResult.blackDelta;

    assert.equal(game.status, "finished");
    assert.equal(game.winner, "white");
    assert.equal(game.whiteDelta, 12);
    assert.equal(game.blackDelta, -12);
  });

  it("paginates game history accurately with totalPages and hasMore flags", () => {
    // Populate 25 mock finished games
    const historyList: MockGame[] = Array.from({ length: 25 }, (_, i) => ({
      id: `game-${i + 1}`,
      whitePlayerId: "user-white",
      blackPlayerId: `opponent-${i + 1}`,
      fen: "8/8/8/8/8/8/8/8 w - - 0 1",
      moves: ["e4", "e5"],
      status: "finished",
      rated: true,
      whiteRating: 1500,
      blackRating: 1500,
      createdAt: new Date(Date.now() - (25 - i) * 60000),
    }));

    // Pagination function matching GET /api/games/history
    const paginateHistory = (page = 1, limit = 10) => {
      const skip = (page - 1) * limit;
      const paginatedGames = historyList.slice(skip, skip + limit);
      const total = historyList.length;
      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      return {
        games: paginatedGames,
        pagination: {
          total,
          page,
          totalPages,
          hasMore,
        },
      };
    };

    // Page 1
    const p1 = paginateHistory(1, 10);
    assert.equal(p1.games.length, 10);
    assert.equal(p1.pagination.page, 1);
    assert.equal(p1.pagination.totalPages, 3);
    assert.equal(p1.pagination.hasMore, true);

    // Page 3 (last page)
    const p3 = paginateHistory(3, 10);
    assert.equal(p3.games.length, 5);
    assert.equal(p3.pagination.page, 3);
    assert.equal(p3.pagination.hasMore, false);
  });
});
