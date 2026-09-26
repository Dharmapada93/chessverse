import { getSharedStockfishEngine, StockfishEngine } from "./StockfishEngine.js";

export type Evaluation =
  | {
      type: "cp";
      value: number; // Pawns (+0.32 = +0.32 pawns for white, -1.45 = -1.45 pawns for black)
    }
  | {
      type: "mate";
      moves: number; // Positive = white mates in X, Negative = black mates in |X|
    };

export interface EngineAnalysis {
  bestMove: string;
  evaluation: number; // Normalized numeric score (pawns, with large values for mate)
  depth: number;
  principalVariation: string[];
  evaluationDetail: Evaluation;
  advantageText: string;
}

export type AnalysisDepthLevel = "quick" | "normal" | "deep";

export const DEPTH_LEVELS: Record<AnalysisDepthLevel, number> = {
  quick: 12,
  normal: 18,
  deep: 22,
};

export class StockfishService {
  private engine: StockfishEngine;

  constructor(engine?: StockfishEngine) {
    this.engine = engine || getSharedStockfishEngine();
  }

  /**
   * Evaluates a FEN position using Stockfish and returns normalized UCI analysis.
   */
  public async analyze(
    fen: string,
    depth: number | AnalysisDepthLevel = 18,
  ): Promise<EngineAnalysis> {
    const resolvedDepth =
      typeof depth === "string" ? DEPTH_LEVELS[depth] ?? 18 : depth;

    const lines = await this.engine.evaluatePosition(fen, resolvedDepth);
    return this.parseUciOutput(lines, fen, resolvedDepth);
  }

  /**
   * Parse UCI output lines into normalized EngineAnalysis.
   */
  public parseUciOutput(
    lines: string[],
    fen: string,
    depth: number,
  ): EngineAnalysis {
    let bestMove = "";
    let rawScoreCp: number | null = null;
    let rawScoreMate: number | null = null;
    let principalVariation: string[] = [];

    // Check side to move in FEN: rnbqkbnr/... w KQkq - 0 1 -> 'w' or 'b'
    const fenParts = fen.split(" ");
    const isBlackToMove = fenParts[1] === "b";

    for (const line of lines) {
      if (line.startsWith("bestmove")) {
        const parts = line.split(" ");
        bestMove = parts[1] || "";
      }

      // Check info lines for evaluation and PV
      if (line.startsWith("info") && line.includes("score")) {
        const cpMatch = line.match(/score cp (-?\d+)/);
        if (cpMatch) {
          rawScoreCp = parseInt(cpMatch[1], 10);
          rawScoreMate = null;
        }

        const mateMatch = line.match(/score mate (-?\d+)/);
        if (mateMatch) {
          rawScoreMate = parseInt(mateMatch[1], 10);
          rawScoreCp = null;
        }

        const pvIndex = line.indexOf(" pv ");
        if (pvIndex !== -1) {
          const pvString = line.substring(pvIndex + 4).trim();
          if (pvString) {
            principalVariation = pvString.split(/\s+/);
          }
        }
      }
    }

    // Convert engine perspective to White's perspective
    // Stockfish outputs score from the perspective of the side whose turn it is.
    let evaluationDetail: Evaluation;
    let numericScore = 0;

    if (rawScoreMate !== null) {
      const normalizedMate = isBlackToMove ? -rawScoreMate : rawScoreMate;
      evaluationDetail = {
        type: "mate",
        moves: normalizedMate,
      };
      // High numeric value for sorting / graphing (+100 - mateMoves)
      numericScore =
        normalizedMate > 0
          ? 100 - Math.min(normalizedMate, 50)
          : -100 + Math.min(Math.abs(normalizedMate), 50);
    } else {
      const centipawns = rawScoreCp ?? 0;
      const normalizedCp = isBlackToMove ? -centipawns : centipawns;
      const pawnVal = parseFloat((normalizedCp / 100).toFixed(2));
      evaluationDetail = {
        type: "cp",
        value: pawnVal,
      };
      numericScore = pawnVal;
    }

    const advantageText = this.computeAdvantageText(evaluationDetail);

    return {
      bestMove: bestMove || (principalVariation[0] ?? ""),
      evaluation: numericScore,
      depth,
      principalVariation,
      evaluationDetail,
      advantageText,
    };
  }

  /**
   * Convert evaluation into human-meaningful descriptions.
   */
  public computeAdvantageText(evaluation: Evaluation): string {
    if (evaluation.type === "mate") {
      if (evaluation.moves > 0) {
        return `White has forced mate in ${evaluation.moves}`;
      } else {
        return `Black has forced mate in ${Math.abs(evaluation.moves)}`;
      }
    }

    const val = evaluation.value;
    if (val > 3.0) return "Decisive white advantage";
    if (val > 1.5) return "Strong white advantage";
    if (val > 0.5) return "Moderate white advantage";
    if (val > 0.15) return "Slight white advantage";
    if (val >= -0.15) return "Equal position";
    if (val >= -0.5) return "Slight black advantage";
    if (val >= -1.5) return "Moderate black advantage";
    if (val >= -3.0) return "Strong black advantage";
    return "Decisive black advantage";
  }
}

// Global service singleton
let globalServiceInstance: StockfishService | null = null;

export function getStockfishService(): StockfishService {
  if (!globalServiceInstance) {
    globalServiceInstance = new StockfishService();
  }
  return globalServiceInstance;
}
