export type EvaluationType = "cp" | "mate";

export interface EngineEvaluation {
  type: EvaluationType;
  value: number; // Centipawns if type === "cp", Moves if type === "mate"
  depth: number;
  display: string; // e.g. "+0.8", "-1.4", "+M3", "-M2", "0.0"
  numericScore: number; // Normalized pawns for plotting/graphing
  advantageText: string;
}

export type MoveQuality =
  | "brilliant"
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder"
  | "missed_opportunity";

export type MoveQualityIndicator = "★" | "✓" | "!" | "?" | "??" | "✕";

export type TacticalMotif =
  | "fork"
  | "pin"
  | "skewer"
  | "discovered_attack"
  | "double_attack"
  | "back_rank"
  | "hanging_piece"
  | "deflection"
  | "overloading";

export interface TacticalPattern {
  type: TacticalMotif;
  title: string;
  description: string;
  squares: string[];
}

export interface AlternativeLine {
  san: string;
  uci: string;
  moves: string[];
  eval: number;
}

export interface PositionAnalysis {
  fen: string;
  beforeFen?: string;
  moveNumber: number;
  color: "white" | "black";
  playedMove: string;
  playedMoveUci?: string;
  bestMove: string;
  bestMoveSan?: string;
  alternativeMove?: string;
  alternativeMoveSan?: string;
  alternativeLine?: string[];
  evaluationBefore: number;
  evaluationAfter: number;
  evalDisplay: string;
  centipawnLoss: number;
  classification: MoveQuality;
  qualityIndicator: MoveQualityIndicator;
  whyExplanation: string;
  commentary?: string;
  tacticalIdea?: string;
  tacticalMotif?: TacticalPattern;
  missedOpportunity?: {
    continuation: string;
    explanation: string;
  };
  isCriticalMoment?: boolean;
  criticalReason?: string;
  openingName?: string;
}

export interface GameOpeningInfo {
  name: string;
  variation?: string;
  eco?: string;
  confidence: number;
}

export interface CriticalMoment {
  moveNumber: number;
  title: string;
  description: string;
  fen: string;
  classification: MoveQuality;
  playedMove: string;
  bestMove: string;
}

export interface GameAnalysis {
  gameId: string;
  whiteAccuracy: number;
  blackAccuracy: number;
  accuracyMetricDisclaimer: string; // "ChessVerse analysis metric, not an official universal chess rating"
  opening: GameOpeningInfo;
  summary: string;
  turningPoints: {
    moveNumber: number;
    color: "white" | "black";
    swing: number;
    description: string;
  }[];
  criticalMoments: CriticalMoment[];
  moves: PositionAnalysis[];
  classificationCounts: {
    white: Record<MoveQuality, number>;
    black: Record<MoveQuality, number>;
  };
  generatedAt: string;
}

export type ExplanationLevel = "beginner" | "intermediate" | "advanced";

export interface AICoachMessage {
  id: string;
  sender: "user" | "coach";
  text: string;
  timestamp: number;
  suggestedQuestions?: string[];
}

export type AIDifficulty = "beginner" | "intermediate" | "advanced" | "expert";

export interface AIOpponentConfig {
  difficulty: AIDifficulty;
  userColor: "white" | "black" | "random";
  timeControl: {
    initialTime: number; // in seconds
    increment: number;   // in seconds
    label: string;
  };
}

export interface AIPuzzle {
  id: string;
  gameId?: string;
  title: string;
  fen: string;
  sideToMove: "white" | "black";
  targetMoveUci: string;
  solutionSan: string[];
  motif: TacticalMotif;
  difficulty: AIDifficulty;
  description: string;
  explanation: string;
}

export interface PlayerAIInsights {
  recentAccuracyAvg: number;
  totalGamesAnalyzed: number;
  commonMistakesByPhase: {
    opening: number;
    middlegame: number;
    endgame: number;
  };
  openingPerformance: {
    name: string;
    gamesCount: number;
    winRate: number;
    accuracyAvg: number;
  }[];
  tacticalMotifsEncountered: {
    motif: TacticalMotif;
    count: number;
    missedCount: number;
  }[];
  recommendedPractice: {
    title: string;
    focus: string;
    reason: string;
  }[];
}
