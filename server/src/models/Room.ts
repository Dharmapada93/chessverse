import mongoose, {
  Schema,
  model,
  type Document,
} from "mongoose";

export interface IRoom extends Document {
  code: string;
  name: string;
  visibility: "private" | "public";
  rated: boolean;
  spectators: boolean;
  timeControl: {
    minutes: number;
    increment: number;
    label: string;
  };
  hostId?: string;
  status: "waiting" | "playing" | "finished";
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

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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

    spectators: {
      type: Boolean,
      default: true,
    },

    timeControl: {
      minutes: {
        type: Number,
        required: true,
      },

      increment: {
        type: Number,
        required: true,
      },

      label: {
        type: String,
        required: true,
      },
    },

    hostId: {
      type: String,
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
  },
  {
    timestamps: true,
  },
);

export const Room =
  mongoose.models.Room ||
  model<IRoom>("Room", roomSchema);
