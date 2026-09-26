import type { MoveClassification } from "../types/analysis.js";

export function classifyMove(
  centipawnLoss: number,
): MoveClassification {
  if (centipawnLoss < 20) {
    return "excellent";
  }

  if (centipawnLoss < 50) {
    return "good";
  }

  if (centipawnLoss < 100) {
    return "inaccuracy";
  }

  if (centipawnLoss < 200) {
    return "mistake";
  }

  return "blunder";
}

export function calculateAccuracy(
  losses: number[],
): number {
  if (losses.length === 0) {
    return 100;
  }

  const averageLoss =
    losses.reduce((sum, loss) => sum + loss, 0) /
    losses.length;

  const accuracy = 100 - averageLoss / 10;

  return Math.max(
    0,
    Math.min(100, Number(accuracy.toFixed(1))),
  );
}
