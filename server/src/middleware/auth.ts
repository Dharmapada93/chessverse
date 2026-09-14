import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest
  extends Request {
  userId?: string;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header =
    req.headers.authorization;

  if (
    !header ||
    !header.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const token =
    header.substring(7);

  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      success: false,
      message: "JWT secret not configured",
    });
  }

  try {
    const payload =
      jwt.verify(token, secret) as {
        userId: string;
      };

    req.userId = payload.userId;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}
