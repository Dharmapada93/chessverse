import mongoose from "mongoose";
import { Game } from "../../models/Game.js";
import { GameAnalysis } from "../../models/GameAnalysis.js";

export type WeaknessBreakdown = {
  kingSafety: number; // percentage
  endgames: number;
  tactics: number;
  opening: number;
  other: number;
  totalMistakes: number;
  recurringPatterns: string[];
};

export async function detectPlayerWeaknesses(
  userId: string,
): Promise<WeaknessBreakdown> {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    // Default demo values grounded in chess patterns
    return {
      kingSafety: 40,
      endgames: 25,
      tactics: 15,
      opening: 10,
      other: 10,
      totalMistakes: 12,
      recurringPatterns: [
        "Uncastled king exposed to central diagonal checks",
        "Passive rook placement in 4-rook endgames",
        "Hanging pieces in sharp tactical exchanges",
      ],
    };
  }

  // Find user's recent games
  const games = await Game.find({
    $or: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
    status: "finished",
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  if (games.length === 0) {
    return {
      kingSafety: 35,
      endgames: 25,
      tactics: 20,
      opening: 10,
      other: 10,
      totalMistakes: 0,
      recurringPatterns: ["No games analyzed yet - play games to calibrate!"],
    };
  }

  const gameIds = games.map((g) => g._id);
  const analyses = await GameAnalysis.find({
    gameId: { $in: gameIds },
  }).lean();

  let kingSafetyErrors = 0;
  let endgameErrors = 0;
  let tacticsErrors = 0;
  let openingErrors = 0;
  let otherErrors = 0;
  const patternsSet = new Set<string>();

  for (const analysis of analyses) {
    // Determine which color the user played in this game
    const game = games.find((g) => g._id.toString() === analysis.gameId.toString());
    const isUserWhite = game?.whitePlayerId?.toString() === userId;
    const userColor = isUserWhite ? "white" : "black";

    const userMistakes = (analysis.moves || []).filter(
      (m: any) =>
        m.color === userColor &&
        (m.classification === "blunder" ||
          m.classification === "mistake" ||
          m.classification === "missed_opportunity"),
    );

    for (const m of userMistakes) {
      const moveNum = Math.ceil(m.moveNumber / 2);
      const isEarly = moveNum <= 10;
      const isLate = moveNum >= 35;

      if (isEarly) {
        openingErrors++;
        patternsSet.add("Early opening inaccuracies allowing center control");
      } else if (isLate) {
        endgameErrors++;
        patternsSet.add("Endgame technique and king activation");
      } else {
        // Middlegame
        if (m.centipawnLoss >= 250) {
          tacticsErrors++;
          patternsSet.add("Middlegame tactical blunders under pressure");
        } else {
          kingSafetyErrors++;
          patternsSet.add("King safety and undefended square complexes");
        }
      }
    }
  }

  const total =
    kingSafetyErrors + endgameErrors + tacticsErrors + openingErrors + otherErrors;

  if (total === 0) {
    return {
      kingSafety: 40,
      endgames: 25,
      tactics: 15,
      opening: 10,
      other: 10,
      totalMistakes: 0,
      recurringPatterns: ["Solid accuracy - maintain calculation vigilance!"],
    };
  }

  const toPct = (val: number) => Math.max(5, Math.round((val / total) * 100));

  return {
    kingSafety: toPct(kingSafetyErrors),
    endgames: toPct(endgameErrors),
    tactics: toPct(tacticsErrors),
    opening: toPct(openingErrors),
    other: toPct(otherErrors),
    totalMistakes: total,
    recurringPatterns: Array.from(patternsSet).slice(0, 4),
  };
}
