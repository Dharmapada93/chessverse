import { Router } from "express";
import mongoose from "mongoose";
import { Chess } from "chess.js";
import {
  requireAuth,
  type AuthRequest,
} from "../middleware/auth.js";
import { Game } from "../models/Game.js";
import { GameAnalysis } from "../models/GameAnalysis.js";
import { GameChat } from "../models/GameChat.js";
import { explainMove, generateGameReview } from "../services/ai.js";
import { analyzeGame } from "../services/gameAnalysis.js";
import { analysisQueue } from "../services/analysis/analysisQueue.js";

const router = Router();

router.get(
  "/history",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const skip = (page - 1) * limit;

      const query = {
        $or: [
          { whitePlayerId: req.userId },
          { blackPlayerId: req.userId },
        ],
        status: "finished",
      };

      const [games, total] = await Promise.all([
        Game.find(query)
          .select("whitePlayerId blackPlayerId whitePlayerName blackPlayerName roomId winner winnerId status result rated timeControl createdAt whiteRating blackRating ratingDelta moves fen")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Game.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return res.json({
        success: true,
        games,
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: "Failed to load game history",
      });
    }
  },
);

router.get(
  "/active",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const activeGame = await Game.findOne({
        $or: [
          { whitePlayerId: req.userId },
          { blackPlayerId: req.userId },
        ],
        status: { $in: ["playing", "waiting"] },
      })
        .select("roomId whitePlayerName blackPlayerName whiteRating blackRating timeControl currentFen status moves createdAt")
        .sort({ updatedAt: -1 })
        .lean();

      return res.json({
        success: true,
        game: activeGame || null,
      });
    } catch {
      return res.status(500).json({
        success: false,
        game: null,
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

router.get("/live/active", async (_req, res) => {
  try {
    const games = await Game.find({
      status: { $in: ["playing", "waiting"] },
    })
      .sort({ updatedAt: -1 })
      .limit(30)
      .lean();

    return res.json({
      success: true,
      games,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to load live games",
    });
  }
});

router.get("/recent", async (_req, res) => {
  try {
    const games = await Game.find({ status: "finished" })
      .select("whitePlayerName blackPlayerName whiteRating blackRating winner status result rated timeControl createdAt fen moves")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    return res.json({
      success: true,
      games,
    });
  } catch {
    return res.status(500).json({
      success: false,
      games: [],
    });
  }
});

router.get(
  "/:id",
  async (
    req,
    res,
  ) => {
    try {
      let game = null;
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        game = await Game.findById(req.params.id);
      }
      if (!game) {
        game = await Game.findOne({ roomId: req.params.id }).sort({ createdAt: -1 });
      }

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
    } catch {
      return res.status(500).json({
        success: false,
        message: "Failed to load game",
      });
    }
  },
);

router.get("/:id/state", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ success: false, message: "Game not found" });
    }

    const currentFen =
      game.currentFen ||
      game.initialFen ||
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    const chess = new Chess(currentFen);

    return res.json({
      success: true,
      state: {
        gameId: game._id.toString(),
        roomId: game.roomId,
        fen: currentFen,
        moveNumber: game.moves?.length || 0,
        turn: chess.turn() === "w" ? "white" : "black",
        whiteTime: game.whiteTimeMs,
        blackTime: game.blackTimeMs,
        status: game.status,
        result: game.result,
        resultReason: game.resultReason,
        isCheck: chess.inCheck(),
        isCheckmate: chess.isCheckmate(),
        isDraw: chess.isDraw(),
        serverTime: Date.now(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve game state snapshot",
    });
  }
});

router.get(
  "/:id/analysis",
  async (
    req,
    res,
  ) => {
    try {
      const analysis = await GameAnalysis.findOne({
        gameId: req.params.id,
      });

      return res.json({
        analysis,
      });
    } catch {
      return res.status(500).json({
        message: "Failed to load analysis",
      });
    }
  },
);

/**
 * GET /api/games/:id/moves
 * Optimized endpoint returning only move sequence and FEN
 */
