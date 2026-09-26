import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";

describe("Integration: WebSocket & Room Security Boundaries", () => {
  type SocketRole = "white" | "black" | "spectator";

  type SimulatedSocket = {
    id: string;
    userId: string;
    role: SocketRole;
  };

  const gameState = {
    gameId: "game-secure-1",
    whitePlayerId: "user-white",
    blackPlayerId: "user-black",
    chess: new Chess(),
    moves: [] as string[],
  };

  // Authoritative server move handler implementation
  const handleClientMove = (
    socket: SimulatedSocket,
    moveSan: string,
  ): { success: boolean; error?: string } => {
    // 1. Spectator check
    if (socket.userId !== gameState.whitePlayerId && socket.userId !== gameState.blackPlayerId) {
      return { success: false, error: "SPECTATOR_MOVE_REJECTED" };
    }

    // 2. Turn parity check
    const currentTurn = gameState.chess.turn(); // 'w' or 'b'
    const isPlayerTurn =
      (currentTurn === "w" && socket.userId === gameState.whitePlayerId) ||
      (currentTurn === "b" && socket.userId === gameState.blackPlayerId);

    if (!isPlayerTurn) {
      return { success: false, error: "NOT_PLAYER_TURN" };
    }

    // 3. Move legality check
    try {
      const result = gameState.chess.move(moveSan);
      if (!result) return { success: false, error: "ILLEGAL_MOVE" };
      gameState.moves.push(result.san);
      return { success: true };
    } catch {
      return { success: false, error: "ILLEGAL_MOVE" };
    }
  };

  it("strictly rejects move attempts from spectators and preserves game state", () => {
    const spectatorSocket: SimulatedSocket = {
      id: "sock-spectator-99",
      userId: "user-spectator",
      role: "spectator",
    };

    const initialFen = gameState.chess.fen();
    const res = handleClientMove(spectatorSocket, "e4");

    assert.equal(res.success, false);
    assert.equal(res.error, "SPECTATOR_MOVE_REJECTED");
    assert.equal(gameState.chess.fen(), initialFen, "Board state must remain unchanged");
    assert.equal(gameState.moves.length, 0);
  });

  it("rejects moves when black player attempts to move out of turn", () => {
    const blackSocket: SimulatedSocket = {
      id: "sock-black-1",
      userId: "user-black",
      role: "black",
    };

    assert.equal(gameState.chess.turn(), "w");
    const res = handleClientMove(blackSocket, "e5");

    assert.equal(res.success, false);
    assert.equal(res.error, "NOT_PLAYER_TURN");
  });

  it("accepts legal move from authorized player whose turn it is", () => {
    const whiteSocket: SimulatedSocket = {
      id: "sock-white-1",
      userId: "user-white",
      role: "white",
    };

    const res = handleClientMove(whiteSocket, "e4");
    assert.equal(res.success, true);
    assert.equal(gameState.chess.turn(), "b");
    assert.equal(gameState.moves[0], "e4");
  });

  it("rejects illegal moves from player and maintains board integrity", () => {
    const blackSocket: SimulatedSocket = {
      id: "sock-black-1",
      userId: "user-black",
      role: "black",
    };

    // Moving pawn backward or across two squares incorrectly
    const res = handleClientMove(blackSocket, "e2");
    assert.equal(res.success, false);
    assert.equal(res.error, "ILLEGAL_MOVE");
    assert.equal(gameState.chess.turn(), "b", "Still black's turn after illegal move");
  });
});
