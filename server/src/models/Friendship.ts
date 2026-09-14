import mongoose, {
  Schema,
  model,
  type Document,
} from "mongoose";

export interface IFriendship
  extends Document {
  requesterId: string;
  receiverId: string;
  status:
    | "pending"
    | "accepted"
    | "declined";
  createdAt: Date;
  updatedAt: Date;
}

const friendshipSchema =
  new Schema<IFriendship>(
    {
      requesterId: {
        type: String,
        required: true,
        index: true,
      },

      receiverId: {
        type: String,
        required: true,
        index: true,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "accepted",
          "declined",
        ],
        default: "pending",
      },
    },
    {
      timestamps: true,
    },
  );

friendshipSchema.index(
  {
    requesterId: 1,
    receiverId: 1,
  },
  {
    unique: true,
  },
);

export const Friendship =
  mongoose.models.Friendship ||
  model<IFriendship>(
    "Friendship",
    friendshipSchema,
  );
