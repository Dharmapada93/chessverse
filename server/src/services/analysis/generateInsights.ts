import type {
  AnalyzedMove,
  ClassificationCounts,
  KeyMoment,
} from "../../types/analysis.js";

export type GameInsights = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  turningPoints: {
    moveNumber: number;
    color: "white" | "black";
    swing: number;
    description: string;
  }[];
};

export function generateGameInsights(
  moves: AnalyzedMove[],
  whiteAccuracy: number,
  blackAccuracy: number,
  whiteCounts: ClassificationCounts,
  blackCounts: ClassificationCounts,
): GameInsights {
  const turningPoints: {
    moveNumber: number;
    color: "white" | "black";
    swing: number;
    description: string;
  }[] = [];

  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    if (m.classification === "blunder" || m.classification === "missed_opportunity") {
      const swing = m.centipawnLoss / 100;
      turningPoints.push({
        moveNumber: m.moveNumber,
        color: m.color,
        swing,
        description: `Move ${Math.ceil(m.moveNumber / 2)} (${m.color}): ${m.playedMove} lost ${swing.toFixed(1)} pawns. Best move was ${m.bestMove}.`,
      });
    }
  }

  const whiteBlunders = whiteCounts.blunder + whiteCounts.mistake;
  const blackBlunders = blackCounts.blunder + blackCounts.mistake;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (whiteAccuracy >= 85) {
    strengths.push("White demonstrated grandmaster-level opening precision and piece coordination.");
  } else if (whiteAccuracy >= 70) {
    strengths.push("White maintained solid tactical vigilance in the early game.");
  }

  if (blackAccuracy >= 85) {
    strengths.push("Black showed deep positional defense and active counter-play.");
  } else if (blackAccuracy >= 70) {
    strengths.push("Black capitalized on opportunities and controlled key central squares.");
  }

  if (whiteBlunders > 0) {
    weaknesses.push(`White conceded ${whiteBlunders} tactical mistakes/blunders under pressure.`);
    recommendations.push("White: Check opponent forcing replies (checks, captures, threats) before committing moves.");
  }

  if (blackBlunders > 0) {
    weaknesses.push(`Black allowed ${blackBlunders} key tactical turnarounds.`);
    recommendations.push("Black: Practice tactical awareness and king safety in the middlegame.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Review opening theory and endgame conversion technique.");
  }

  const summary = `White played with ${whiteAccuracy}% accuracy, while Black played with ${blackAccuracy}% accuracy. ` +
    (turningPoints.length > 0
      ? `The critical turning point occurred at move ${Math.ceil(turningPoints[0].moveNumber / 2)}, where ${turningPoints[0].color} played ${moves[turningPoints[0].moveNumber - 1]?.playedMove}.`
      : "The game was balanced with accurate play from both sides.");

  return {
    summary,
    strengths,
    weaknesses,
    recommendations,
    turningPoints,
  };
}
