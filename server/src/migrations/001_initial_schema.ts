import mongoose from "mongoose";

export const version = 1;
export const name = "001_initial_schema";

export async function up(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) throw new Error("Database connection not ready");

  // Ensure core collections exist
  const collections = await db.listCollections().toArray();
  const existingNames = collections.map((c) => c.name);

  for (const col of ["users", "games", "sessions", "messages", "puzzles"]) {
    if (!existingNames.includes(col)) {
      await db.createCollection(col);
    }
  }
}

export async function down(): Promise<void> {
  // Safe down: preserve user collections
}
