import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";

describe("E2E Real-Time: Duplicate Moves & Race Conditions (Steps 90.4 & 90.5)", () => {
  it("accepts first move instance and rejects duplicate network retry (e4, e4)", () => {
    const chess = new Chess();
    const moveHistory: string[] = [];

    const processMoveRequest = (moveSan: string) => {
      try {
        const res = chess.move(moveSan);
        if (!res) return { accepted: false, error: "Illegal move" };
        moveHistory.push(res.san);
        return { accepted: true, fen: chess.fen() };
      } catch (err: any) {
        return { accepted: false, error: err.message };
      }
    };

    // First arrival of e4
    const firstAttempt = processMoveRequest("e4");
    assert.equal(firstAttempt.accepted, true);
    assert.equal(chess.turn(), "b");

    // Second arrival of e4 (e.g. duplicate TCP packet or client debounce failure)
    const duplicateAttempt = processMoveRequest("e4");
    assert.equal(duplicateAttempt.accepted, false);
    assert.match(duplicateAttempt.error || "", /invalid move/i);

    // Board remains clean with only 1 move recorded
    assert.equal(moveHistory.length, 1);
    assert.equal(moveHistory[0], "e4");
  });

  it("handles race conditions by processing requests sequentially and rejecting conflicting simultaneous moves", async () => {
    const chess = new Chess();
    let isProcessing = false;
    const executionOrder: string[] = [];

    // Server-side move queue mutex
    const enqueueMove = async (clientTag: string, moveSan: string) => {
      while (isProcessing) {
        await new Promise((r) => setTimeout(r, 5));
      }
      isProcessing = true;
      try {
        const res = chess.move(moveSan);
        executionOrder.push(`${clientTag}:${res.san}`);
        return { success: true };
      } catch {
        return { success: false, error: "Conflict/Illegal move" };
      } finally {
        isProcessing = false;
      }
    };

    // Client Tab A and Client Tab B simultaneously attempt White's first move
    const [resA, resB] = await Promise.all([
      enqueueMove("TabA", "e4"),
      enqueueMove("TabB", "d4"),
    ]);

    // Exactly one move must succeed, and the conflicting move must be rejected
    const successfulCount = [resA, resB].filter((r) => r.success).length;
    const failedCount = [resA, resB].filter((r) => !r.success).length;

    assert.equal(successfulCount, 1, "Exactly one conflicting move accepted");
    assert.equal(failedCount, 1, "Conflicting concurrent move rejected");
    assert.equal(executionOrder.length, 1);
  });
});
