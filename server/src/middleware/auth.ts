import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Session } from "../models/Session.js";
import { User } from "../models/User.js";
import { cacheGet, cacheSet } from "../services/redis.js";

export interface AuthRequest extends Request {
  userId?: string;
  sessionId?: string;
  username?: string;
  userRole?: "user" | "moderator" | "admin";
  adminPermissions?: string[];
}

/**
 * Standard role permission hierarchy
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "*", // Wildcard: full system authority
    "users.view",
    "users.suspend",
    "users.ban",
    "users.delete",
    "games.view",
    "games.cancel",
    "reports.view",
    "reports.resolve",
    "announcements.create",
    "system.view",
    "system.manage",
    "ai.view",
    "ai.manage",
    "audit.view",
    "analytics.view",
    "export.csv",
  ],
  moderator: [
    "users.view",
    "users.suspend",
    "games.view",
    "reports.view",
    "reports.resolve",
    "audit.view",
    "analytics.view",
  ],
  user: [],
};

/**
 * Checks if a given role or custom permissions list satisfies a required permission.
 */
export function hasPermission(
  role: string = "user",
  customPermissions: string[] = [],
  requiredPermission: string
): boolean {
  if (role === "admin") return true;

  const rolePerms = ROLE_PERMISSIONS[role] || [];
  if (rolePerms.includes("*") || rolePerms.includes(requiredPermission)) {
    return true;
  }

  if (customPermissions.includes("*") || customPermissions.includes(requiredPermission)) {
    return true;
  }

  return false;
}

/**
 * Validates request authentication via HttpOnly session cookie or Bearer authorization header.
 */
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  // 1. Check HttpOnly cookie first
  let sessionId = req.cookies?.chessverse_session as string | undefined;
  let token: string | undefined;
  let verifiedUserId: string | undefined;

  // 2. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }

  // If neither cookie nor header is provided
  if (!sessionId && !token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ success: false, message: "Authentication service is not configured" });
  }

  // Case A: We have a JWT token from header
  if (token) {
    try {
      const payload = jwt.verify(token, secret) as {
        userId: string;
        sessionId?: string;
      };
      verifiedUserId = payload.userId;
      req.userId = payload.userId;
      if (payload.sessionId) {
        sessionId = payload.sessionId;
      }
    } catch {
      // If token failed verification, fall through to check sessionId if present
      if (!sessionId) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired authentication token",
        });
      }
    }
  }

  // Case B: We have a sessionId (from cookie or payload)
  if (sessionId) {
    req.sessionId = sessionId;

    // Check cached session
    const cacheKey = `session:${sessionId}`;
    const cached = await cacheGet<{
      userId: string;
      username?: string;
      revoked: boolean;
      expiresAt: number;
      role: string;
      permissions?: string[];
    }>(cacheKey);

    if (cached) {
      if (cached.revoked || cached.expiresAt < Date.now()) {
        res.clearCookie("chessverse_session");
        return res.status(401).json({
          success: false,
          message: "Session has been revoked or expired",
        });
      }
      if (verifiedUserId && cached.userId !== verifiedUserId) {
        return res.status(401).json({
          success: false,
          message: "Authentication credentials do not match",
        });
      }
      req.userId = cached.userId;
      req.username = cached.username;
      req.userRole = cached.role as any;
      req.adminPermissions = cached.permissions || [];
      return next();
    }

    // Lookup session in MongoDB
    try {
      const dbSession = await Session.findOne({ sessionId });
      if (!dbSession || dbSession.revokedAt || dbSession.expiresAt < new Date()) {
        res.clearCookie("chessverse_session");
        return res.status(401).json({
          success: false,
          message: "Session has been revoked or expired",
        });
      }

      if (verifiedUserId && dbSession.userId.toString() !== verifiedUserId) {
        return res.status(401).json({
          success: false,
          message: "Authentication credentials do not match",
        });
      }

      req.userId = dbSession.userId.toString();

      // Look up user role, accountStatus and restrictions
      const user = await User.findById(dbSession.userId).select(
        "username role isRestricted restrictionReason accountStatus suspendedUntil suspensionReason banReason adminPermissions"
      );

      // Account status checks (R6.18, R6.19, R6.20)
      if (user?.accountStatus === "BANNED") {
        return res.status(403).json({
          success: false,
          message: `Account is permanently banned: ${user.banReason || "Violation of platform rules"}`,
        });
      }

      if (
        user?.accountStatus === "SUSPENDED" &&
        user.suspendedUntil &&
        new Date(user.suspendedUntil) > new Date()
      ) {
        return res.status(403).json({
          success: false,
          message: `Account is suspended until ${user.suspendedUntil.toISOString()}: ${
            user.suspensionReason || "Temporary suspension"
          }`,
        });
      }

      if (user?.isRestricted) {
        return res.status(403).json({
          success: false,
          message: user.restrictionReason || "Account restricted by fair play moderation",
        });
      }

      req.username = user?.username;
      req.userRole = (user?.role as any) || "user";
      req.adminPermissions = user?.adminPermissions || [];

      // Cache session for fast access (TTL: 5 minutes)
      await cacheSet(
        cacheKey,
        {
          userId: req.userId,
          username: req.username,
          revoked: false,
          expiresAt: dbSession.expiresAt.getTime(),
          role: req.userRole,
          permissions: req.adminPermissions,
        },
        300
      );

      // Async touch lastUsedAt
      Session.updateOne({ _id: dbSession._id }, { $set: { lastUsedAt: new Date() } }).catch(
        () => {}
      );

      return next();
    } catch {
      return res.status(401).json({
        success: false,
        message: "Failed to validate session",
      });
    }
  }

  // If we have verified userId from JWT but no sessionId, allow for backward compatibility
  if (req.userId) {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: "Invalid session or credentials",
  });
}

/**
 * Requires admin or moderator role.
 */
export async function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.userRole === "admin" || req.userRole === "moderator") {
    return next();
  }

  try {
    const user = await User.findById(req.userId).select("username role adminPermissions");
    if (user?.role === "admin" || user?.role === "moderator") {
      req.username = user.username;
      req.userRole = user.role;
      req.adminPermissions = user.adminPermissions || [];
      return next();
    }
  } catch (err) {
    console.error("requireAdmin user lookup error:", err);
  }

  return res.status(403).json({
    success: false,
    message: "Access restricted to authorized administrators and moderators.",
  });
}

/**
 * Middleware factory enforcing granular permissions (R6.5)
 */
export function requirePermission(permission: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!req.userRole) {
      const user = await User.findById(req.userId).select("username role adminPermissions");
      if (user) {
        req.username = user.username;
        req.userRole = user.role as any;
        req.adminPermissions = user.adminPermissions || [];
      }
    }

    if (hasPermission(req.userRole, req.adminPermissions, permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied: Missing required permission [${permission}].`,
    });
  };
}
