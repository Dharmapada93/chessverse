import mongoose, { Schema, model, type Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type:
    | "friend_request"
    | "friend_accepted"
    | "game_invite"
    | "game_finished"
    | "draw_offer"
    | "rematch"
    | "spectator"
    | "challenge"
    | "room_invite"
    | "follow"
    | "tournament"
    | "friend_online"
    | "message"
    | "system";
  title?: string;
  message?: string;
  actorId?: mongoose.Types.ObjectId;
  actorUsername?: string;
  gameId?: mongoose.Types.ObjectId;
  referenceId?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "friend_request",
        "friend_accepted",
        "game_invite",
        "game_finished",
        "draw_offer",
        "rematch",
        "spectator",
        "challenge",
        "room_invite",
        "follow",
        "tournament",
        "friend_online",
        "message",
        "system",
      ],
      required: true,
    },

    title: {
      type: String,
      default: "",
    },

    message: {
      type: String,
      default: "",
    },

    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    actorUsername: {
      type: String,
    },

    gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
    },

    referenceId: {
      type: String,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({
  userId: 1,
  createdAt: -1,
});

notificationSchema.index({
  userId: 1,
  read: 1,
  createdAt: -1,
});

export const Notification =
  mongoose.models.Notification ||
  model<INotification>("Notification", notificationSchema);

export default Notification;
