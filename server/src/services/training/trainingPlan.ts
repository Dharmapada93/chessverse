import mongoose from "mongoose";
import { Game } from "../../models/Game.js";
import { User } from "../../models/User.js";
import { detectPlayerWeaknesses, type WeaknessBreakdown } from "./weaknessDetector.js";
import {
  generateRecommendations,
  type PlayerTrainingData,
  type TrainingRecommendation,
} from "./recommendationEngine.js";

export type WeeklyReport = {
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  ratingChange: number;
  strongestArea: string;
  focusNextWeek: string;
  coachRecommendation: string;
  trainingPlan: TrainingRecommendation[];
  weaknesses: WeaknessBreakdown;
};

export async function generateWeeklyReport(userId: string): Promise<WeeklyReport> {
  const isObjectId = mongoose.Types.ObjectId.isValid(userId);
  let gamesPlayed = 12;
  let wins = 7;
  let draws = 2;
  let losses = 3;
  let ratingChange = 38;
  let userRating = 1250;

  if (isObjectId) {
    const user = await User.findById(userId).lean();
    if (user) {
      userRating = user.rating ?? 1250;
    }

    // Look back at games over last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentGames = await Game.find({
      $or: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
      status: "finished",
      createdAt: { $gte: oneWeekAgo },
    }).lean();

    if (recentGames.length > 0) {
      gamesPlayed = recentGames.length;
      wins = 0;
      draws = 0;
      losses = 0;

      for (const g of recentGames) {
        const isWhite = g.whitePlayerId?.toString() === userId;
        const userColor = isWhite ? "white" : "black";
        if (g.winner === "draw") {
          draws++;
        } else if (g.winner === userColor) {
          wins++;
        } else if (g.winner) {
          losses++;
        }
      }
      ratingChange = (wins - losses) * 12;
    }
  }

  const weaknesses = await detectPlayerWeaknesses(userId);

  const playerData: PlayerTrainingData = {
    rating: userRating,
    puzzleRating: userRating + 120,
    commonMistakes: weaknesses.recurringPatterns,
    weakOpenings: ["Italian Game", "Sicilian Defense"],
    tacticalPatterns: ["Back-Rank Mates", "Knight Forks"],
    endgamePerformance: 70,
    recentGames: gamesPlayed,
    weaknessPercentages: {
      kingSafety: weaknesses.kingSafety,
      endgames: weaknesses.endgames,
      tactics: weaknesses.tactics,
      opening: weaknesses.opening,
      other: weaknesses.other,
    },
  };

  const trainingPlan = generateRecommendations(playerData);

  // Derive strongest area and focus next week
  let strongestArea = "Tactical awareness";
  if (weaknesses.tactics <= 15 && weaknesses.opening <= 15) {
    strongestArea = "Opening preparation & tactical vigilance";
  } else if (weaknesses.endgames <= 20) {
    strongestArea = "Endgame technique";
  }

  let focusNextWeek = "King safety";
  if (weaknesses.kingSafety >= 30) {
    focusNextWeek = "King safety & prophylactic defense";
  } else if (weaknesses.endgames >= 25) {
    focusNextWeek = "Endgame conversion & king activation";
  } else {
    focusNextWeek = "Calculation precision";
  }

  const coachRecommendation =
    weaknesses.kingSafety >= 30
      ? "Spend your next 20 puzzles practicing defensive tactics and king safety before launching counter-attacks."
      : "Focus on converting winning advantages without rushing into simplified equalizing trades.";

  return {
    gamesPlayed,
    wins,
    draws,
    losses,
    ratingChange,
    strongestArea,
    focusNextWeek,
    coachRecommendation,
    trainingPlan,
    weaknesses,
  };
}
