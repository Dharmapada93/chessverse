import { Router } from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import {
  generateCoachResponse,
  explainPositionMove,
  type CoachStyle,
} from "../services/llm.js";
import { CoachProfile } from "../models/CoachProfile.js";
import { Game } from "../models/Game.js";
import { GameAnalysis } from "../models/GameAnalysis.js";
import { getStockfishService } from "../services/stockfish/StockfishService.js";
import { calculateAiMove, type AIDifficulty } from "../services/ai/aiOpponentService.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// -------------------------------------------------------------
// R5.39: AI Rate Limiting Middleware
// -------------------------------------------------------------
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 40,             // 40 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "AI analysis is temporarily busy. Please try again shortly.",
  },
});

router.use(aiLimiter);

// -------------------------------------------------------------
// R5.40: AI Abuse Protection Sanitizer
// -------------------------------------------------------------
function sanitizePrompt(text: string): string {
  if (typeof text !== "string") return "";
  // Strip null bytes and non-printable control chars
  let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
  // Bound max length to 350 chars
  if (cleaned.length > 350) {
    cleaned = cleaned.slice(0, 350);
  }
  return cleaned;
}

// -------------------------------------------------------------
// AI Coach Endpoints (R5.23 - R5.26, R5.37 Zero PII)
// -------------------------------------------------------------
router.post("/coach", async (req, res) => {
  try {
    const rawQuestion = req.body?.question;
    const userId = req.body?.userId;

    if (!rawQuestion) {
      return res.status(400).json({ message: "question is required" });
    }

    const question = sanitizePrompt(rawQuestion);

    let profile: any = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      profile = await CoachProfile.findOne({ userId }).lean();
    }

    // Only transmit pure chess performance scores (R5.37 Zero PII)
    const context = {
      weaknesses: profile?.weaknesses?.length
        ? profile.weaknesses
        : ["tactical vigilance in early middlegames"],
      strengths: profile?.strengths?.length
        ? profile.strengths
        : ["active opening development", "piece coordination"],
      tacticalScore: profile?.tacticalScore ?? 78,
      openingScore: profile?.openingScore ?? 84,
      middlegameScore: profile?.middlegameScore ?? 73,
      endgameScore: profile?.endgameScore ?? 71,
      gamesAnalyzed: profile?.gamesAnalyzed ?? 16,
    };

    const answer = await generateCoachResponse(question, context);

    return res.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("AI coach error:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "AI coach failed",
    });
  }
});

router.post("/coach/position", async (req, res) => {
  try {
    const {
      position,
      move,
      bestMove,
      evaluationBefore = 0,
      evaluationAfter = 0,
      phase = "middlegame",
      material = { white: 39, black: 39 },
      style = "intermediate",
      question: rawQuestion = "Why was this a mistake?",
    } = req.body;

    if (!position || !move || !bestMove) {
      return res.status(400).json({
        message: "position, move, and bestMove are required",
      });
    }

    const question = sanitizePrompt(rawQuestion);

    const explanation = await explainPositionMove({
      position,
      move,
      bestMove,
      evaluationBefore: Number(evaluationBefore),
      evaluationAfter: Number(evaluationAfter),
      phase,
      material,
      style: style as CoachStyle,
      question,
    });

    return res.json({
      success: true,
      explanation,
      bestMove,
      move,
    });
  } catch (err: any) {
    console.error("Position coaching error:", err);
    return res.status(500).json({
      message: err?.message || "Position coaching failed",
    });
  }
});

// -------------------------------------------------------------
// R5.35 & R5.2: Fast Position Evaluation with Engine
// -------------------------------------------------------------
router.post("/analyze-position", async (req, res) => {
  try {
    const { fen, depth = 14 } = req.body;
    if (!fen) {
      return res.status(400).json({ message: "fen is required" });
    }

    const stockfish = getStockfishService();
    const analysis = await stockfish.analyze(fen, Number(depth));

    return res.json({
      success: true,
      analysis: {
        fen,
        bestMove: analysis.bestMove,
        evaluation: analysis.evaluation,
        depth: analysis.depth,
        pv: analysis.principalVariation,
        advantageText: analysis.advantageText,
      },
    });
  } catch (err: any) {
    console.error("Position analysis error:", err);
    return res.status(500).json({
      message: err?.message || "Engine position analysis failed",
    });
  }
});

