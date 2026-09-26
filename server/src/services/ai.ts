import type { IGameAnalysis } from "../models/GameAnalysis.js";

export type AIReview = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
};

export async function generateGameReview(
  analysis: IGameAnalysis,
): Promise<AIReview> {
  const blunders = analysis.moves.filter(
    (move) => move.classification === "blunder",
  );

  const mistakes = analysis.moves.filter(
    (move) => move.classification === "mistake",
  );

  const inaccuracies = analysis.moves.filter(
    (move) => move.classification === "inaccuracy",
  );

  return {
    summary:
      `White accuracy was ${analysis.whiteAccuracy}% ` +
      `and Black accuracy was ${analysis.blackAccuracy}%. ` +
      `The game contained ${blunders.length} blunders, ` +
      `${mistakes.length} mistakes, and ` +
      `${inaccuracies.length} inaccuracies.`,

    strengths: [
      "Review your accurate moves and identify the plans behind them.",
    ],

    weaknesses: [
      blunders.length > 0
        ? "Tactical awareness needs attention."
        : "No major tactical blunders were detected.",
    ],

    recommendations: [
      "Review the key moments from the game.",
      "Practice positions similar to your mistakes.",
    ],
  };
}

type ExplainMoveInput = {
  fen: string;
  move: string;
  bestMove?: string;
  evaluationBefore?: number;
  evaluationAfter?: number;
};

export async function explainMove(input: ExplainMoveInput) {
  const { fen, move, bestMove, evaluationBefore, evaluationAfter } = input;

  return {
    explanation:
      `The move ${move} changes the position significantly. ` +
      `The engine's preferred continuation is ${
        bestMove ?? "not available"
      }. ` +
      `The evaluation changed from ${
        evaluationBefore ?? "unknown"
      } to ${
        evaluationAfter ?? "unknown"
      }.`,
    fen,
    move,
  };
}
