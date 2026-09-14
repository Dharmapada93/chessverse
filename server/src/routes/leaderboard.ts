import { Router } from "express";

import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get(
  "/global",
  async (
    _req,
    res,
  ) => {
    try {
      const users =
        await User.find({})
          .select(
            "_id username avatar rating",
          )
          .sort({
            rating: -1,
          })
          .limit(100)
          .lean();

      const leaderboard =
        users.map(
          (user, index) => ({
            rank: index + 1,
            ...user,
          }),
        );

      return res.json({
        success: true,
        leaderboard,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message:
          "Failed to load leaderboard",
      });
    }
  },
);

export default router;
