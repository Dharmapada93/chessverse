import { getStockfishService } from "./stockfish/StockfishService.js";

export type StockfishResult = {
  evaluation: number;
  bestMove: string;
};

export async function analyzePosition(
  fen: string,
  depth = 14,
): Promise<StockfishResult> {
  const service = getStockfishService();
  const analysis = await service.analyze(fen, depth);
  return {
    evaluation: analysis.evaluation,
    bestMove: analysis.bestMove,
  };
}
