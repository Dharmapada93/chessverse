import { GameAnalysis } from "../models/GameAnalysis.js";
import { Puzzle } from "../models/Puzzle.js";
import type { AnalyzedMove } from "../types/analysis.js";

export async function generatePuzzleFromGame(
  gameId: string,
) {
  const analysis =
    await GameAnalysis.findOne({
      gameId,
    });

  if (!analysis) {
    throw new Error(
      "Game must be analyzed first",
    );
  }

  const candidate =
    analysis.moves.find(
      (move: AnalyzedMove) =>
        move.classification === "blunder" ||
        move.classification === "mistake",
    );

  if (!candidate) {
    throw new Error(
      "No suitable tactical mistake found",
    );
  }

  const puzzle = await Puzzle.create({
    sourceGameId: gameId,
    fen: candidate.fen,
    solution: candidate.bestMove,
    theme: "tactics",
    difficulty:
      candidate.classification === "blunder"
        ? 3
        : 2,
    rating:
      candidate.classification === "blunder"
        ? 1200
        : 1000,
  });

  return puzzle;
}
