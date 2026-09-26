import mongoose, { Schema, model, type Document } from "mongoose";

export interface IGameInviteToken extends Document {
  token: string;
  creatorId: mongoose.Types.ObjectId;
  timeControl: {
    initialTime: number; // in milliseconds
    increment: number;   // in seconds
  };
  colorPreference: "random" | "white" | "black";
  rated: boolean;
  status: "active" | "used" | "expired" | "cancelled";
  gameId?: mongoose.Types.ObjectId;
  acceptedById?: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const gameInviteTokenSchema = new Schema<IGameInviteToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    timeControl: {
      initialTime: {
        type: Number,
        required: true,
        default: 600000, // 10 min
      },
      increment: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    colorPreference: {
      type: String,
      enum: ["random", "white", "black"],
      default: "random",
    },
    rated: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["active", "used", "expired", "cancelled"],
      default: "active",
      index: true,
    },
    gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
    },
    acceptedById: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

export const GameInviteToken =
  mongoose.models.GameInviteToken ||
  model<IGameInviteToken>("GameInviteToken", gameInviteTokenSchema);

export default GameInviteToken;
