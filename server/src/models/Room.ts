import mongoose, { Document, Schema } from "mongoose";

export type RoomStatus =
  | "waiting"
  | "playing"
  | "finished";

export interface IRoom extends Document {
  code: string;
  hostId: mongoose.Types.ObjectId;
  guestId?: mongoose.Types.ObjectId;

  status: RoomStatus;

  gameId?: mongoose.Types.ObjectId;

  spectators: mongoose.Types.ObjectId[];

  name?: string;
  visibility?: "private" | "public";
  rated?: boolean;
  timeControl?: {
    minutes: number;
    increment: number;
    label: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },

    hostId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    guestId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: [
        "waiting",
        "playing",
        "finished",
      ],
      default: "waiting",
    },

    gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
    },

    spectators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    name: {
      type: String,
      default: "Chess Match",
      trim: true,
    },

    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },

    rated: {
      type: Boolean,
      default: false,
    },

    timeControl: {
      minutes: {
        type: Number,
        default: 10,
      },
      increment: {
        type: Number,
        default: 0,
      },
      label: {
        type: String,
        default: "10+0",
      },
    },
  },
  {
    timestamps: true,
  },
);

roomSchema.index({ visibility: 1, status: 1 });
roomSchema.index({ gameId: 1 });
roomSchema.index({ hostId: 1 });

export const Room =
  mongoose.models.Room ||
  mongoose.model<IRoom>("Room", roomSchema);
