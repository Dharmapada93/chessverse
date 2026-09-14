import mongoose, {
  Schema,
  model,
  type Document,
} from "mongoose";

export interface INotification
  extends Document {
  userId: string;

  type:
    | "friend_request"
    | "friend_accepted"
    | "challenge"
    | "room_invite"
    | "follow"
    | "tournament";

  title: string;
  message: string;

  actorId?: string;
  actorUsername?: string;

  referenceId?: string;

  read: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema =
  new Schema<INotification>(
    {
      userId: {
        type: String,
        required: true,
        index: true,
      },

      type: {
        type: String,
        enum: [
          "friend_request",
          "friend_accepted",
          "challenge",
          "room_invite",
          "follow",
          "tournament",
        ],
        required: true,
      },

      title: {
        type: String,
        required: true,
      },

      message: {
        type: String,
        required: true,
      },

      actorId: {
        type: String,
      },

      actorUsername: {
        type: String,
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

export const Notification =
  mongoose.models.Notification ||
  model<INotification>(
    "Notification",
    notificationSchema,
  );
