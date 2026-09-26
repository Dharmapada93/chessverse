import mongoose from "mongoose";
import { Chess, type Square } from "chess.js";
import { Game } from "../../models/Game.js";
import { GameAnalysis, type IGameAnalysis } from "../../models/GameAnalysis.js";
import {
  getStockfishService,
  type AnalysisDepthLevel,
} from "../stockfish/StockfishService.js";
import {
  classifyMove,
  calculateOverallAccuracy,
} from "./classifyMove.js";
import { generateGameInsights } from "./generateInsights.js";
import type {
  AnalyzedMove,
  ClassificationCounts,
  KeyMoment,
} from "../../types/analysis.js";

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

function calculateMaterial(chess: Chess) {
  let white = 0;
  let black = 0;
  for (const row of chess.board()) {
    for (const square of row) {
      if (square) {
        const val = PIECE_VALUES[square.type] || 0;
        if (square.color === "w") white += val;
        else black += val;
      }
    }
  }
  return { white, black };
}

export async function analyzeGame(
  gameId: string,
  depthLevel: AnalysisDepthLevel | number = "normal",
): Promise<IGameAnalysis> {
  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    throw new Error("Invalid game ID");
  }

  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  if (!game.moves || game.moves.length === 0) {
    throw new Error("Game has no moves to analyze");
  }

  const stockfish = getStockfishService();
  const chess = new Chess(game.initialFen || undefined);

  const analyzedMoves: AnalyzedMove[] = [];
  const whiteAccuracyScores: number[] = [];
  const blackAccuracyScores: number[] = [];

  const emptyCounts = (): ClassificationCounts => ({
    brilliant: 0,
    best: 0,
    excellent: 0,
    good: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
    missed_opportunity: 0,
  });

  const whiteCounts = emptyCounts();
  const blackCounts = emptyCounts();

  // Evaluate initial position before any moves
  let currentEval = await stockfish.analyze(chess.fen(), depthLevel);

  for (let index = 0; index < game.moves.length; index++) {
    const storedMove = game.moves[index];
    const beforeFen = chess.fen();
    const evalBefore = currentEval.evaluation;
    const materialBefore = calculateMaterial(chess);

    // Apply move to chess.js
    const move = chess.move({
      from: storedMove.from,
      to: storedMove.to,
      promotion: storedMove.promotion,
    });

    if (!move) {
      continue;
    }

    const afterFen = chess.fen();
    const materialAfter = calculateMaterial(chess);
    const color: "white" | "black" = move.color === "w" ? "white" : "black";

    // Analyze position after move
    const afterAnalysis = await stockfish.analyze(afterFen, depthLevel);
    const evalAfter = afterAnalysis.evaluation;

    // Detect potential sacrifice (lost piece material without capturing equal value)
    const materialLost =
      color === "white"
        ? materialBefore.white - materialAfter.white
        : materialBefore.black - materialAfter.black;
    const isSacrifice = materialLost >= 2 && !chess.isCheckmate();

    // Determine game phase
    const totalMaterial = materialAfter.white + materialAfter.black;
    let gamePhase: "opening" | "middlegame" | "endgame" = "middlegame";
    if (index < 16) gamePhase = "opening";
    else if (totalMaterial <= 26) gamePhase = "endgame";

    // Classify move
    const playedUci = `${storedMove.from}${storedMove.to}${storedMove.promotion || ""}`;
    const bestMoveUci = currentEval.bestMove;

    const classificationResult = classifyMove({
      playedMoveSan: move.san,
      playedMoveUci: playedUci,
      bestMoveUci,
      evalBefore,
      evalAfter,
      color,
      isSacrifice,
      isCheck: chess.isCheck(),
      gamePhase,
    });

    const analyzedMove: AnalyzedMove = {
      moveNumber: index + 1,
      color,
      playedMove: move.san,
      playedMoveUci: playedUci,
      bestMove: bestMoveUci,
      evaluationBefore: evalBefore,
      evaluationAfter: evalAfter,
      centipawnLoss: classificationResult.centipawnLoss,
      classification: classificationResult.classification,
      fen: afterFen,
      beforeFen,
      advantageText: afterAnalysis.advantageText,
      pv: afterAnalysis.principalVariation,
      commentary: classificationResult.commentary,
    };

    analyzedMoves.push(analyzedMove);

    if (color === "white") {
      whiteAccuracyScores.push(classificationResult.accuracyScore);
      whiteCounts[classificationResult.classification]++;
    } else {
      blackAccuracyScores.push(classificationResult.accuracyScore);
      blackCounts[classificationResult.classification]++;
    }

    // Advance current eval to the after position
    currentEval = afterAnalysis;
  }

  const whiteAccuracy = calculateOverallAccuracy(whiteAccuracyScores);
  const blackAccuracy = calculateOverallAccuracy(blackAccuracyScores);

  // Key moments: Brilliant, Mistakes, Blunders, Missed opportunities, and Best moves in critical positions
  const keyMoments: KeyMoment[] = analyzedMoves
    .filter(
      (m) =>
        m.classification === "blunder" ||
        m.classification === "mistake" ||
        m.classification === "brilliant" ||
        m.classification === "missed_opportunity",
    )
    .map((m) => ({
      moveNumber: m.moveNumber,
      color: m.color,
      playedMove: m.playedMove,
      bestMove: m.bestMove,
      evaluationBefore: m.evaluationBefore,
      evaluationAfter: m.evaluationAfter,
      classification: m.classification,
      commentary: m.commentary,
      fen: m.beforeFen || m.fen,
    }));

  const insights = generateGameInsights(
    analyzedMoves,
    whiteAccuracy,
    blackAccuracy,
    whiteCounts,
    blackCounts,
  );

  const analysis = await GameAnalysis.findOneAndUpdate(
    { gameId: new mongoose.Types.ObjectId(gameId) },
    {
      gameId: new mongoose.Types.ObjectId(gameId),
      whiteAccuracy,
      blackAccuracy,
      depth: typeof depthLevel === "number" ? depthLevel : 18,
      moves: analyzedMoves,
      keyMoments,
      whiteCounts,
      blackCounts,
      summary: insights.summary,
      generatedAt: new Date(),
    },
    {
      new: true,
      upsert: true,
    },
  );

  return analysis;
}