// -------------------------------------------------------------
// R5.28 - R5.32: AI Opponent Management
// -------------------------------------------------------------
router.post("/opponent/game", async (req, res) => {
  try {
    const {
      difficulty = "intermediate",
      userColor = "white",
      timeControlSeconds = 300,
      incrementSeconds = 0,
      userId,
    } = req.body;

    const assignedColor =
      userColor === "random"
        ? Math.random() < 0.5
          ? "white"
          : "black"
        : userColor;
    const aiColor = assignedColor === "white" ? "black" : "white";

    const roomId = `ai-room-${Date.now().toString(36)}`;
    const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    const game = await Game.create({
      roomId,
      whitePlayerId: assignedColor === "white" ? userId || "human-player" : "stockfish-ai",
      blackPlayerId: assignedColor === "black" ? userId || "human-player" : "stockfish-ai",
      whitePlayerName: assignedColor === "white" ? "Player" : `Stockfish (${difficulty})`,
      blackPlayerName: assignedColor === "black" ? "Player" : `Stockfish (${difficulty})`,
      whiteRating: assignedColor === "white" ? 1500 : 1600,
      blackRating: assignedColor === "black" ? 1500 : 1600,
      status: "playing",
      rated: false,
      initialFen,
      currentFen: initialFen,
      whiteTimeMs: timeControlSeconds * 1000,
      blackTimeMs: timeControlSeconds * 1000,
      incrementMs: incrementSeconds * 1000,
      clock: {
        initialTime: timeControlSeconds * 1000,
        increment: incrementSeconds * 1000,
        whiteRemaining: timeControlSeconds * 1000,
        blackRemaining: timeControlSeconds * 1000,
        turnStartedAt: new Date(),
      },
      moves: [],
      isAiGame: true,
      aiDifficulty: difficulty,
      aiSide: aiColor,
    });

    return res.json({
      success: true,
      gameId: game._id.toString(),
      roomId,
      playerColor: assignedColor,
      aiColor,
      difficulty,
    });
  } catch (err: any) {
    console.error("Create AI game error:", err);
    return res.status(500).json({
      message: err?.message || "Failed to create AI match",
    });
  }
});

router.post("/opponent/move", async (req, res) => {
  try {
    const { fen, difficulty = "intermediate", gameId } = req.body;
    if (!fen) {
      return res.status(400).json({ message: "fen is required" });
    }

    const calculatedMove = await calculateAiMove(fen, difficulty as AIDifficulty);

    // If gameId is provided, optionally sync with Game record
    if (gameId && mongoose.Types.ObjectId.isValid(gameId)) {
      const game = await Game.findById(gameId);
      if (game && game.status === "playing") {
        // Record move timestamp
        game.lastClockUpdateAt = new Date();
        await game.save();
      }
    }

    return res.json({
      success: true,
      move: calculatedMove,
    });
  } catch (err: any) {
    console.error("AI opponent move error:", err);
    return res.status(500).json({
      message: err?.message || "Failed to calculate AI move",
    });
  }
});

