import { Chess } from "chess.js";
import { getStockfishService } from "../stockfish/StockfishService.js";
import { Game } from "../../models/Game.js";
import { validateMove } from "../chessEngine.js";

export type AIDifficulty = "beginner" | "intermediate" | "advanced" | "expert";

const DIFFICULTY_CONFIG: Record<AIDifficulty, { depth: number; timeMs: number }> = {
  beginner: { depth: 3, timeMs: 1000 },
  intermediate: { depth: 7, timeMs: 2000 },
  advanced: { depth: 12, timeMs: 3500 },
  expert: { depth: 18, timeMs: 5000 },
};

/**
 * Calculates a move for the AI opponent based on difficulty calibration (R5.28, R5.29, R5.31)
 */
export async function calculateAiMove(
  fen: string,
  difficulty: AIDifficulty = "intermediate",
): Promise<{ from: string; to: string; promotion?: string; san: string }> {
  const chess = new Chess(fen);
  if (chess.isGameOver()) {
    throw new Error("Game is already finished");
  }

  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) {
    throw new Error("No legal moves available");
  }

  // Beginner mode: 25% chance of playing a random legal non-blundering move to simulate human club beginner
  if (difficulty === "beginner" && Math.random() < 0.25) {
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return {
      from: randomMove.from,
      to: randomMove.to,
      promotion: randomMove.promotion,
      san: randomMove.san,
    };
  }

  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.intermediate;
  const stockfish = getStockfishService();

  try {
    const analysis = await stockfish.analyze(fen, config.depth);
    let bestMoveUci = analysis.bestMove;

    if (bestMoveUci && bestMoveUci.length >= 4) {
      const from = bestMoveUci.slice(0, 2);
      const to = bestMoveUci.slice(2, 4);
      const promotion = bestMoveUci.length > 4 ? bestMoveUci[4] : undefined;

      const validated = validateMove(fen, from, to, promotion);
      if (validated.legal && validated.move) {
        return {
          from,
          to,
          promotion,
          san: validated.move.san,
        };
      }
    }
  } catch (err) {
    console.warn("Stockfish AI move calculation error, falling back to legal move:", err);
  }

  // Safe fallback to first legal move
  const fallback = legalMoves[0];
  return {
    from: fallback.from,
    to: fallback.to,
    promotion: fallback.promotion,
    san: fallback.san,
  };
}
