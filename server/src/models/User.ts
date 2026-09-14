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
  },
  {
    timestamps: true,
  },
);

export const User =
  mongoose.models.User ||
  model<IUser>("User", userSchema);
