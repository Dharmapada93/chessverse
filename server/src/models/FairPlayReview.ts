import mongoose, { Document, Schema } from "mongoose";

export interface IFairPlayReview extends Document {
  gameId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  username: string;
  userRating: number;
  engineCorrelation: "Low" | "Medium" | "High" | "Critical";
  engineAgreementPct: number;
  timingAnomaly: "Low" | "Medium" | "High";
  accountPattern: "Normal" | "Elevated" | "Suspicious";
  riskScore: number;
  status: "needs_review" | "cleared" | "restricted" | "warning";
  moderatorNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const fairPlayReviewSchema = new Schema<IFairPlayReview>(
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
    username: {
      type: String,
      required: true,
    },
    userRating: {
      type: Number,
      default: 1200,
    },
    engineCorrelation: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },
    engineAgreementPct: {
      type: Number,
      default: 50,
    },
    timingAnomaly: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    accountPattern: {
      type: String,
      enum: ["Normal", "Elevated", "Suspicious"],
      default: "Normal",
    },
    riskScore: {
      type: Number,
      default: 10,
    },
    status: {
      type: String,
      enum: ["needs_review", "cleared", "restricted", "warning"],
      default: "needs_review",
      index: true,
    },
    moderatorNotes: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const FairPlayReview =
  mongoose.models.FairPlayReview ||
  mongoose.model<IFairPlayReview>("FairPlayReview", fairPlayReviewSchema);
