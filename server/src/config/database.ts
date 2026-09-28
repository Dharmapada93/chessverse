import mongoose from "mongoose";
import dns from "node:dns";
import { logger } from "../utils/logger.js";

export async function connectDatabase() {
  const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI;

  if (!mongoUri) {
    logger.error("database_config_missing", {
      message: "Database connection URL is not defined. Please set MONGODB_URI or DATABASE_URL.",
    });
    throw new Error(
      "Database connection URL is not defined (set MONGODB_URI or DATABASE_URL)",
    );
  }

  // Gracefully handle local DNS SRV resolution issues with mongodb+srv
  if (mongoUri.startsWith("mongodb+srv://")) {
    try {
      const hostname = new URL(mongoUri).hostname;
      await dns.promises.resolveSrv(`_mongodb._tcp.${hostname}`);
    } catch {
      try {
        dns.setServers(["[2001:4860:4860::6464]"]);
        const hostname = new URL(mongoUri).hostname;
        await dns.promises.resolveSrv(`_mongodb._tcp.${hostname}`);
      } catch {
        try {
          dns.setServers(["8.8.8.8", "1.1.1.1"]);
        } catch {}
      }
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

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 20,
      minPoolSize: 2,
    });
  } catch (error: any) {
    logger.error("database_initial_connection_failed", {
      message: error.message,
    });

    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    } else {
      console.warn("MongoDB connection failed in development mode. Continuing with limited functionality.");
    }
  }
}

