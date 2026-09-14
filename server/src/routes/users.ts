import { Router } from "express";
import { User } from "../models/User.js";
import { Game } from "../models/Game.js";

const router = Router();

router.get(
  "/:username",
  async (req, res) => {
    try {
      const user =
        await User.findOne({
          username:
            req.params.username,
        }).select(
          "_id username avatar rating createdAt",
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      return res.json({
        success: true,
        user,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message:
          "Failed to load profile",
      });
    }
  },
);

router.get(
  "/:username/stats",
  async (req, res) => {
    try {
      const user =
        await User.findOne({
          username:
            req.params.username,
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      const games =
        await Game.find({
          $or: [
            {
              whitePlayerId:
                user._id.toString(),
            },
            {
              blackPlayerId:
                user._id.toString(),
            },
          ],
          status: "finished",
        });

      let wins = 0;
      let losses = 0;
      let draws = 0;

      for (const game of games) {
        const isWhite =
          game.whitePlayerId ===
          user._id.toString();

        if (game.result === "draw") {
          draws++;
        } else if (
          (isWhite &&
            game.result === "white") ||
          (!isWhite &&
            game.result === "black")
        ) {
          wins++;
        } else {
          losses++;
        }
      }

      const total =
        wins + losses + draws;

      return res.json({
        success: true,
        stats: {
          games: total,
          wins,
          losses,
          draws,
          winRate:
            total === 0
              ? 0
              : Math.round(
                  (wins / total) *
                    100,
                ),
          rating: user.rating,
        },
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: "Failed to load stats",
      });
    }
  },
);

export default router;
