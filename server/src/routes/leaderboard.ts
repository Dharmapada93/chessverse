import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Friendship } from "../models/Friendship.js";
import { Game } from "../models/Game.js";
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

// GET /api/leaderboard/global
router.get("/global", async (req, res) => {
  try {
    const category = (req.query.category as string) || "all";
    const cacheKey = `leaderboard:global:${category}`;

    const { cacheGet, cacheSet } = await import("../services/redis.js");
    const cachedData = await cacheGet<any[]>(cacheKey);

    const currentUserId = getOptionalUserId(req);

    if (cachedData) {
      const personalized = cachedData.map((p) => ({
        ...p,
        isCurrentUser: currentUserId ? p.id === currentUserId : false,
      }));
      return res.json({
        success: true,
        leaderboard: personalized,
        fromCache: true,
      });
    }

    const sortField =
      category === "blitz"
        ? "ratings.blitz"
        : category === "rapid"
        ? "ratings.rapid"
        : category === "bullet"
        ? "ratings.bullet"
        : "rating";

    let users = await User.find({})
      .select("_id username avatar rating ratings createdAt")
      .sort({ [sortField]: -1, rating: -1 })
      .limit(100)
      .lean();

    // Calculate games and wins from Game model
    const userIds = users.map((u: any) => u._id.toString());
    const games = await Game.find({
      $or: [{ whitePlayerId: { $in: userIds } }, { blackPlayerId: { $in: userIds } }],
      status: "finished",
    }).lean();

    const userStatsMap = new Map<string, { games: number; wins: number }>();
    for (const g of games) {
      if (g.whitePlayerId) {
        const stats = userStatsMap.get(g.whitePlayerId) || { games: 0, wins: 0 };
        stats.games++;
        if (g.result === "white" || g.result === "1-0") stats.wins++;
        userStatsMap.set(g.whitePlayerId, stats);
      }
      if (g.blackPlayerId) {
        const stats = userStatsMap.get(g.blackPlayerId) || { games: 0, wins: 0 };
        stats.games++;
        if (g.result === "black" || g.result === "0-1") stats.wins++;
        userStatsMap.set(g.blackPlayerId, stats);
      }
    }

    const leaderboard = users.map((user: any, index: number) => {
      const stats = userStatsMap.get(user._id.toString()) || { games: 0, wins: 0 };
      const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;
      const gamesCount = stats.games;

      return {
        rank: index + 1,
        ...user,
        rating:
          category !== "all" && user.ratings?.[category]
            ? user.ratings[category]
            : user.rating,
        games: gamesCount,
        winRate,
        isCurrentUser: currentUserId === user._id.toString(),
      };
    });

    // Cache for 60 seconds
    try {
      await cacheSet(cacheKey, leaderboard, 60);
    } catch {}

    return res.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error("Global leaderboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load leaderboard",
    });
  }
});

// GET /api/leaderboard/friends - Step 72.6
router.get("/friends", async (req, res) => {
  try {
    let userId = getOptionalUserId(req);

    if (!userId) {
      const defaultUser = await User.findOne({ username: "Dharmapada" });
      if (defaultUser) userId = defaultUser._id.toString();
    }

    if (!userId) {
      return res.json({ success: true, leaderboard: [] });
    }

    const category = (req.query.category as string) || "all";
    const sortField =
      category === "blitz"
        ? "ratings.blitz"
        : category === "rapid"
        ? "ratings.rapid"
        : category === "bullet"
        ? "ratings.bullet"
        : "rating";

    const friendships = await Friendship.find({
      $or: [
        { requesterId: userId, status: "accepted" },
        { recipientId: userId, status: "accepted" },
        { receiverId: userId, status: "accepted" },
      ],
    });

    const friendIds = friendships
      .map((f) => {
        const reqId = f.requesterId?.toString();
        const recId = (f.recipientId || f.receiverId)?.toString();
        return reqId === userId ? recId : reqId;
      })
      .filter(Boolean);

    // Include the user themself in the friends leaderboard
    const allIds = [userId, ...friendIds];

    const users = await User.find({ _id: { $in: allIds } })
      .select("_id username avatar rating ratings createdAt")
      .sort({ [sortField]: -1, rating: -1 })
      .lean();

    const games = await Game.find({
      $or: [{ whitePlayerId: { $in: allIds } }, { blackPlayerId: { $in: allIds } }],
      status: "finished",
    }).lean();

    const userStatsMap = new Map<string, { games: number; wins: number }>();
    for (const g of games) {
      if (g.whitePlayerId) {
        const stats = userStatsMap.get(g.whitePlayerId) || { games: 0, wins: 0 };
        stats.games++;
        if (g.result === "white" || g.result === "1-0") stats.wins++;
        userStatsMap.set(g.whitePlayerId, stats);
      }
      if (g.blackPlayerId) {
        const stats = userStatsMap.get(g.blackPlayerId) || { games: 0, wins: 0 };
        stats.games++;
        if (g.result === "black" || g.result === "0-1") stats.wins++;
        userStatsMap.set(g.blackPlayerId, stats);
      }
    }

    const leaderboard = users.map((user: any, index: number) => {
      const stats = userStatsMap.get(user._id.toString()) || { games: 0, wins: 0 };
      const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;
      const gamesCount = stats.games;

      return {
        rank: index + 1,
        ...user,
        rating:
          category !== "all" && user.ratings?.[category]
            ? user.ratings[category]
            : user.rating,
        isCurrentUser: user._id.toString() === userId,
        games: gamesCount,
        winRate,
      };
    });

    return res.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error("Friends leaderboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load friends leaderboard",
    });
  }
});

export default router;

