import { Router } from "express";
import mongoose from "mongoose";
import { isUsingRedis } from "../services/redis.js";

const router = Router();
const startTime = Date.now();

/**
 * GET /health
 * Comprehensive component health check for monitoring systems
 */
router.get("/", (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  const redisConnected = isUsingRedis();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  const isHealthy = dbConnected;

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    database: dbConnected ? "ok" : "disconnected",
    redis: redisConnected ? "ok" : "memory_fallback",
    websocket: "ok",
    ai: process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_api_key_here"
      ? "available"
      : "fallback_ready",
    version: "1.0.0",
    uptimeSeconds,
    memoryMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  });
});

/**
 * GET /health/live
 * Liveness probe: returns 200 if process is alive
 */
router.get("/live", (_req, res) => {
  return res.status(200).json({ status: "alive" });
});

/**
 * GET /health/ready
 * Readiness probe: returns 200 only if application is ready to accept user traffic
 */
router.get("/ready", (_req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  if (!isDbReady) {
    return res.status(503).json({
      status: "not_ready",
      reason: "Database connection not established",
    });
  }

  return res.status(200).json({ status: "ready" });
});

export default router;
