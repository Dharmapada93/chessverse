import { GameAnalysis } from "../models/GameAnalysis.js";
import { CoachProfile } from "../models/CoachProfile.js";

export async function updateCoachProfile(
  userId: string,
  gameIds: string[],
) {
  const analyses =
    await GameAnalysis.find({
      gameId: { $in: gameIds },
    });

  let blunders = 0;
  let mistakes = 0;
  let inaccuracies = 0;

  for (const analysis of analyses) {
    for (const move of analysis.moves) {
      if (move.classification === "blunder") {
        blunders++;
      }

      if (move.classification === "mistake") {
        mistakes++;
      }

      if (
        move.classification ===
        "inaccuracy"
      ) {
        inaccuracies++;
      }
    }
  }

  const weaknesses: string[] = [];

  if (blunders >= 5) {
    weaknesses.push("Tactical awareness");
  }

  if (mistakes >= 8) {
    weaknesses.push("Calculation accuracy");
  }

  if (inaccuracies >= 10) {
    weaknesses.push("Positional precision");
  }

  const profile =
    await CoachProfile.findOneAndUpdate(
      { userId },
      {
        weaknesses,
        gamesAnalyzed: analyses.length,
        tacticalScore: Math.max(
          0,
          100 - blunders * 4,
        ),
      },
      {
        upsert: true,
        new: true,
      },
    );

  return profile;
}
