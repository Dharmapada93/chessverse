import { Chess } from "chess.js";

type MoveRecord = {
  from: string;
  to: string;
  promotion?: string;
  san: string;
  fen: string;
};

export function classifyMove(
  before: number,
  after: number,
) {
  const loss =
    Math.abs(
      before - after,
    );

  if (loss < 0.2) {
    return "excellent";
  }

  if (loss < 0.5) {
    return "good";
  }

  if (loss < 1) {
    return "inaccuracy";
  }

  if (loss < 2) {
    return "mistake";
  }

  return "blunder";
}

export function calculateAccuracy(
  evaluations: number[],
) {
  if (
    evaluations.length === 0
  ) {
    return 0;
  }

  const totalLoss =
    evaluations.reduce(
      (sum, loss) =>
        sum + Math.min(loss, 3),
      0,
    );

  const averageLoss =
    totalLoss /
    evaluations.length;

  return Math.max(
    0,
    Math.round(
      100 - averageLoss * 18,
    ),
  );
}
