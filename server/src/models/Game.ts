import mongoose, {
  Schema,
  model,
  type HydratedDocument,
  type Model,
} from "mongoose";

export interface IGame {
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
    | "finished"
    | "aborted";

  result?:
    | "white"
    | "black"
    | "draw"
    | "1-0"
    | "0-1"
    | "1/2-1/2"
    | "*";

  resultReason?:
    | "checkmate"
    | "timeout"
    | "resignation"
    | "draw"
    | "aborted";

  endReason?:
    | "checkmate"
    | "timeout"
    | "resignation"
    | "draw_agreement"
    | "stalemate"
    | "threefold_repetition"
    | "insufficient_material"
    | "fifty_move_rule"
    | null;

  winnerId?: mongoose.Types.ObjectId | string | null;
  winner?: "white" | "black" | "draw" | string | null;

  initialFen: string;
  currentFen: string;
  fen?: string;
  turn?: "w" | "b";

  whiteTimeMs: number;
  blackTimeMs: number;
  incrementMs: number;

  clock?: {
    initialTime: number;
    increment: number;
    whiteRemaining: number;
    blackRemaining: number;
    turnStartedAt?: Date;
  };

  activeColor?:
    | "white"
    | "black";

  lastClockUpdateAt?: Date;

  startedAt?: Date;
  finishedAt?: Date;
  endedAt?: Date;

  moves: {
    from: string;
    to: string;
    promotion?: string;
    san: string;
    fen: string;
    color?: "w" | "b" | "white" | "black";
    timestamp?: Date;
    createdAt: Date;
  }[];

  rated?: boolean;
  ratingProcessed?: boolean;

  rematchRequestedBy: (mongoose.Types.ObjectId | string)[];
  rematchGameId?: mongoose.Types.ObjectId | string;

  isAiGame?: boolean;
  aiDifficulty?: "beginner" | "intermediate" | "advanced" | "expert";
  aiSide?: "white" | "black";

  createdAt: Date;
  updatedAt: Date;
}

export type GameDocument = HydratedDocument<IGame>;

const gameSchema =
  new Schema<IGame>(
    {
      roomId: {
        type: String,
        required: true,
        index: true,
      },

      rated: {
        type: Boolean,
        default: true,
      },

      ratingProcessed: {
        type: Boolean,
        default: false,
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
          "aborted",
        ],
        default: "waiting",
      },

      result: {
        type: String,
        enum: [
          "white",
          "black",
          "draw",
          "1-0",
          "0-1",
          "1/2-1/2",
          "*",
        ],
        default: "*",
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

      endReason: {
        type: String,
        enum: [
          "checkmate",
          "timeout",
          "resignation",
          "draw_agreement",
          "stalemate",
          "threefold_repetition",
          "insufficient_material",
          "fifty_move_rule",
        ],
      },

      winnerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      winner: {
        type: String,
      },

      initialFen: {
        type: String,
        required: true,
      },

      currentFen: {
        type: String,
        required: true,
      },

      fen: {
        type: String,
      },

      turn: {
        type: String,
        enum: ["w", "b"],
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

      clock: {
        initialTime: {
          type: Number,
        },
        increment: {
          type: Number,
          default: 0,
        },
        whiteRemaining: {
          type: Number,
        },
        blackRemaining: {
          type: Number,
        },
        turnStartedAt: {
          type: Date,
        },
      },

      activeColor: {
        type: String,
        enum: [
          "white",
          "black",
        ],
      },

      lastClockUpdateAt: {
        type: Date,
      },

      startedAt: {
        type: Date,
      },

      finishedAt: {
        type: Date,
      },

      endedAt: {
        type: Date,
      },

      moves: [
        {
          from: String,
          to: String,
          promotion: String,
          san: String,
          fen: String,
          color: String,
          timestamp: {
            type: Date,
            default: Date.now,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],

      rematchRequestedBy: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],

      rematchGameId: {
        type: Schema.Types.ObjectId,
        ref: "Game",
      },

      isAiGame: {
        type: Boolean,
        default: false,
      },

      aiDifficulty: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "expert"],
      },

      aiSide: {
        type: String,
        enum: ["white", "black"],
      },
    },
    {
      timestamps: true,
    },
  );

gameSchema.index({
  roomId: 1,
  status: 1,
});

gameSchema.index({
  whitePlayerId: 1,
  createdAt: -1,
});

gameSchema.index({
  blackPlayerId: 1,
  createdAt: -1,
});

gameSchema.index({
  status: 1,
  createdAt: -1,
});

gameSchema.index({
  rated: 1,
  ratingProcessed: 1,
});

export const Game =
  mongoose.models.Game ||
  model<IGame>(
    "Game",
    gameSchema,
  );

export default Game;
