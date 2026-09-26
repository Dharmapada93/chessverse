import mongoose from "mongoose";

export const version = 3;
export const name = "003_fair_play_and_telemetry";

export async function up(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) throw new Error("Database connection not ready");

  // Create indexes for fair play telemetry and reviews
  const telemetry = db.collection("gametelemetries");
  await telemetry.createIndex({ gameId: 1, userId: 1, moveNumber: 1 }, { background: true });

  const fairPlayReviews = db.collection("fairplayreviews");
  await fairPlayReviews.createIndex({ status: 1, riskScore: -1, createdAt: -1 }, { background: true });
  await fairPlayReviews.createIndex({ userId: 1 }, { background: true });
}

export async function down(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) return;

  try {
    await db.collection("fairplayreviews").dropIndex("status_1_riskScore_-1_createdAt_-1");
  } catch {}
}
