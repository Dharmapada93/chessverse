import mongoose, { Schema, Document } from "mongoose";

export interface IReportNote {
  note: string;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  createdAt: Date;
}

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  reportedUserId: mongoose.Types.ObjectId;
  category: "Cheating" | "Harassment" | "Spam" | "Inappropriate content" | "Abusive behavior" | "Other";
  description?: string;
  gameId?: mongoose.Types.ObjectId;
  status: "pending" | "open" | "investigating" | "reviewed" | "resolved" | "dismissed";
  assignedTo?: mongoose.Types.ObjectId;
  assignedToName?: string;
  notes: IReportNote[];
  actionTaken?: "warn" | "suspend" | "ban" | "dismiss" | "none";
  resolutionNotes?: string;
  evidence?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const reportNoteSchema = new Schema<IReportNote>(
  {
    note: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const reportSchema = new Schema<IReport>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reportedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["Cheating", "Harassment", "Spam", "Inappropriate content", "Abusive behavior", "Other"],
      required: true,
    },
    description: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "open", "investigating", "reviewed", "resolved", "dismissed"],
      default: "open",
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignedToName: {
      type: String,
    },
    notes: {
      type: [reportNoteSchema],
      default: [],
    },
    actionTaken: {
      type: String,
      enum: ["warn", "suspend", "ban", "dismiss", "none"],
      default: "none",
    },
    resolutionNotes: {
      type: String,
      maxlength: 1000,
    },
    evidence: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ status: 1, createdAt: -1 });

export const Report =
  mongoose.models.Report ||
  mongoose.model<IReport>("Report", reportSchema);
