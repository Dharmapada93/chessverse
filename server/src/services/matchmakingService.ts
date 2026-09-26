import mongoose from "mongoose";
import { Chess } from "chess.js";
import { User } from "../models/User.js";
import { Game } from "../models/Game.js";
import { startGameClock } from "../socket/clock.js";
import { emitToUser } from "../socket/socket.js";

export const MAX_ACTIVE_GAMES = 5;
export const MAX_PENDING_INVITES = 20;

export interface QueueEntry {
  userId: string;
  socketId: string;
  username: string;
  rating: number;
  category: "bullet" | "blitz" | "rapid" | "classical";
  initialTime: number; // ms
  increment: number;   // seconds
  joinedAt: number;    // timestamp ms
  lastHeartbeat: number; // timestamp ms
}

// In-memory queue storage with Redis-compatible key semantics
const queue: QueueEntry[] = [];
// Keys: `matchmaking:${userId}:${category}` -> socketId
const queueKeys = new Map<string, { userId: string; category: string; lastHeartbeat: number }>();

// Distributed Match Lock emulation to prevent double-matching
const matchLocks = new Set<string>();

let scanInterval: NodeJS.Timeout | null = null;

function getRatingRange(waitingTimeMs: number): number {
  const seconds = waitingTimeMs / 1000;
  if (seconds < 5) return 100;
  if (seconds < 10) return 150;
  if (seconds < 20) return 200;
  return 300;
}

function getQueueKey(userId: string, category: string): string {
  return `matchmaking:${userId}:${category}`;
}

export function isPlayerQueued(userId: string, category?: string): boolean {
  if (category) {
    return queueKeys.has(getQueueKey(userId, category));
  }
  return queue.some((q) => q.userId === userId);
}

export function refreshHeartbeat(userId: string): boolean {
  const now = Date.now();
  let found = false;
  for (const entry of queue) {
    if (entry.userId === userId) {
      entry.lastHeartbeat = now;
      found = true;
      const key = getQueueKey(entry.userId, entry.category);
      const existing = queueKeys.get(key);
      if (existing) {
        existing.lastHeartbeat = now;
      }
    }
  }
  return found;
}

export function acquireMatchLock(userId1: string, userId2: string): boolean {
  const lockKey1 = `match_lock:${userId1}`;
  const lockKey2 = `match_lock:${userId2}`;

  if (matchLocks.has(lockKey1) || matchLocks.has(lockKey2)) {
    return false;
  }

  matchLocks.add(lockKey1);
  matchLocks.add(lockKey2);
  return true;
}

export function releaseMatchLock(userId1: string, userId2: string): void {
  matchLocks.delete(`match_lock:${userId1}`);
  matchLocks.delete(`match_lock:${userId2}`);
}

export async function addToQueue(entry: QueueEntry): Promise<{ success: boolean; message?: string }> {
  // 1. Check duplicate queue entry
  const key = getQueueKey(entry.userId, entry.category);
  if (queueKeys.has(key)) {
    return {
      success: false,
      message: "Already searching for a game in this category.",
    };
  }

  // 2. Anti-game-spam: Check active playing games limit
  if (mongoose.connection.readyState === 1) {
    try {
      const activeGamesCount = await Game.countDocuments({
        status: "playing",
        $or: [{ whitePlayerId: entry.userId }, { blackPlayerId: entry.userId }],
      });

      if (activeGamesCount >= MAX_ACTIVE_GAMES) {
        return {
          success: false,
          message: `Active game limit reached (max ${MAX_ACTIVE_GAMES}). Please finish ongoing games.`,
        };
      }
    } catch {
      // If DB check fails, continue
    }
  }

  // Clean up any stale entries across other categories for this user
  removeFromQueue(entry.userId);

  entry.lastHeartbeat = Date.now();

  // Try immediate match with lock reservation
  const match = findMatchFor(entry);
  if (match) {
    if (acquireMatchLock(entry.userId, match.userId)) {
      // Remove candidate from queue & keys
      removeFromQueue(match.userId);
      createAndStartMatch(entry, match)
        .finally(() => releaseMatchLock(entry.userId, match.userId));
      return { success: true };
    }
  }

  // Add to queue and register key
  queue.push(entry);
  queueKeys.set(key, { userId: entry.userId, category: entry.category, lastHeartbeat: entry.lastHeartbeat });

  if (!scanInterval) {
    scanInterval = setInterval(scanQueue, 2000);
  }

  return { success: true };
}

