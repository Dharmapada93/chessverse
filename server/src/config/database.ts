import mongoose from "mongoose";
import dns from "node:dns";
import { logger } from "../utils/logger.js";

export async function connectDatabase() {
  const rawUri = process.env.DATABASE_URL || process.env.MONGODB_URI;

  if (!rawUri) {
    logger.error("database_config_missing", {
      message: "Database connection URL is not defined. Please set MONGODB_URI or DATABASE_URL.",
    });
    throw new Error(
      "Database connection URL is not defined (set MONGODB_URI or DATABASE_URL)",
    );
  }

  // Strip accidental quotes or surrounding whitespace from environment variable
  const mongoUri = rawUri.trim().replace(/^["']|["']$/g, "");

  // In local development, fall back to public DNS if ISP blocks SRV queries
  if (process.env.NODE_ENV !== "production" && mongoUri.startsWith("mongodb+srv://")) {
    try {
      const hostname = new URL(mongoUri).hostname;
      await dns.promises.resolveSrv(`_mongodb._tcp.${hostname}`);
    } catch {
      try {
        dns.setServers(["[2001:4860:4860::6464]", "8.8.8.8", "1.1.1.1"]);
      } catch {}
    }
  }

  mongoose.connection.on("connected", () => {
    logger.info("database_connected", {
      databaseName: mongoose.connection.name || "chessverse",
    });
    console.log(`\n========================================`);
    console.log(`MongoDB connected successfully`);
    console.log(`Database: ${mongoose.connection.name || "chessverse"}`);
    console.log(`========================================\n`);
  });

  mongoose.connection.on("error", (err) => {
    logger.error("database_connection_error", {
      message: err.message,
    });
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("database_disconnected");
  });

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 15000,
        maxPoolSize: 20,
        minPoolSize: 2,
      });
      return;
    } catch (error: any) {
      logger.error("database_initial_connection_failed", {
        attempt,
        maxRetries,
        message: error.message,
      });

      if (attempt < maxRetries) {
        console.warn(`[Database] Connection attempt ${attempt}/${maxRetries} failed. Retrying in 3s...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        if (process.env.NODE_ENV === "production") {
          process.exit(1);
        } else {
          console.warn("MongoDB connection failed in development mode. Continuing with limited functionality.");
        }
      }
    }
  }
}

