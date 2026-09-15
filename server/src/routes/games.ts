import { Router } from "express";
import {
  requireAuth,
  type AuthRequest,
} from "../middleware/auth.js";
import { Game } from "../models/Game.js";
import { explainMove } from "../services/ai.js";

const router = Router();

router.get(
  "/history",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    try {
      const games =
        await Game.find({
          $or: [
            {
              whitePlayerId:
                req.userId,
            },
            {
              blackPlayerId:
                req.userId,
            },
          ],
          status: "finished",
        })
          .sort({
            createdAt: -1,
          })
          .limit(50)
          .lean();

      return res.json({
        success: true,
        games,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message:
          "Failed to load game history",
      });
    }
  },
);

router.get(
  "/room/:roomId/current",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    try {
      const game =
        await Game.findOne({
          roomId:
            req.params.roomId,
          status: {
            $in: [
              "waiting",
              "playing",
            ],
          },
        }).sort({
          createdAt: -1,
        });

      if (!game) {
        return res.json({
          success: true,
          game: null,
          message:
            "No active game found",
        });
      }

      return res.json({
        success: true,
        game,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message:
          "Failed to load current game",
      });
    }
  },
);

router.get(
  "/:id",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const game =
      await Game.findById(
        req.params.id,
      );

    if (!game) {
      return res.status(404).json({
        success: false,
        message:
          "Game not found",
      });
    }

    return res.json({
      success: true,
      game,
    });
  },
);

router.get(
  "/:id/analysis",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    try {
      const game =
        await Game.findById(
          req.params.id,
        );

      if (!game) {
        return res.status(404).json({
          success: false,
          message:
            "Game not found",
        });
      }

      return res.json({
        success: true,
        analysis: null,
        message:
          "Analysis has not been generated yet.",
      });
    } catch {
      return res.status(500).json({
        success: false,
        message:
          "Failed to load analysis",
      });
    }
  },
);

router.post(
  "/:id/explain",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    try {
      const game =
        await Game.findById(
          req.params.id,
        );

      if (!game) {
        return res.status(404).json({
          success: false,
          message:
            "Game not found",
        });
      }

      const {
        move,
        bestMove,
        evaluationBefore,
        evaluationAfter,
      } = req.body;

      if (!move) {
        return res.status(400).json({
          success: false,
          message:
            "Move is required",
        });
      }

      const explanation =
        await explainMove({
          fen: game.currentFen,
          move,
          bestMove,
          evaluationBefore,
          evaluationAfter,
        });

      return res.json({
        success: true,
        explanation,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message:
          "Failed to explain move",
      });
    }
  },
);

export default router;
