import type { Request, Response, NextFunction } from "express";

function parseOrigins(urlStr?: string): string[] {
  if (!urlStr) return [];
  return urlStr
    .split(",")
    .map((u) => {
      try {
        return new URL(u.trim()).origin;
      } catch {
        return u.trim().replace(/\/+$/, "");
      }
    })
    .filter(Boolean);
}

export const ALLOWED_ORIGINS = new Set<string>([
  ...parseOrigins(process.env.CLIENT_URL),
  "http://localhost:3000",
  "https://chessverse.app",
  "https://www.chessverse.app",
]);

/**
 * State-changing mutation CSRF / Origin validation middleware.
 * Verifies that cookie-authenticated state-changing requests originate from an authorized domain.
 */
export function verifyOriginCsrf(req: Request, res: Response, next: NextFunction) {
  const mutatingMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (!mutatingMethods.includes(req.method.toUpperCase())) {
    return next();
  }

  // Exempt public webhook or unauthenticated login/register routes if necessary
  const path = req.path;
  if (path === "/api/auth/login" || path === "/api/auth/register" || path === "/api/auth/forgot-password" || path === "/api/auth/demo") {
    return next();
  }

  const hasSessionCookie = Boolean(req.cookies?.chessverse_session);
  const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : undefined);

  if (hasSessionCookie) {
    if (!origin || !ALLOWED_ORIGINS.has(origin)) {
      return res.status(403).json({
        success: false,
        message: "Request origin rejected by CSRF security policy.",
      });
    }
  }

  return next();
}
