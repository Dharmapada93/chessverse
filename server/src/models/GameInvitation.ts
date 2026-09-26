import mongoose, { Schema, model, type Document } from "mongoose";

export interface IGameInvitation extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  timeControl: {
    initialTime: number; // in milliseconds
    increment: number;   // in seconds
  };
  colorPreference: "random" | "white" | "black";
  status: "pending" | "accepted" | "declined" | "expired";
  expiresAt: Date;
  gameId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const gameInvitationSchema = new Schema<IGameInvitation>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    timeControl: {
      initialTime: {
        type: Number,
        required: true,
      },

      increment: {
        type: Number,
        required: true,
      },
    },

    colorPreference: {
      type: String,
      enum: ["random", "white", "black"],
      default: "random",
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
    },
  },
  {
    timestamps: true,
  },
);

gameInvitationSchema.index({
  receiverId: 1,
  status: 1,
});

gameInvitationSchema.index({
  senderId: 1,
  status: 1,
});

export const GameInvitation =
  mongoose.models.GameInvitation ||
  model<IGameInvitation>("GameInvitation", gameInvitationSchema);

export default GameInvitation;
