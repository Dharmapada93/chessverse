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

const gameSchema = new Schema<IGame>(
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

export const Game =
  mongoose.models.Game ||
  model<IGame>("Game", gameSchema);
