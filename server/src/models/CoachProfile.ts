import mongoose, { Document, Schema } from "mongoose";

export interface ICoachProfile extends Document {
  userId: mongoose.Types.ObjectId;

  weaknesses: string[];

  strengths: string[];

  tacticalScore: number;

  openingScore: number;

  middlegameScore: number;

  endgameScore: number;

  gamesAnalyzed: number;

  updatedAt: Date;
}

const coachProfileSchema =
  new Schema<ICoachProfile>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true,
      },

      weaknesses: {
        type: [String],
        default: [],
      },

      strengths: {
        type: [String],
        default: [],
      },

      tacticalScore: {
        type: Number,
        default: 0,
      },

      openingScore: {
        type: Number,
        default: 0,
      },

      middlegameScore: {
        type: Number,
        default: 0,
      },

      endgameScore: {
        type: Number,
        default: 0,
      },

      gamesAnalyzed: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    },
  );

export const CoachProfile =
  mongoose.models.CoachProfile ||
  mongoose.model<ICoachProfile>(
    "CoachProfile",
    coachProfileSchema,
  );
