import mongoose, {
  Schema,
  model,
  type Document,
} from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  rating: number;
  ratingHistory: {
    rating: number;
    change: number;
    gameId?: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
    },

    rating: {
      type: Number,
      default: 1200,
    },

    ratingHistory: [
      {
        rating: Number,
        change: Number,
        gameId: String,
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

export const User =
  mongoose.models.User ||
  model<IUser>("User", userSchema);
