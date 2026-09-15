import {
  Schema,
  model,
  models,
  type Document,
} from "mongoose";

export interface IGameAnalysis extends Document {
  gameId: string;
  whiteAccuracy: number;
  blackAccuracy: number;

  keyMoments: {
    moveNumber: number;
    color:
      | "white"
      | "black";
    fen: string;
    playedMove: string;
    bestMove?: string;
    evaluationBefore?: number;
    evaluationAfter?: number;
    classification:
      | "excellent"
      | "good"
      | "inaccuracy"
      | "mistake"
      | "blunder";
  }[];

  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const gameAnalysisSchema =
  new Schema<IGameAnalysis>(
    {
      gameId: {
        type: String,
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

      keyMoments: [
        {
          moveNumber: Number,
          color: {
            type: String,
            enum: [
              "white",
              "black",
            ],
          },
          fen: String,
          playedMove: String,
          bestMove: String,
          evaluationBefore: Number,
          evaluationAfter: Number,
          classification: {
            type: String,
            enum: [
              "excellent",
              "good",
              "inaccuracy",
              "mistake",
              "blunder",
            ],
          },
        },
      ],

      summary: String,
    },
    {
      timestamps: true,
    },
  );

export const GameAnalysis =
  models.GameAnalysis ||
  model<IGameAnalysis>(
    "GameAnalysis",
    gameAnalysisSchema,
  );
