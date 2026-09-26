export type MoveClassification =
  | "brilliant"
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder"
  | "missed_opportunity";

export type AnalyzedMove = {
  moveNumber: number;
  color: "white" | "black";
  playedMove: string;
  playedMoveUci?: string;
  bestMove: string;
  evaluationBefore: number;
  evaluationAfter: number;
  centipawnLoss: number;
  classification: MoveClassification;
  fen: string;
  beforeFen?: string;
  advantageText?: string;
  pv?: string[];
  commentary?: string;
};

export type KeyMoment = {
  moveNumber: number;
  color: "white" | "black";
  playedMove: string;
  bestMove: string;
  evaluationBefore: number;
  evaluationAfter: number;
  classification: MoveClassification;
  commentary?: string;
  fen?: string;
};

export type ClassificationCounts = {
  brilliant: number;
  best: number;
  excellent: number;
  good: number;
  inaccuracy: number;
  mistake: number;
  blunder: number;
  missed_opportunity: number;
};

export type GameAnalysisResult = {
  gameId: string;
  whiteAccuracy: number;
  blackAccuracy: number;
  moves: AnalyzedMove[];
  keyMoments: KeyMoment[];
  whiteCounts: ClassificationCounts;
  blackCounts: ClassificationCounts;
  summary?: string;
};