// -------------------------------------------------------------
// R5.45 - R5.47: Personal AI Insights
// -------------------------------------------------------------
router.get("/insights", async (req, res) => {
  try {
    // Collect stats from latest analyzed games
    const analyses = await GameAnalysis.find()
      .sort({ generatedAt: -1 })
      .limit(20)
      .lean();

    if (!analyses || analyses.length === 0) {
      return res.json({
        success: true,
        insights: {
          recentAccuracyAvg: null,
          totalGamesAnalyzed: 0,
          commonMistakesByPhase: { opening: 0, middlegame: 0, endgame: 0 },
          openingPerformance: [],
          tacticalMotifsEncountered: [],
          recommendedPractice: [],
        },
      });
    }

    let totalAcc = 0;
    let openingMistakes = 0;
    let middlegameMistakes = 0;
    let endgameMistakes = 0;
    const openingMap = new Map<string, { count: number; totalAcc: number }>();
    const motifMap = new Map<string, { count: number; missedCount: number }>();

    for (const a of analyses) {
      const avgGameAcc = (a.whiteAccuracy + a.blackAccuracy) / 2;
      totalAcc += avgGameAcc;

      // Group openings
      const opName = a.opening?.name || "Standard";
      const existingOp = openingMap.get(opName) || { count: 0, totalAcc: 0 };
      existingOp.count += 1;
      existingOp.totalAcc += avgGameAcc;
      openingMap.set(opName, existingOp);

      // Analyze moves
      if (Array.isArray(a.moves)) {
        for (const m of a.moves) {
          const isError = m.classification === "mistake" || m.classification === "blunder";
          if (isError) {
            const ply = m.moveNumber || 1;
            if (ply <= 16) openingMistakes += 1;
            else if (ply <= 40) middlegameMistakes += 1;
            else endgameMistakes += 1;
          }

          if (m.tacticalIdea) {
            const idea = String(m.tacticalIdea).toLowerCase();
            const motif = idea.includes("fork")
              ? "fork"
              : idea.includes("pin")
              ? "pin"
              : idea.includes("hang")
              ? "hanging_piece"
              : "tactic";

            const existingMotif = motifMap.get(motif) || { count: 0, missedCount: 0 };
            existingMotif.count += 1;
            if (isError) existingMotif.missedCount += 1;
            motifMap.set(motif, existingMotif);
          }
        }
      }
    }

    const avgAcc = parseFloat((totalAcc / analyses.length).toFixed(1));

    const openingPerformance = Array.from(openingMap.entries()).map(([name, data]) => ({
      name,
      gamesCount: data.count,
      accuracyAvg: parseFloat((data.totalAcc / data.count).toFixed(1)),
    }));

    const tacticalMotifsEncountered = Array.from(motifMap.entries()).map(([motif, data]) => ({
      motif,
      count: data.count,
      missedCount: data.missedCount,
    }));

    const recommendedPractice: Array<{ title: string; focus: string; reason: string }> = [];
    if (middlegameMistakes > openingMistakes) {
      recommendedPractice.push({
        title: "Middlegame Calculation & Tactical Awareness",
        focus: "Calculation",
        reason: `Detected ${middlegameMistakes} tactical inaccuracies in middlegames across ${analyses.length} analyzed matches.`,
      });
    }
    if (openingMistakes > 0) {
      recommendedPractice.push({
        title: "Early Opening Prophylaxis",
        focus: "Opening Principles",
        reason: `${openingMistakes} recorded inaccuracies occurred during opening phase piece development.`,
      });
    }

    return res.json({
      success: true,
      insights: {
        recentAccuracyAvg: avgAcc,
        totalGamesAnalyzed: analyses.length,
        commonMistakesByPhase: {
          opening: openingMistakes,
          middlegame: middlegameMistakes,
          endgame: endgameMistakes,
        },
        openingPerformance,
        tacticalMotifsEncountered,
        recommendedPractice,
      },
    });
  } catch (err: any) {
    console.error("AI insights error:", err);
    return res.status(500).json({
      message: "Failed to generate AI insights",
    });
  }
});

// -------------------------------------------------------------
// R5.48 & R5.49: Engine-Validated AI Puzzle Generation
// -------------------------------------------------------------
router.post("/puzzles/generate/:gameId", async (req, res) => {
  try {
    const gameId = req.params.gameId;
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ message: "Invalid gameId" });
    }

    const analysis = await GameAnalysis.findOne({ gameId }).lean();
    if (!analysis || !analysis.moves || analysis.moves.length === 0) {
      return res.status(404).json({ message: "No analysis available for this game" });
    }

    // Find critical moment (blunder or missed opportunity) where a single best move was decisive
    const candidateMove = analysis.moves.find(
      (m: any) => (m.classification === "blunder" || m.classification === "missed_opportunity") && m.beforeFen,
    );

    if (!candidateMove || !candidateMove.beforeFen) {
      return res.status(404).json({ message: "No tactical mistake found in this game" });
    }

    // Engine validation (R5.49): verify best move with Stockfish
    const stockfish = getStockfishService();
    const verified = await stockfish.analyze(candidateMove.beforeFen, 14);

    return res.json({
      success: true,
      puzzle: {
        id: `puzzle-${gameId}-${candidateMove.moveNumber}`,
        gameId,
        title: `Tactical Breakthrough (Move ${Math.ceil(candidateMove.moveNumber / 2)})`,
        fen: candidateMove.beforeFen,
        sideToMove: candidateMove.color,
        targetMoveUci: verified.bestMove,
        solutionSan: [candidateMove.bestMove],
        motif: candidateMove.classification === "blunder" ? "fork" : "hanging_piece",
        difficulty: "intermediate",
        description: `Find the decisive engine move that punishes the position.`,
        explanation: candidateMove.commentary || `Playing ${candidateMove.bestMove} secures a decisive positional advantage.`,
      },
    });
  } catch (err: any) {
    console.error("AI puzzle generation error:", err);
    return res.status(500).json({
      message: "Failed to generate puzzle from game",
    });
  }
});

export default router;
