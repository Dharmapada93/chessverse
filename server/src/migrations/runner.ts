import mongoose from "mongoose";
import * as m1 from "./001_initial_schema.js";
import * as m2 from "./002_compound_indexes.js";
import * as m3 from "./003_fair_play_and_telemetry.js";

const migrations = [m1, m2, m3];

const MigrationSchema = new mongoose.Schema({
  version: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  appliedAt: { type: Date, default: Date.now },
});

const MigrationModel = mongoose.models.MigrationHistory || mongoose.model("MigrationHistory", MigrationSchema);

export async function runMigrations(): Promise<void> {
  const mongoUri = process.env.DATABASE_URL || "mongodb://localhost:27017/chessverse";

  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(mongoUri);
      console.log("[Migration] Connected to MongoDB.");
    } catch (err: any) {
      console.warn("[Migration] MongoDB connection skipped or failed:", err.message);
      return;
    }
  }

  try {
    const applied = await MigrationModel.find().sort({ version: 1 }).lean();
    const appliedVersions = new Set(applied.map((m: any) => m.version));

    for (const m of migrations) {
      if (!appliedVersions.has(m.version)) {
        console.log(`[Migration] Applying migration ${m.version}: ${m.name}...`);
        await m.up();
        await MigrationModel.create({
          version: m.version,
          name: m.name,
          appliedAt: new Date(),
        });
        console.log(`[Migration] Migration ${m.version} applied successfully.`);
      } else {
        console.log(`[Migration] Migration ${m.version} already applied. Skipping.`);
      }
    }

    console.log("[Migration] All database migrations up to date.");
  } catch (err: any) {
    console.error("[Migration] Migration execution error:", err.message);
  } finally {
    if (process.argv[1]?.includes("runner")) {
      await mongoose.disconnect();
    }
  }
}

if (process.argv[1]?.includes("runner")) {
  runMigrations();
}
