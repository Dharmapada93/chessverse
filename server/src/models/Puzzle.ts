import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IPuzzle extends Document {
  sourceGameId?: mongoose.Types.ObjectId;
  fen: string;
  solution?: string;
  moves: string[];
  theme?: string;
  themes: string[];
  difficulty: number;
  rating: number;
  popularity: number;
  title?: string;
  createdAt: Date;
}

const puzzleSchema = new Schema<IPuzzle>(
  {
    sourceGameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
    },

    fen: {
      type: String,
      required: true,
    },

    solution: {
      type: String,
    },

    moves: {
      type: [String],
      default: [],
    },

    theme: {
      type: String,
      default: "tactics",
    },

    themes: {
      type: [String],
      default: ["tactics"],
    },

    difficulty: {
      type: Number,
      default: 1,
    },

    rating: {
      type: Number,
      default: 1200,
    },

    popularity: {
      type: Number,
      default: 0,
    },

    title: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Puzzle =
  mongoose.models.Puzzle ||
  mongoose.model<IPuzzle>(
    "Puzzle",
    puzzleSchema,
  );