export function removeFromQueue(userId: string): boolean {
  let removed = false;
  for (let i = queue.length - 1; i >= 0; i--) {
    if (queue[i].userId === userId) {
      const entry = queue[i];
      queueKeys.delete(getQueueKey(entry.userId, entry.category));
      queue.splice(i, 1);
      removed = true;
    }
  }

  if (queue.length === 0 && scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
  return removed;
}

export function removeSocketFromQueue(socketId: string): boolean {
  let removed = false;
  for (let i = queue.length - 1; i >= 0; i--) {
    if (queue[i].socketId === socketId) {
      const entry = queue[i];
      queueKeys.delete(getQueueKey(entry.userId, entry.category));
      queue.splice(i, 1);
      removed = true;
    }
  }

  if (queue.length === 0 && scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
  return removed;
}

function findMatchFor(player: QueueEntry): QueueEntry | null {
  const now = Date.now();
  const playerRange = getRatingRange(now - player.joinedAt);

  for (let i = 0; i < queue.length; i++) {
    const candidate = queue[i];
    if (candidate.userId === player.userId) continue;
    if (candidate.category !== player.category) continue;
    if (candidate.initialTime !== player.initialTime) continue;

    // Check lock reservation
    if (matchLocks.has(`match_lock:${candidate.userId}`)) continue;

    const candidateRange = getRatingRange(now - candidate.joinedAt);
    const maxRange = Math.max(playerRange, candidateRange);
    const diff = Math.abs(player.rating - candidate.rating);

    if (diff <= maxRange) {
      return candidate;
    }
  }

  return null;
}

async function scanQueue(): Promise<void> {
  const now = Date.now();

  // 1. Evict expired heartbeats (>15 seconds without heartbeat)
  for (let i = queue.length - 1; i >= 0; i--) {
    const entry = queue[i];
    if (now - entry.lastHeartbeat > 15000) {
      queueKeys.delete(getQueueKey(entry.userId, entry.category));
      queue.splice(i, 1);
    }
  }

  if (queue.length < 2) {
    if (queue.length === 0 && scanInterval) {
      clearInterval(scanInterval);
      scanInterval = null;
    }
    return;
  }

  for (let i = 0; i < queue.length; i++) {
    const player = queue[i];
    if (matchLocks.has(`match_lock:${player.userId}`)) continue;

    const match = findMatchFor(player);
    if (match) {
      if (acquireMatchLock(player.userId, match.userId)) {
        // Remove both from queue
        removeFromQueue(player.userId);
        removeFromQueue(match.userId);

        createAndStartMatch(player, match)
          .finally(() => releaseMatchLock(player.userId, match.userId));
        break;
      }
    }
  }

  if (queue.length === 0 && scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
}

async function createAndStartMatch(player1: QueueEntry, player2: QueueEntry): Promise<void> {
  try {
    // 50/50 color assignment
    const isP1White = Math.random() >= 0.5;
    const whitePlayer = isP1White ? player1 : player2;
    const blackPlayer = isP1White ? player2 : player1;

    const roomCode = `CV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const initialTimeMs = player1.initialTime;
    const incrementMs = player1.increment * 1000;

    const game = await Game.create({
      roomId: roomCode,
      status: "playing",
      whitePlayerId: whitePlayer.userId,
      blackPlayerId: blackPlayer.userId,
      whitePlayerName: whitePlayer.username,
      blackPlayerName: blackPlayer.username,
      whiteRating: whitePlayer.rating,
      blackRating: blackPlayer.rating,
      initialFen: new Chess().fen(),
      currentFen: new Chess().fen(),
      turn: "w",
      activeColor: "white",
      whiteTimeMs: initialTimeMs,
      blackTimeMs: initialTimeMs,
      incrementMs,
      lastClockUpdateAt: new Date(),
      startedAt: new Date(),
      rated: true,
      ratingProcessed: false,
      clock: {
        initialTime: initialTimeMs,
        increment: incrementMs,
        whiteRemaining: initialTimeMs,
        blackRemaining: initialTimeMs,
        turn: "w",
        turnStartedAt: new Date(),
      },
    });

    // Start clock in memory
    startGameClock(game._id.toString());

    // Notify White player
    emitToUser(whitePlayer.userId, "matchmaking:matched", {
      gameId: game._id.toString(),
      roomId: roomCode,
      color: "white",
      opponent: {
        userId: blackPlayer.userId,
        username: blackPlayer.username,
        rating: blackPlayer.rating,
      },
      timeControl: {
        category: player1.category,
        initialTime: player1.initialTime / 1000,
        increment: player1.increment,
      },
    });

    // Notify Black player
    emitToUser(blackPlayer.userId, "matchmaking:matched", {
      gameId: game._id.toString(),
      roomId: roomCode,
      color: "black",
      opponent: {
        userId: whitePlayer.userId,
        username: whitePlayer.username,
        rating: whitePlayer.rating,
      },
      timeControl: {
        category: player1.category,
        initialTime: player1.initialTime / 1000,
        increment: player1.increment,
      },
    });

    console.log(`[Matchmaking] Match found: ${whitePlayer.username} vs ${blackPlayer.username} (${roomCode})`);
  } catch (error) {
    console.error("[Matchmaking] Error creating match:", error);
    // Return players to queue if game creation failed
    addToQueue(player1);
    addToQueue(player2);
  }
}
