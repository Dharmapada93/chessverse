import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface ITrainingProgress
  extends Document {
  userId: mongoose.Types.ObjectId;

  puzzleRating: number;

  puzzlesSolved: number;

  puzzlesAttempted: number;

  currentStreak: number;

  longestStreak: number;

  themes: {
    theme: string;
    solved: number;
    attempted: number;
  }[];

  lastTrainingAt?: Date;
}

const trainingProgressSchema =
  new Schema<ITrainingProgress>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true,
      },

      puzzleRating: {
        type: Number,
        default: 800,
      },

      puzzlesSolved: {
        type: Number,
        default: 0,
      },

      puzzlesAttempted: {
        type: Number,
        default: 0,
      },

      currentStreak: {
        type: Number,
        default: 0,
      },

      longestStreak: {
        type: Number,
        default: 0,
      },

      themes: {
        type: [
          {
            theme: String,
            solved: Number,
            attempted: Number,
          },
        ],
        default: [],
      },

      lastTrainingAt: Date,
    },
    {
      timestamps: true,
    },
  );

export const TrainingProgress =
  mongoose.models.TrainingProgress ||
  mongoose.model<ITrainingProgress>(
    "TrainingProgress",
    trainingProgressSchema,
  );
