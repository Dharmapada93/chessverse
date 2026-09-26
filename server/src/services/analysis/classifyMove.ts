import type { MoveClassification } from "../../types/analysis.js";

export type ContextualMoveInput = {
  playedMoveSan: string;
  playedMoveUci: string;
  bestMoveUci: string;
  evalBefore: number; // White perspective (+ is white advantage, - is black)
  evalAfter: number;  // White perspective
  color: "white" | "black";
  isSacrifice?: boolean;
  isCheck?: boolean;
  gamePhase?: "opening" | "middlegame" | "endgame";
};

export type MoveClassificationResult = {
  classification: MoveClassification;
  centipawnLoss: number;
  accuracyScore: number;
  commentary?: string;
};

/**
 * Classifies a move contextually based on evaluation swing, player perspective,
 * tactical significance, and game state.
 */
export function classifyMove(input: ContextualMoveInput): MoveClassificationResult {
  const {
    playedMoveSan,
    playedMoveUci,
    bestMoveUci,
    evalBefore,
    evalAfter,
    color,
    isSacrifice = false,
  } = input;

  // Calculate evaluation swing from the perspective of the player who moved
  const playerEvalBefore = color === "white" ? evalBefore : -evalBefore;
  const playerEvalAfter = color === "white" ? evalAfter : -evalAfter;

  // Evaluation drop: positive means player lost advantage
  const evalLoss = Math.max(0, playerEvalBefore - playerEvalAfter);
  const centipawnLoss = Math.round(evalLoss * 100);

  // Single-move accuracy score (0 to 100) based on sigmoid loss curve
  const accuracyScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(100 / (1 + Math.pow(centipawnLoss / 80, 2))),
    ),
  );

  const isEngineBest =
    playedMoveUci.toLowerCase() === bestMoveUci.toLowerCase() ||
    centipawnLoss <= 8;

  // 1. Brilliant move criteria:
  // Must be best move, involved a piece sacrifice, and keeps significant advantage
  if (
    isEngineBest &&
    isSacrifice &&
    playerEvalAfter >= 1.0 &&
    centipawnLoss <= 5
  ) {
    return {
      classification: "brilliant",
      centipawnLoss,
      accuracyScore: 100,
      commentary: `Brilliant sacrifice! ${playedMoveSan} unleashes decisive initiative.`,
    };
  }

  // 2. Best move
  if (isEngineBest) {
    return {
      classification: "best",
      centipawnLoss: 0,
      accuracyScore: 100,
      commentary: `${playedMoveSan} is the optimal move found by the engine.`,
    };
  }

  // 3. Missed Opportunity:
  // Player had a winning advantage (> +2.0) and lost at least 150cp, letting advantage slip
  if (playerEvalBefore >= 2.0 && playerEvalAfter <= 0.5 && centipawnLoss >= 150) {
    return {
      classification: "missed_opportunity",
      centipawnLoss,
      accuracyScore,
      commentary: `Missed opportunity: you allowed your opponent back into the game. Better was ${bestMoveUci}.`,
    };
  }

  // 4. Excellent: Minimal loss
  if (centipawnLoss <= 25) {
    return {
      classification: "excellent",
      centipawnLoss,
      accuracyScore,
      commentary: `${playedMoveSan} is a very strong and precise move.`,
    };
  }

  // 5. Good: Reasonable move
  if (centipawnLoss <= 60) {
    return {
      classification: "good",
      centipawnLoss,
      accuracyScore,
      commentary: `${playedMoveSan} maintains a solid position.`,
    };
  }

  // 6. Inaccuracy
  if (centipawnLoss <= 120) {
    return {
      classification: "inaccuracy",
      centipawnLoss,
      accuracyScore,
      commentary: `${playedMoveSan} is slightly inaccurate. Consider ${bestMoveUci} instead.`,
    };
  }

  // 7. Mistake
  if (centipawnLoss <= 200) {
    return {
      classification: "mistake",
      centipawnLoss,
      accuracyScore,
      commentary: `${playedMoveSan} is a mistake that loses significant advantage. Better was ${bestMoveUci}.`,
    };
  }

  // 8. Blunder
  return {
    classification: "blunder",
    centipawnLoss,
    accuracyScore,
    commentary: `${playedMoveSan} is a serious blunder that changes the outcome. Best continuation was ${bestMoveUci}.`,
  };
}

/**
 * Computes overall game accuracy percentage for a player given their move scores.
 */
export function calculateOverallAccuracy(accuracyScores: number[]): number {
  if (accuracyScores.length === 0) return 100;
  const avg =
    accuracyScores.reduce((acc, s) => acc + s, 0) / accuracyScores.length;
  return parseFloat(Math.max(0, Math.min(100, avg)).toFixed(1));
}
