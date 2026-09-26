import mongoose from "mongoose";
import { AuditLog } from "../models/AuditLog.js";
import type { Request } from "express";

export interface CreateAuditLogParams {
  adminId: string | mongoose.Types.ObjectId;
  adminUsername: string;
  action: string;
  targetType: "user" | "game" | "report" | "announcement" | "system" | "auth";
  targetId?: string;
  targetName?: string;
  reason?: string;
  metadata?: Record<string, any>;
  req?: Request;
}

export async function logAdminAction(params: CreateAuditLogParams) {
  try {
    const ip =
      params.req?.ip ||
      (params.req?.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      undefined;
    const userAgent = params.req?.headers["user-agent"] || undefined;

    const logEntry = new AuditLog({
      adminId: new mongoose.Types.ObjectId(params.adminId),
      adminUsername: params.adminUsername,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      targetName: params.targetName,
      reason: params.reason,
      metadata: params.metadata,
      ip,
      userAgent,
    });

    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error("Failed to write to immutable audit log:", error);
    // Don't throw, but ensure error is surfaced in logs
    return null;
  }
}
