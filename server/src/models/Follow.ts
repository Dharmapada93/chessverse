import mongoose, {
  Schema,
  model,
  type Document,
} from "mongoose";

export interface IFollow
  extends Document {
  followerId: string;
  followingId: string;
  createdAt: Date;
}

const followSchema =
  new Schema<IFollow>(
    {
      followerId: {
        type: String,
        required: true,
        index: true,
      },

      followingId: {
        type: String,
        required: true,
        index: true,
      },
    },
    {
      timestamps: {
        createdAt: true,
        updatedAt: false,
      },
    },
  );

followSchema.index(
  {
    followerId: 1,
    followingId: 1,
  },
  {
    unique: true,
  },
);

export const Follow =
  mongoose.models.Follow ||
  model<IFollow>(
    "Follow",
    followSchema,
  );
