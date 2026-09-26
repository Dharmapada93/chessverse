export type PlayerTrainingData = {
  rating: number;
  puzzleRating: number;
  commonMistakes: string[];
  weakOpenings: string[];
  tacticalPatterns: string[];
  endgamePerformance: number;
  recentGames: number;
  weaknessPercentages?: {
    kingSafety: number;
    endgames: number;
    tactics: number;
    opening: number;
    other: number;
  };
};

export type TrainingRecommendation = {
  category: string;
  reason: string;
  exercises: number;
  priority: number;
  durationMinutes: number;
};

export function generateRecommendations(
  data: PlayerTrainingData,
): TrainingRecommendation[] {
  const recommendations: TrainingRecommendation[] = [];
  const pcts = data.weaknessPercentages || {
    kingSafety: 40,
    endgames: 25,
    tactics: 15,
    opening: 10,
    other: 10,
  };

  // 1. King safety
  if (pcts.kingSafety >= 25) {
    recommendations.push({
      category: "King Safety",
      reason: `King safety represents ${pcts.kingSafety}% of your recent inaccuracies. Prioritize castling and avoid premature pawn pushes around your monarch.`,
      exercises: 5,
      priority: 1,
      durationMinutes: 15,
    });
  }

  // 2. Tactical & Back-rank patterns
  if (pcts.tactics >= 15 || data.tacticalPatterns.length > 0) {
    recommendations.push({
      category: "Back-Rank Tactics",
      reason: "Sharp tactical complications and back-rank vulnerabilities caused critical turning points.",
      exercises: 8,
      priority: 2,
      durationMinutes: 10,
    });
  }

  // 3. Endgame technique
  if (pcts.endgames >= 20 || data.endgamePerformance < 75) {
    recommendations.push({
      category: "Endgame Technique",
      reason: `Endgame play accounts for ${pcts.endgames}% of your drop in win conversion. Train king activation and passed pawn pushes.`,
      exercises: 3,
      priority: 3,
      durationMinutes: 15,
    });
  }

  // 4. Opening review
  recommendations.push({
    category: "Opening Review",
    reason: data.weakOpenings.length > 0
      ? `Revisit key branch points in ${data.weakOpenings[0]}.`
      : "Solidify central development in the Italian Game & Sicilian Defense.",
    exercises: 4,
    priority: 4,
    durationMinutes: 10,
  });

  // Sort by priority ascending
  return recommendations.sort((a, b) => a.priority - b.priority);
}
