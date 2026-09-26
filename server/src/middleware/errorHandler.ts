import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export type ErrorCategory =
  | "AUTH_ERROR"
  | "GAME_ERROR"
  | "DATABASE_ERROR"
  | "WEBSOCKET_ERROR"
  | "AI_ERROR"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR";

export interface LoggedSystemError {
  id: string;
  time: string;
  category: ErrorCategory;
  endpoint: string;
  method?: string;
  status: number;
  message: string;
}

const MAX_RECENT_ERRORS = 50;
const recentErrors: LoggedSystemError[] = [];

/**
 * Records a categorized error in an in-memory bounded ring buffer
 * for admin visibility and real-time incident diagnosis (R13.37).
 */
export function recordSystemError(entry: Omit<LoggedSystemError, "id" | "time">): LoggedSystemError {
  const item: LoggedSystemError = {
    id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    time: new Date().toISOString(),
    ...entry,
  };

  recentErrors.unshift(item);
  if (recentErrors.length > MAX_RECENT_ERRORS) {
    recentErrors.pop();
  }
  return item;
}

/**
 * Returns the recent system errors ring buffer (sanitized, zero secrets).
 */
export function getRecentErrors(): LoggedSystemError[] {
  return [...recentErrors];
}

/**
 * Categorizes errors according to standardized internal domain categories (R13.11).
 */
export function categorizeError(err: any, reqPath: string = ""): ErrorCategory {
  if (err?.category) return err.category;

  const errName = err?.name || "";
  const errMsg = (err?.message || "").toLowerCase();
  const path = reqPath.toLowerCase();

  // Database error classification
  if (
    errName === "MongoServerError" ||
    errName === "MongooseError" ||
    errName === "CastError" ||
    err?.code === 11000 ||
    errMsg.includes("mongodb") ||
    errMsg.includes("mongoose") ||
    errMsg.includes("duplicate key") ||
    errMsg.includes("connection closed")
  ) {
    return "DATABASE_ERROR";
  }

  // Authentication error classification
  if (
    errName === "JsonWebTokenError" ||
    errName === "TokenExpiredError" ||
    err?.status === 401 ||
    err?.statusCode === 401 ||
    err?.status === 403 ||
    err?.statusCode === 403 ||
    path.includes("/auth") ||
    path.includes("/login") ||
    errMsg.includes("jwt") ||
    errMsg.includes("unauthorized") ||
    errMsg.includes("token")
  ) {
    return "AUTH_ERROR";
  }

  // AI error classification
  if (
    path.includes("/ai") ||
    path.includes("/coach") ||
    errMsg.includes("openai") ||
    errMsg.includes("stockfish")
  ) {
    return "AI_ERROR";
  }

  // Game error classification
  if (
    path.includes("/game") ||
    path.includes("/rooms") ||
    path.includes("/challenges") ||
    errMsg.includes("illegal move") ||
    errMsg.includes("game not found")
  ) {
    return "GAME_ERROR";
  }

  // WebSocket error classification
  if (path.includes("socket") || errMsg.includes("websocket")) {
    return "WEBSOCKET_ERROR";
  }

  // Validation error classification
  if (
    err?.status === 400 ||
    err?.statusCode === 400 ||
    errName === "ValidationError" ||
    errName === "ZodError" ||
    errMsg.includes("validation") ||
    errMsg.includes("required")
  ) {
    return "VALIDATION_ERROR";
  }

  return "SERVER_ERROR";
}

/**
 * Returns safe, user-friendly messages for production clients (R13.10).
 * Never leaks raw database exceptions, JWT tokens, or stack traces.
 */
export function getSafeUserErrorMessage(
  err: any,
  status: number,
  category: ErrorCategory,
): string {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    return err?.message || "Internal server error";
  }

  if (category === "DATABASE_ERROR") {
    return "Something went wrong. Please try again.";
  }

  if (status === 500) {
    return "An unexpected error occurred. Please try again later.";
  }

  if (category === "AUTH_ERROR" && status === 401) {
    return "Authentication required. Please sign in.";
  }

  if (category === "AUTH_ERROR" && status === 403) {
    return "You do not have permission to perform this action.";
  }

  const rawMsg = String(err?.message || "");
  if (
    rawMsg.includes("MongoServerError") ||
    rawMsg.includes("E11000") ||
    rawMsg.includes("jwt") ||
    rawMsg.includes("at ") ||
    rawMsg.includes(".ts") ||
    rawMsg.includes(".js")
  ) {
    return "Something went wrong. Please try again.";
  }

  return rawMsg || "Something went wrong. Please try again.";
}

/**
 * Centralized production error handling middleware.
 * Logs structured error payloads and returns safe user responses without leaking stack traces.
 */
export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = Number(err.status || err.statusCode) || 500;
  const isProduction = process.env.NODE_ENV === "production";
  const category = categorizeError(err, req.originalUrl || req.url);

  // Record into recent errors ring buffer
  recordSystemError({
    category,
    endpoint: req.originalUrl || req.path,
    method: req.method,
    status,
    message: err?.message || "Unknown error",
  });

  logger.error("unhandled_request_error", {
    method: req.method,
    path: req.originalUrl,
    category,
    status,
    message: err?.message,
    stack: isProduction ? undefined : err.stack,
  });

  const safeMessage = getSafeUserErrorMessage(err, status, category);

  return res.status(status).json({
    success: false,
    message: safeMessage,
  });
}
