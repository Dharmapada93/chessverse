import mongoose, { Document, Schema } from "mongoose";
import type {
  AnalyzedMove,
  ClassificationCounts,
  KeyMoment,
} from "../types/analysis.js";

export interface IGameAnalysis extends Document {
  gameId: mongoose.Types.ObjectId;
  whiteAccuracy: number;
  blackAccuracy: number;
  depth?: number;
  moves: AnalyzedMove[];
  keyMoments: KeyMoment[];
  whiteCounts?: ClassificationCounts;
  blackCounts?: ClassificationCounts;
  summary?: string;
  generatedAt: Date;
}

const CLASSIFICATION_ENUM = [
  "brilliant",
  "best",
  "excellent",
  "good",
  "inaccuracy",
  "mistake",
  "blunder",
  "missed_opportunity",
];

const analyzedMoveSchema = new Schema<AnalyzedMove>(
  {
    moveNumber: { type: Number, required: true },
    color: {
      type: String,
      enum: ["white", "black"],
      required: true,
    },
    playedMove: { type: String, required: true },
    playedMoveUci: { type: String },
    bestMove: { type: String, required: true },
    evaluationBefore: { type: Number, required: true },
    evaluationAfter: { type: Number, required: true },
    centipawnLoss: { type: Number, required: true },
    classification: {
      type: String,
      enum: CLASSIFICATION_ENUM,
      required: true,
    },
    fen: { type: String, required: true },
    beforeFen: { type: String },
    advantageText: { type: String },
    pv: { type: [String], default: [] },
    commentary: { type: String },
  },
  { _id: false },
);

const keyMomentSchema = new Schema<KeyMoment>(
  {
    moveNumber: { type: Number, required: true },
    color: {
      type: String,
      enum: ["white", "black"],
      required: true,
    },
    playedMove: { type: String, required: true },
    bestMove: { type: String, required: true },
    evaluationBefore: { type: Number, required: true },
    evaluationAfter: { type: Number, required: true },
    classification: {
      type: String,
      enum: CLASSIFICATION_ENUM,
      required: true,
    },
    commentary: { type: String },
    fen: { type: String },
  },
  { _id: false },
);

const countsSchema = new Schema<ClassificationCounts>(
  {
    brilliant: { type: Number, default: 0 },
    best: { type: Number, default: 0 },
    excellent: { type: Number, default: 0 },
    good: { type: Number, default: 0 },
    inaccuracy: { type: Number, default: 0 },
    mistake: { type: Number, default: 0 },
    blunder: { type: Number, default: 0 },
    missed_opportunity: { type: Number, default: 0 },
  },
  { _id: false },
);

const gameAnalysisSchema = new Schema<IGameAnalysis>(
  {
    gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: true,
      unique: true,
      index: true,
    },
    whiteAccuracy: {
      type: Number,
      default: 0,
    },
    blackAccuracy: {
      type: Number,
      default: 0,
    },
    depth: {
      type: Number,
      default: 18,
    },
    moves: {
      type: [analyzedMoveSchema],
      default: [],
    },
    keyMoments: {
      type: [keyMomentSchema],
      default: [],
    },
    whiteCounts: {
      type: countsSchema,
      default: () => ({
        brilliant: 0,
        best: 0,
        excellent: 0,
        good: 0,
        inaccuracy: 0,
        mistake: 0,
        blunder: 0,
        missed_opportunity: 0,
      }),
    },
    blackCounts: {
      type: countsSchema,
      default: () => ({
        brilliant: 0,
        best: 0,
        excellent: 0,
        good: 0,
        inaccuracy: 0,
        mistake: 0,
        blunder: 0,
        missed_opportunity: 0,
      }),
    },
    summary: String,
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
);

export const GameAnalysis =
  mongoose.models.GameAnalysis ||
  mongoose.model<IGameAnalysis>(
    "GameAnalysis",
    gameAnalysisSchema,
  );
