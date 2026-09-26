import mongoose, { Schema, model, type Document } from "mongoose";

export interface IFriendship extends Document {
  requesterId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  receiverId?: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "declined" | "blocked";
  createdAt: Date;
  updatedAt: Date;
}

const friendshipSchema = new Schema<IFriendship>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "blocked"],
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
    recipientId: 1,
  },
  {
    unique: true,
  },
);

friendshipSchema.index({ requesterId: 1, status: 1 });
friendshipSchema.index({ recipientId: 1, status: 1 });

// Virtual receiverId for backward compatibility
friendshipSchema.virtual("receiverId").get(function () {
  return this.recipientId;
}).set(function (val) {
  this.recipientId = val;
});

export const Friendship =
  mongoose.models.Friendship ||
  model<IFriendship>("Friendship", friendshipSchema);

export default Friendship;
