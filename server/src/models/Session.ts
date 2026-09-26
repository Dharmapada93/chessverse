import mongoose, { Document, Schema } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  ipAddress?: string;
  locationCity?: string;
  locationCountry?: string;
  revokedAt?: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
    },
    browser: {
      type: String,
      default: "Browser",
    },
    os: {
      type: String,
      default: "Unknown OS",
    },
    device: {
      type: String,
      default: "Desktop",
    },
    ipAddress: {
      type: String,
    },
    locationCity: {
      type: String,
      default: "Bhubaneswar",
    },
    locationCountry: {
      type: String,
      default: "India",
    },
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for active session lookups
sessionSchema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });

export const Session =
  mongoose.models.Session || mongoose.model<ISession>("Session", sessionSchema);
