import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  adminUsername: string;
  action: string;
  targetType: "user" | "game" | "report" | "announcement" | "system" | "auth";
  targetId?: string;
  targetName?: string;
  reason?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    adminUsername: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["user", "game", "report", "announcement", "system", "auth"],
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      index: true,
    },
    targetName: {
      type: String,
    },
    reason: {
      type: String,
      maxlength: 1000,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // Explicitly managed immutable createdAt
  }
);

auditLogSchema.index({ targetType: 1, createdAt: -1 });

// Immutability protection: prevent updates or deletions on audit log collection in application logic
auditLogSchema.pre("updateOne", function () {
  throw new Error("Audit logs are strictly immutable and cannot be updated.");
});
auditLogSchema.pre("updateMany", function () {
  throw new Error("Audit logs are strictly immutable and cannot be updated.");
});
auditLogSchema.pre("deleteOne", function () {
  throw new Error("Audit logs are strictly immutable and cannot be deleted.");
});
auditLogSchema.pre("deleteMany", function () {
  throw new Error("Audit logs are strictly immutable and cannot be deleted.");
});

export const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
