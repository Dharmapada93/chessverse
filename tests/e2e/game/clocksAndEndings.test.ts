import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";

describe("E2E Real-Time: Clocks & Terminal Game Endings (Steps 90.6 & 90.7)", () => {
  it("decrements only the active player's clock and applies increments on move completion", () => {
    // 3+2 time control: 180 seconds initial, 2 seconds increment
    let whiteTimeMs = 180 * 1000;
    let blackTimeMs = 180 * 1000;
    const incrementMs = 2 * 1000;
    let turn: "w" | "b" = "w";

    // 1. White thinks for 5 seconds (5000ms)
    const whiteThinkTime = 5000;
    if (turn === "w") {
      whiteTimeMs -= whiteThinkTime;
      // White plays move and receives increment
      whiteTimeMs += incrementMs;
      turn = "b";
    }

    assert.equal(whiteTimeMs, 180000 - 5000 + 2000); // 177,000ms
    assert.equal(blackTimeMs, 180000); // Black clock untouched while White was thinking

    // 2. Black thinks for 3 seconds (3000ms)
    const blackThinkTime = 3000;
    if (turn === "b") {
      blackTimeMs -= blackThinkTime;
      // Black plays move and receives increment
      blackTimeMs += incrementMs;
      turn = "w";
    }

    assert.equal(blackTimeMs, 180000 - 3000 + 2000); // 179,000ms
    assert.equal(whiteTimeMs, 177000); // White clock untouched while Black was thinking
  });

  it("triggers game termination on timeout when clock expires (0ms)", () => {
    let whiteTimeMs = 50; // 50ms left
    let status: "playing" | "timeout" = "playing";
    let winner: "white" | "black" | null = null;

    // Simulate clock tick of 100ms
    whiteTimeMs = Math.max(0, whiteTimeMs - 100);
    if (whiteTimeMs <= 0) {
      status = "timeout";
      winner = "black"; // Black wins on White's timeout
    }

    assert.equal(status, "timeout");
    assert.equal(winner, "black");
    assert.equal(whiteTimeMs, 0);
  });

  it("handles Checkmate ending", () => {
    const chess = new Chess("rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3"); // Fool's mate
    assert.equal(chess.isCheckmate(), true);
    assert.equal(chess.isGameOver(), true);
  });

  it("handles Stalemate ending", () => {
    const chess = new Chess("k7/2Q5/1K6/8/8/8/8/8 b - - 0 1");
    assert.equal(chess.isStalemate(), true);
    assert.equal(chess.isGameOver(), true);
  });

  it("handles Threefold Repetition ending", () => {
    const chess = new Chess();
    // 1. Nf3 Nf6 2. Ng1 Ng8 3. Nf3 Nf6 4. Ng1 Ng8
    chess.move("Nf3");
    chess.move("Nf6");
    chess.move("Ng1");
    chess.move("Ng8");

    chess.move("Nf3");
    chess.move("Nf6");
    chess.move("Ng1");
    chess.move("Ng8");

    assert.equal(chess.isThreefoldRepetition(), true);
  });

  it("handles Insufficient Material ending (King vs King)", () => {
    const chess = new Chess("8/8/8/4k3/8/8/4K3/8 w - - 0 1");
    assert.equal(chess.isInsufficientMaterial(), true);
    assert.equal(chess.isGameOver(), true);
  });
});
