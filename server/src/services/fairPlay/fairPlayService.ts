import mongoose from "mongoose";
import { Game } from "../../models/Game.js";
import { User } from "../../models/User.js";
import { GameAnalysis } from "../../models/GameAnalysis.js";
import { GameTelemetry } from "../../models/GameTelemetry.js";
import { FairPlayReview } from "../../models/FairPlayReview.js";

export type FairPlaySignals = {
  engineCorrelation: "Low" | "Medium" | "High" | "Critical";
  engineAgreementPct: number;
  timingAnomaly: "Low" | "Medium" | "High";
  accountPattern: "Normal" | "Elevated" | "Suspicious";
  riskScore: number;
};

/**
 * Records telemetry for a chess move played in a game.
 */
export async function recordMoveTelemetry(data: {
  gameId: string;
  userId: string;
  color: "white" | "black";
  moveNumber: number;
  moveSan: string;
  moveUci: string;
  timeSpentMs: number;
  timeRemainingMs: number;
  clientSequence?: number;
}) {
  try {
    if (!mongoose.Types.ObjectId.isValid(data.gameId) || !mongoose.Types.ObjectId.isValid(data.userId)) {
      return;
    }

    await GameTelemetry.create({
      gameId: new mongoose.Types.ObjectId(data.gameId),
      userId: new mongoose.Types.ObjectId(data.userId),
      color: data.color,
      moveNumber: data.moveNumber,
      moveSan: data.moveSan,
      moveUci: data.moveUci,
      timeSpentMs: data.timeSpentMs,
      timeRemainingMs: data.timeRemainingMs,
      clientSequence: data.clientSequence || data.moveNumber,
      timestamp: new Date(),
    });
  } catch (err) {
    console.warn("Failed to record move telemetry:", err);
  }
}

/**
 * Evaluates fair-play signals for a finished game across multiple metrics.
 * Follows Rule 4: Never accuse on a single signal; synthesize multi-factor risk.
 */
export async function evaluateGameFairPlay(gameId: string): Promise<void> {
  try {
    if (!mongoose.Types.ObjectId.isValid(gameId)) return;

    const game = await Game.findById(gameId);
    if (!game || !game.whitePlayerId || !game.blackPlayerId) return;

    const analysis = await GameAnalysis.findOne({ gameId: game._id });
    if (!analysis || !analysis.moves || analysis.moves.length < 10) return;

    // Evaluate both players
    await evaluatePlayerSignals(game, analysis, game.whitePlayerId.toString(), "white");
    await evaluatePlayerSignals(game, analysis, game.blackPlayerId.toString(), "black");
  } catch (error) {
    console.error("Fair play evaluation error:", error);
  }
}

async function evaluatePlayerSignals(
  game: any,
  analysis: any,
  userId: string,
  color: "white" | "black",
) {
  const user = await User.findById(userId);
  if (!user) return;

  const playerMoves = analysis.moves.filter((m: any) => m.color === color);
  if (playerMoves.length < 8) return;

  // 1. Engine Agreement (excluding first 6 moves of opening theory)
  const nonBookMoves = playerMoves.slice(6);
  let bestCount = 0;
  for (const m of nonBookMoves) {
    if (m.classification === "best" || m.classification === "brilliant") {
      bestCount++;
    }
  }

  const agreementPct = Math.round((bestCount / (nonBookMoves.length || 1)) * 100);
  const userRating = user.rating || 1200;

  let engineCorrelation: "Low" | "Medium" | "High" | "Critical" = "Low";
  let engineScore = 0;

  // Expected agreement varies with rating: 1200 ELO naturally has ~40-55%, 2400 ELO ~75-85%
  if (userRating < 1500 && agreementPct >= 92) {
    engineCorrelation = "Critical";
    engineScore = 45;
  } else if (userRating < 1800 && agreementPct >= 90) {
    engineCorrelation = "High";
    engineScore = 35;
  } else if (agreementPct >= 85) {
    engineCorrelation = "Medium";
    engineScore = 20;
  }

  // 2. Timing Anomaly from Telemetry
  const telemetry = await GameTelemetry.find({
    gameId: game._id,
    userId: user._id,
  }).lean();

  let timingAnomaly: "Low" | "Medium" | "High" = "Low";
  let timingScore = 0;

  if (telemetry.length >= 10) {
    const times = telemetry.map((t) => t.timeSpentMs);
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const variance =
      times.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);

    // Uniform move time (e.g. constant bot delay of 1.5s - 2.5s with near-zero std deviation)
    if (mean > 1200 && mean < 3000 && stdDev < 400 && nonBookMoves.length >= 12) {
      timingAnomaly = "High";
      timingScore = 35;
    } else if (stdDev < 800) {
      timingAnomaly = "Medium";
      timingScore = 15;
    }
  }

  // 3. Account Pattern (rapid rating spikes, new accounts with high win rates)
  let accountPattern: "Normal" | "Elevated" | "Suspicious" = "Normal";
  let accountScore = 0;

  const totalGames = await Game.countDocuments({
    $or: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
    status: "finished",
  });

  if (totalGames < 10 && agreementPct > 88) {
    accountPattern = "Suspicious";
    accountScore = 20;
  } else if (user.isRestricted) {
    accountPattern = "Elevated";
    accountScore = 15;
  }

  const compositeRisk = engineScore + timingScore + accountScore;

  // Only create review entry if elevated risk detected (or if review exists)
  if (compositeRisk >= 35) {
    await FairPlayReview.findOneAndUpdate(
      { gameId: game._id, userId: user._id },
      {
        gameId: game._id,
        userId: user._id,
        username: user.username,
        userRating,
        engineCorrelation,
        engineAgreementPct: agreementPct,
        timingAnomaly,
        accountPattern,
        riskScore: compositeRisk,
        status: "needs_review",
        moderatorNotes: `Flagged with ${agreementPct}% engine agreement over ${nonBookMoves.length} non-book moves.`,
      },
      { upsert: true, new: true },
    );
  }
}
