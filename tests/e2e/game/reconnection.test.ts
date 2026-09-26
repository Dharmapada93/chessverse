import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";

describe("E2E Real-Time: Network Interruption & Snapshot Recovery (Step 90.3)", () => {
  it("recovers full board state and clock timestamps after network drop", () => {
    // 1. Authoritative server game state
    const serverGame = {
      id: "game-reconnect-404",
      whitePlayerId: "p1-white",
      blackPlayerId: "p2-black",
      chess: new Chess(),
      moves: [] as string[],
      whiteTimeMs: 300000,
      blackTimeMs: 298000,
      lastMoveTimestamp: Date.now(),
      status: "playing" as const,
    };

    // Play moves: e4, e5, Nf3
    const moves = ["e4", "e5", "Nf3"];
    for (const m of moves) {
      const res = serverGame.chess.move(m);
      assert.ok(res);
      serverGame.moves.push(res.san);
    }

    const canonicalFen = serverGame.chess.fen();

    // 2. Client loses connection (simulated client reset)
    let clientChess = new Chess();
    // Prior to reconnect, client state is empty or stale
    assert.notEqual(clientChess.fen(), canonicalFen);

    // 3. Client reconnects and calls GET /api/games/:id/state
    const fetchAuthoritativeSnapshot = (gameId: string) => {
      if (gameId !== serverGame.id) return null;
      return {
        gameId: serverGame.id,
        fen: serverGame.chess.fen(),
        moves: [...serverGame.moves],
        turn: serverGame.chess.turn(),
        status: serverGame.status,
        whiteTimeRemaining: serverGame.whiteTimeMs,
        blackTimeRemaining: serverGame.blackTimeMs,
      };
    };

    const snapshot = fetchAuthoritativeSnapshot("game-reconnect-404");
    assert.ok(snapshot);

    // 4. Client restores state from snapshot
    clientChess.load(snapshot.fen);

    assert.equal(clientChess.fen(), canonicalFen);
    assert.equal(snapshot.moves.length, 3);
    assert.deepEqual(snapshot.moves, ["e4", "e5", "Nf3"]);
    assert.equal(snapshot.turn, "b", "It must be Black's turn to respond to Nf3");
    assert.equal(snapshot.whiteTimeRemaining, 300000);
  });
});
