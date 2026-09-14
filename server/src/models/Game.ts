import mongoose, {
  Schema,
  model,
  type Document,
} from "mongoose";

export interface IGame extends Document {
  roomId: string;

  whitePlayerId?: string;
  blackPlayerId?: string;

  whitePlayerName?: string;
  blackPlayerName?: string;

  whiteRating?: number;
  blackRating?: number;

  status:
    | "waiting"
    | "playing"
    | "finished";

  result?:
    | "white"
    | "black"
    | "draw";

  resultReason?:
    | "checkmate"
    | "timeout"
    | "resignation"
    | "draw"
    | "aborted";

  initialFen: string;
  currentFen: string;

  whiteTimeMs: number;
  blackTimeMs: number;
  incrementMs: number;

  activeColor?:
    | "white"
    | "black";

  startedAt?: Date;
  finishedAt?: Date;

  moves: {
    from: string;
    to: string;
    promotion?: string;
    san: string;
    fen: string;
    createdAt: Date;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const gameSchema =
  new Schema<IGame>(
    {
      roomId: {
        type: String,
        required: true,
        index: true,
      },

      whitePlayerId: {
        type: String,
      },

      blackPlayerId: {
        type: String,
      },

      whitePlayerName: {
        type: String,
      },

      blackPlayerName: {
        type: String,
      },

      whiteRating: {
        type: Number,
      },

      blackRating: {
        type: Number,
      },

      status: {
        type: String,
        enum: [
          "waiting",
          "playing",
          "finished",
        ],
        default: "waiting",
      },

      result: {
        type: String,
        enum: [
          "white",
          "black",
          "draw",
        ],
      },

      resultReason: {
        type: String,
        enum: [
          "checkmate",
          "timeout",
          "resignation",
          "draw",
          "aborted",
        ],
      },

      initialFen: {
        type: String,
        required: true,
      },

      currentFen: {
        type: String,
        required: true,
      },

      whiteTimeMs: {
        type: Number,
        required: true,
      },

      blackTimeMs: {
        type: Number,
        required: true,
      },

      incrementMs: {
        type: Number,
        required: true,
      },

      activeColor: {
        type: String,
        enum: [
          "white",
          "black",
        ],
      },

      startedAt: {
        type: Date,
      },

      finishedAt: {
        type: Date,
      },

      moves: [
        {
          from: String,
          to: String,
          promotion: String,
          san: String,
          fen: String,
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    {
      timestamps: true,
    },
  );

gameSchema.index({
  roomId: 1,
  status: 1,
});

export const Game =
  mongoose.models.Game ||
  model<IGame>(
    "Game",
    gameSchema,
  );
