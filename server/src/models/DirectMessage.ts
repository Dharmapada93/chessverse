import mongoose, { Schema, model, type Document } from "mongoose";

export interface IDirectMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  readAt?: Date;
  deletedBySender: boolean;
  deletedByRecipient: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const directMessageSchema = new Schema<IDirectMessage>(
  {
    senderId: {
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
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    deletedBySender: {
      type: Boolean,
      default: false,
    },
    deletedByRecipient: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

directMessageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });
directMessageSchema.index({ recipientId: 1, read: 1 });

export const DirectMessage =
  mongoose.models.DirectMessage ||
  model<IDirectMessage>("DirectMessage", directMessageSchema);

export default DirectMessage;
