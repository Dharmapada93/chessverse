import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { DEFAULT_ACHIEVEMENTS } from "../models/Achievement.js";
import { calculateLevelFromXp } from "../services/progressionService.js";
import type { Request } from "express";

const router = Router();

function getOptionalUserId(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.substring(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  try {
    const payload = jwt.verify(token, secret) as { userId?: string };
    return payload?.userId || null;
  } catch {
    return null;
  }
}

// GET /api/progression/me - Step 75.7
router.get("/me", async (req, res) => {
  try {
    let userId = getOptionalUserId(req);
    let user = null;

    if (userId) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = await User.findOne({ username: "Dharmapada" });
    }

    const totalXp = user?.progression?.xp || 1240;
    const { level, currentLevelXp, nextLevelThreshold, progressPercent } =
      calculateLevelFromXp(totalXp);

    const userUnlockedMap = new Map<string, Date>();
    if (user?.achievements) {
      for (const a of user.achievements) {
        userUnlockedMap.set(a.achievementId, a.unlockedAt);
      }
    }

    // Default unlocks for demo richness if fresh user
    if (userUnlockedMap.size === 0) {
      userUnlockedMap.set("FIRST_WIN", new Date(Date.now() - 86400000 * 5));
      userUnlockedMap.set("FIRST_CHECKMATE", new Date(Date.now() - 86400000 * 3));
      userUnlockedMap.set("SEVEN_DAY_STREAK", new Date(Date.now() - 86400000));
    }

    const achievements = DEFAULT_ACHIEVEMENTS.map((ach) => ({
      ...ach,
      unlocked: userUnlockedMap.has(ach.id),
      unlockedAt: userUnlockedMap.get(ach.id) || null,
    }));

    return res.json({
      success: true,
      progression: {
        xp: totalXp,
        level: user?.progression?.level || level,
        currentLevelXp,
        nextLevelThreshold,
        progressPercent,
        currentStreak: user?.progression?.currentStreak || 7,
        longestStreak: user?.progression?.longestStreak || 14,
        puzzleRating: user?.puzzleRating || 1328,
      },
      achievements,
    });
  } catch (error) {
    console.error("Progression me error:", error);
    return res.status(500).json({ success: false, message: "Failed to load progression" });
  }
});

// GET /api/progression/achievements
router.get("/achievements", async (_req, res) => {
  return res.json({
    success: true,
    achievements: DEFAULT_ACHIEVEMENTS,
  });
});

// GET /api/progression/preferences - Step 76.6
router.get("/preferences", async (req, res) => {
  try {
    let userId = getOptionalUserId(req);
    let user = null;
    if (userId) user = await User.findById(userId);
    if (!user) user = await User.findOne({ username: "Dharmapada" });

    const preferences = user?.preferences || {
      theme: "classic",
      boardTheme: "classic",
      pieceSet: "classic",
      soundEnabled: true,
      animationsEnabled: true,
      coordinates: true,
    };

    return res.json({ success: true, preferences });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load preferences" });
  }
});

// POST /api/progression/preferences - Step 76.6
router.post("/preferences", async (req, res) => {
  try {
    let userId = getOptionalUserId(req);
    let user = null;
    if (userId) user = await User.findById(userId);
    if (!user) user = await User.findOne({ username: "Dharmapada" });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.preferences = {
      ...(user.preferences || {}),
      ...req.body,
    };

    await user.save();

    return res.json({ success: true, preferences: user.preferences });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to save preferences" });
  }
});

export default router;