router.get("/:id/moves", async (req, res) => {
  try {
    const id = String(req.params.id);
    const game = await Game.findById(id).select("moves pgn fen status").lean();
    if (!game) return res.status(404).json({ success: false, message: "Game not found" });
    return res.json({
      success: true,
      moves: game.moves || [],
      pgn: (game as any).pgn || "",
      fen: game.fen,
      status: game.status,
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to retrieve moves" });
  }
});

/**
 * GET /api/games/:id/analysis
 * Retrieves cached analysis record without recalculating
 */
router.get("/:id/analysis", async (req, res) => {
  try {
    const id = String(req.params.id);
    const analysis = await GameAnalysis.findOne({ gameId: id }).lean();
    if (!analysis) return res.status(404).json({ success: false, message: "Analysis not found" });
    return res.json({ success: true, analysis });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load analysis" });
  }
});

/**
 * POST /api/games/:id/analyze
 * Enqueues game analysis in concurrency-controlled Stockfish queue
 */
router.post(
  "/:id/analyze",
  async (req: AuthRequest, res) => {
    try {
      const depth = req.body?.depth || "normal";
      const depthNumber = depth === "quick" ? 12 : depth === "deep" ? 22 : 18;
      const gameId = String(req.params.id);

      const queuedJob = analysisQueue.enqueue(gameId, depthNumber, req.userId);
      return res.json({
        success: true,
        queued: true,
        jobId: queuedJob.jobId,
        status: queuedJob.status,
        position: queuedJob.position,
      });
    } catch (error: any) {
      console.error("Queue analysis error:", error);
      return res.status(500).json({
        success: false,
        message: error?.message || "Analysis request failed",
      });
    }
  },
);

/**
 * GET /api/games/:id/analyze/status
 * Check queue and completion status of analysis job
 */
router.get("/:id/analyze/status", async (req, res) => {
  try {
    const gameId = String(req.params.id);
    const job = analysisQueue.getJob(gameId);

    if (!job) {
      const dbAnalysis = await GameAnalysis.findOne({ gameId }).lean();
      if (dbAnalysis) {
        return res.json({ success: true, status: "completed", analysis: dbAnalysis });
      }
      return res.status(404).json({ success: false, message: "No analysis job found" });
    }

    return res.json({
      success: true,
      status: job.status,
      jobId: job.id,
      analysis: job.result,
      error: job.error,
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch status" });
  }
});

router.post(
  "/:id/review",
  async (
    req,
    res,
  ) => {
    try {
      const analysis = await GameAnalysis.findOne({
        gameId: req.params.id,
      });

      if (!analysis) {
        return res.status(404).json({
          message:
            "Run Stockfish analysis before generating a review.",
        });
      }

      const review = await generateGameReview(analysis);

      return res.json({
        success: true,
        review,
      });
    } catch {
      return res.status(500).json({
        message: "Failed to generate AI review",
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

router.post("/:id/rematch", async (req, res) => {
  try {
    let { userId } = req.body;

    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        message: "Game not found",
      });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      userId = game.whitePlayerId || game.blackPlayerId;
    }

    if (!game.rematchRequestedBy) {
      game.rematchRequestedBy = [];
    }

    if (
      userId &&
      !game.rematchRequestedBy.some(
        (id: any) => id.toString() === userId.toString(),
      )
    ) {
      game.rematchRequestedBy.push(userId);
    }

    let rematchGame = null;

    if (game.rematchRequestedBy.length >= 2) {
      // Swapped colors for the rematch
      rematchGame = await Game.create({
        roomId: game.roomId,
        whitePlayerId: game.blackPlayerId,
        whitePlayerName: game.blackPlayerName,
        whiteRating: game.blackRating,
        blackPlayerId: game.whitePlayerId,
        blackPlayerName: game.whitePlayerName,
        blackRating: game.whiteRating,
        status: "playing",
        activeColor: "white",
        initialFen: new Chess().fen(),
        currentFen: new Chess().fen(),
        whiteTimeMs: game.whiteTimeMs || 5 * 60 * 1000,
        blackTimeMs: game.blackTimeMs || 5 * 60 * 1000,
        incrementMs: game.incrementMs || 3 * 1000,
        lastClockUpdateAt: new Date(),
        startedAt: new Date(),
      });

      game.rematchGameId = rematchGame._id;
      game.rematchRequestedBy = [];
    }

    await game.save();

    return res.json({
      success: true,
      requested: game.rematchRequestedBy.length,
      rematchGameId: rematchGame?._id || game.rematchGameId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to request rematch",
    });
  }
});

router.get("/:id/chat", async (req, res) => {
  try {
    const messages = await GameChat.find({
      gameId: req.params.id,
    })
      .sort({ createdAt: 1 })
      .limit(100)
      .populate("userId", "username avatar");

    return res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to load game chat",
    });
  }
});

export default router;
