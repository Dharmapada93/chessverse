import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { matchmakingLimiter } from "../middleware/rateLimiter.js";
import { User } from "../models/User.js";
import {
  addToQueue,
  removeFromQueue,
  isPlayerQueued,
  MAX_ACTIVE_GAMES,
} from "../services/matchmakingService.js";
import { Game } from "../models/Game.js";

const router = Router();

// POST /api/matchmaking/join - Join matchmaking queue via HTTP fallback / API
router.post("/join", requireAuth, matchmakingLimiter, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { category = "rapid", initialTime = 600, increment = 0 } = req.body;

    // Check active games limit (Step 77.6)
    const activeGamesCount = await Game.countDocuments({
      status: "playing",
      $or: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
    });

    if (activeGamesCount >= MAX_ACTIVE_GAMES) {
      return res.status(400).json({
        success: false,
        message: `Active game limit reached (max ${MAX_ACTIVE_GAMES}). Please finish ongoing games.`,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const rating = user.ratings?.[category] || user.rating || 1500;

    const queueResult = await addToQueue({
      userId,
      socketId: `http-${userId}`,
      username: user.username,
      rating,
      category,
      initialTime: initialTime * 1000,
      increment,
      joinedAt: Date.now(),
      lastHeartbeat: Date.now(),
    });

    if (!queueResult.success) {
      return res.status(409).json({
        success: false,
        message: queueResult.message || "Already searching for a game",
      });
    }

    return res.json({
      success: true,
      message: "Joined matchmaking queue",
      category,
      rating,
    });
  } catch (error) {
    console.error("POST /api/matchmaking/join error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/matchmaking/cancel - Cancel matchmaking queue
router.post("/cancel", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const removed = removeFromQueue(userId);
    return res.json({ success: true, removed });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to cancel queue" });
  }
});

// GET /api/matchmaking/status - Check if player is queued
router.get("/status", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const queued = isPlayerQueued(userId);
    return res.json({ success: true, queued });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to get queue status" });
  }
});

export default router;
