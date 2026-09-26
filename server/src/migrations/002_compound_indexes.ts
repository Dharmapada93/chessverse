import mongoose from "mongoose";

export const version = 2;
export const name = "002_compound_indexes";

export async function up(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) throw new Error("Database connection not ready");

  // Create compound indexes for high-frequency game history and active session lookups
  const games = db.collection("games");
  await games.createIndex({ whitePlayerId: 1, createdAt: -1 }, { background: true });
  await games.createIndex({ blackPlayerId: 1, createdAt: -1 }, { background: true });
  await games.createIndex({ status: 1, createdAt: -1 }, { background: true });

  const sessions = db.collection("sessions");
  await sessions.createIndex({ sessionId: 1 }, { unique: true, background: true });
  await sessions.createIndex({ userId: 1, revokedAt: 1 }, { background: true });
  await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true });
}

export async function down(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) return;

  try {
    await db.collection("games").dropIndex("whitePlayerId_1_createdAt_-1");
    await db.collection("games").dropIndex("blackPlayerId_1_createdAt_-1");
    await db.collection("games").dropIndex("status_1_createdAt_-1");
  } catch {}
}
