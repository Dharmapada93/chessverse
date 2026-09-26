import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!mongoUri) {
    logger.error("database_config_missing", {
      message: "Database connection URL is not defined. Please set MONGODB_URI or DATABASE_URL.",
    });
    throw new Error(
      "Database connection URL is not defined (set MONGODB_URI or DATABASE_URL)",
    );
  }

  mongoose.connection.on("connected", () => {
    logger.info("database_connected", {
      databaseName: mongoose.connection.name || "chessverse",
    });
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
      serverSelectionTimeoutMS: 5000,
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

