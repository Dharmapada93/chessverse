import mongoose, { Schema, Document } from "mongoose";

export interface ISystemSetting extends Document {
  key: string;
  value: any;
  category: "realtime" | "engine" | "ai" | "notifications" | "maintenance" | "security";
  description?: string;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const systemSettingSchema = new Schema<ISystemSetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      enum: ["realtime", "engine", "ai", "notifications", "maintenance", "security"],
      default: "maintenance",
      index: true,
    },
    description: {
      type: String,
      maxlength: 300,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const SystemSetting =
  mongoose.models.SystemSetting ||
  mongoose.model<ISystemSetting>("SystemSetting", systemSettingSchema);
