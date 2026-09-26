import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  addToQueue,
  removeFromQueue,
  isPlayerQueued,
  acquireMatchLock,
  releaseMatchLock,
  type QueueEntry,
} from "../../../server/src/services/matchmakingService.js";

describe("Matchmaking Queue & Concurrency Controls", () => {
  beforeEach(() => {
    removeFromQueue("player-1");
    removeFromQueue("player-2");
    removeFromQueue("player-3");
    releaseMatchLock("player-1", "player-2");
  });

  it("adds a player to the queue successfully", async () => {
    const entry: QueueEntry = {
      userId: "player-1",
      socketId: "socket-1",
      username: "Alice",
      rating: 1500,
      category: "rapid",
      initialTime: 600000,
      increment: 0,
      joinedAt: Date.now(),
      lastHeartbeat: Date.now(),
    };

    const result = await addToQueue(entry);
    assert.equal(result.success, true);
    assert.equal(isPlayerQueued("player-1"), true);
  });

  it("prevents duplicate queue entries for the same active player", async () => {
    const entry: QueueEntry = {
      userId: "player-1",
      socketId: "socket-1",
      username: "Alice",
      rating: 1500,
      category: "rapid",
      initialTime: 600000,
      increment: 0,
      joinedAt: Date.now(),
      lastHeartbeat: Date.now(),
    };

    const first = await addToQueue(entry);
    assert.equal(first.success, true);

    const duplicate = await addToQueue(entry);
    assert.equal(duplicate.success, false);
    assert.match(duplicate.message || "", /already searching/i);
  });

  it("removes players from queue cleanly", async () => {
    const entry: QueueEntry = {
      userId: "player-1",
      socketId: "socket-1",
      username: "Alice",
      rating: 1500,
      category: "blitz",
      initialTime: 180000,
      increment: 2,
      joinedAt: Date.now(),
      lastHeartbeat: Date.now(),
    };

    await addToQueue(entry);
    assert.equal(isPlayerQueued("player-1"), true);

    const removed = removeFromQueue("player-1");
    assert.equal(removed, true);
    assert.equal(isPlayerQueued("player-1"), false);
  });

  it("enforces distributed match locking to prevent double matching", () => {
    const p1 = "player-1";
    const p2 = "player-2";
    const p3 = "player-3";

    // Lock player-1 and player-2
    const lock1 = acquireMatchLock(p1, p2);
    assert.equal(lock1, true);

    // Attempting to match player-1 with player-3 simultaneously must fail
    const lock2 = acquireMatchLock(p1, p3);
    assert.equal(lock2, false, "Must not allow concurrent match creation on locked player");

    // Release and verify subsequent acquisition
    releaseMatchLock(p1, p2);
    const lock3 = acquireMatchLock(p1, p3);
    assert.equal(lock3, true);
    releaseMatchLock(p1, p3);
  });
});
