import type { EngineEvaluation } from "@/types/ai";

/**
 * Formats a raw numeric score and mate into standard ChessVerse evaluation display string:
 * e.g. +0.8, -1.4, +M3, -M2, 0.0 (R5.7)
 */
export function formatEvaluationDisplay(
  scorePawns: number,
  mateInMoves?: number | null,
): string {
  if (mateInMoves !== undefined && mateInMoves !== null && mateInMoves !== 0) {
    return mateInMoves > 0 ? `+M${mateInMoves}` : `-M${Math.abs(mateInMoves)}`;
  }

  const rounded = parseFloat(scorePawns.toFixed(1));
  if (Math.abs(rounded) === 0 || rounded === 0) {
    return "0.0";
  }

  return rounded > 0 ? `+${rounded.toFixed(1)}` : `${rounded.toFixed(1)}`;
}

/**
 * Calculates White height percentage (0 to 100) for the vertical evaluation bar (R5.6)
 * Uses a smooth logistic curve to prevent clipping while maintaining sensitivity around +/- 2 pawns.
 */
export function calculateEvaluationBarPercentage(
  scorePawns: number,
  mateInMoves?: number | null,
): number {
  if (mateInMoves !== undefined && mateInMoves !== null && mateInMoves !== 0) {
    return mateInMoves > 0 ? 100 : 0;
  }

  // Sigmoid / logistic function centered at 0 with sensitivity factor 0.35
  // score = +3 -> ~85%
  // score = -3 -> ~15%
  // score = 0  -> 50%
  const clamped = Math.max(-20, Math.min(20, scorePawns));
  const probability = 1 / (1 + Math.exp(-0.38 * clamped));
  const pct = probability * 100;
  return Math.max(3, Math.min(97, parseFloat(pct.toFixed(1))));
}

/**
 * Generates descriptive interpretation of the engine evaluation without claiming absolute certainty (R5.7, R5.52).
 */
export function getAdvantageDescription(
  scorePawns: number,
  mateInMoves?: number | null,
): string {
  if (mateInMoves !== undefined && mateInMoves !== null && mateInMoves !== 0) {
    return mateInMoves > 0
      ? `Forced checkmate in ${mateInMoves} moves for White`
      : `Forced checkmate in ${Math.abs(mateInMoves)} moves for Black`;
  }

  if (Math.abs(scorePawns) <= 0.25) return "Equal position";
  if (scorePawns > 3.0) return "Decisive white advantage";
  if (scorePawns > 1.2) return "Moderate white advantage";
  if (scorePawns > 0.25) return "Slight white advantage";
  if (scorePawns < -3.0) return "Decisive black advantage";
  if (scorePawns < -1.2) return "Moderate black advantage";
  return "Slight black advantage";
}

/**
 * Creates a complete EngineEvaluation object from numeric centipawns or mate.
 */
export function createEngineEvaluation(
  centipawns: number,
  mateInMoves?: number | null,
  depth = 18,
): EngineEvaluation {
  const scorePawns = centipawns / 100;
  const display = formatEvaluationDisplay(scorePawns, mateInMoves);
  const advantageText = getAdvantageDescription(scorePawns, mateInMoves);

  return {
    type: mateInMoves ? "mate" : "cp",
    value: mateInMoves ?? centipawns,
    depth,
    display,
    numericScore: parseFloat(scorePawns.toFixed(2)),
    advantageText,
  };
}
