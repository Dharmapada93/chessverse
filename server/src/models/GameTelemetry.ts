import mongoose, { Document, Schema } from "mongoose";

export interface IGameTelemetry extends Document {
  gameId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  color: "white" | "black";
  moveNumber: number;
  moveSan: string;
  moveUci: string;
  timestamp: Date;
  timeSpentMs: number;
  timeRemainingMs: number;
  clientSequence: number;
}

const gameTelemetrySchema = new Schema<IGameTelemetry>(
  {
    gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    color: {
      type: String,
      enum: ["white", "black"],
      required: true,
    },
    moveNumber: {
      type: Number,
      required: true,
    },
    moveSan: {
      type: String,
      required: true,
    },
    moveUci: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    timeSpentMs: {
      type: Number,
      default: 0,
    },
    timeRemainingMs: {
      type: Number,
      default: 0,
    },
    clientSequence: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

gameTelemetrySchema.index({ gameId: 1, moveNumber: 1 });
gameTelemetrySchema.index({ userId: 1, createdAt: -1 });

export const GameTelemetry =
  mongoose.models.GameTelemetry ||
  mongoose.model<IGameTelemetry>("GameTelemetry", gameTelemetrySchema);
