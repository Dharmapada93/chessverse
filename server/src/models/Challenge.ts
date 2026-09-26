import mongoose, {
  Schema,
  model,
  type Document,
} from "mongoose";

export interface IChallenge
  extends Document {
  challengerId: string;
  challengedId: string;

  timeControl: {
    minutes: number;
    increment: number;
    label: string;
  };

  rated: boolean;

  colorPreference:
    | "random"
    | "white"
    | "black";

  status:
    | "pending"
    | "accepted"
    | "declined"
    | "expired"
    | "cancelled";

  roomId?: string;
  gameId?: string;

  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const challengeSchema =
  new Schema<IChallenge>(
    {
      challengerId: {
        type: String,
        required: true,
        index: true,
      },

      challengedId: {
        type: String,
        required: true,
        index: true,
      },

      timeControl: {
        minutes: {
          type: Number,
          required: true,
        },

        increment: {
          type: Number,
          required: true,
        },

        label: {
          type: String,
          required: true,
        },
      },

      rated: {
        type: Boolean,
        default: true,
      },

      colorPreference: {
        type: String,
        enum: [
          "random",
          "white",
          "black",
        ],
        default: "random",
      },

      status: {
        type: String,
        enum: [
          "pending",
          "accepted",
          "declined",
          "expired",
          "cancelled",
        ],
        default: "pending",
      },

      roomId: {
        type: String,
      },

      gameId: {
        type: String,
      },

      expiresAt: {
        type: Date,
        required: true,
        index: true,
      },
    },
    {
      timestamps: true,
    },
  );

challengeSchema.index({
  challengedId: 1,
  status: 1,
});

challengeSchema.index({
  challengerId: 1,
  status: 1,
});

challengeSchema.index({
  roomId: 1,
});

export const Challenge =
  mongoose.models.Challenge ||
  model<IChallenge>(
    "Challenge",
    challengeSchema,
  );
