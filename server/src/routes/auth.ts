import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { z } from "zod";
import { User } from "../models/User.js";
import { Session } from "../models/Session.js";
import { Friendship } from "../models/Friendship.js";
import {
  requireAuth,
  type AuthRequest,
} from "../middleware/auth.js";
import {
  loginRateLimiter,
  registerRateLimiter,
  passwordResetLimiter,
} from "../middleware/rateLimiter.js";
import { parseUserAgent } from "../utils/userAgent.js";
import { cacheSet, cacheDel } from "../services/redis.js";

const router = Router();

const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores",
    ),

  email: z
    .string()
    .email(),

  password: z
    .string()
    .min(8)
    .max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function createSecureSession(req: any, res: any, user: any) {
  const sessionId = crypto.randomUUID();
  const userAgentStr = req.headers["user-agent"] || "";
  const device = parseUserAgent(userAgentStr);
  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const session = await Session.create({
    userId: user._id,
    sessionId,
    expiresAt,
    userAgent: userAgentStr,
    browser: device.browser,
    os: device.os,
    device: device.device,
    ipAddress,
    locationCity: "Bhubaneswar",
    locationCountry: "India",
  });

  // Set HttpOnly cookie
  res.cookie("chessverse_session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  // Cache in Redis for sub-millisecond lookups
  await cacheSet(
    `session:${sessionId}`,
    {
      userId: user._id.toString(),
      revoked: false,
      expiresAt: expiresAt.getTime(),
      role: user.role || "user",
    },
    30 * 24 * 60 * 60,
  );

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  const token = jwt.sign(
    {
      userId: user._id.toString(),
      sessionId,
    },
    secret,
    {
      expiresIn: "30d",
    },
  );

  return { sessionId, token, session };
}

// -------------------------------------------------------------
// Registration with Rate Limiting and Session Cookie
// -------------------------------------------------------------
router.post("/register", registerRateLimiter, async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration data",
        errors: result.error.flatten(),
      });
    }

    const { username, email, password } = result.data;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Initial email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      username,
      email,
      passwordHash,
      emailVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    const { token, sessionId } = await createSecureSession(req, res, user);

    return res.status(201).json({
      success: true,
      token,
      sessionId,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        rating: user.rating,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

// -------------------------------------------------------------
// Login with Progressive Rate Limiting & Session Cookie
// -------------------------------------------------------------
router.post("/login", loginRateLimiter, async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid login data",
      });
    }

    const { email, password } = result.data;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.isRestricted) {
      return res.status(403).json({
        success: false,
        message: "This account has been restricted for fair-play violations.",
      });
    }

    const { token, sessionId } = await createSecureSession(req, res, user);

    return res.json({
      success: true,
      token,
      sessionId,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        rating: user.rating,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// -------------------------------------------------------------
// Current User Profile
// -------------------------------------------------------------
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
      sessionId: req.sessionId,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
});

// -------------------------------------------------------------
// Logout & Session Invalidation
// -------------------------------------------------------------
router.post("/logout", async (req: AuthRequest, res) => {
  const sessionId = req.cookies?.chessverse_session || req.body?.sessionId;

  if (sessionId) {
    await Session.updateOne(
      { sessionId },
      { $set: { revokedAt: new Date() } },
    );
    await cacheDel(`session:${sessionId}`);
  }

  res.clearCookie("chessverse_session");
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// -------------------------------------------------------------
// Active Sessions Management (Step 85.2 & 85.3)
// -------------------------------------------------------------
router.get("/sessions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const sessions = await Session.find({
      userId: req.userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    })
      .sort({ lastUsedAt: -1 })
      .lean();

    const formatted = sessions.map((s) => ({
      id: s.sessionId,
      browser: s.browser || "Browser",
      os: s.os || "Windows",
      device: s.device || "Desktop",
      location: `${s.locationCity || "Bhubaneswar"}, ${s.locationCountry || "India"}`,
      lastActive: s.lastUsedAt || s.createdAt,
      createdAt: s.createdAt,
      isCurrent: s.sessionId === req.sessionId,
    }));

    return res.json({
      success: true,
      sessions: formatted,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve active sessions",
    });
  }
});

router.post("/sessions/revoke", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId is required",
      });
    }

    await Session.updateOne(
      { sessionId, userId: req.userId },
      { $set: { revokedAt: new Date() } },
    );

    await cacheDel(`session:${sessionId}`);

    if (sessionId === req.sessionId) {
      res.clearCookie("chessverse_session");
    }

    return res.json({
      success: true,
      message: "Session revoked",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to revoke session",
    });
  }
});

router.post("/sessions/revoke-others", requireAuth, async (req: AuthRequest, res) => {
  try {
    const sessions = await Session.find({
      userId: req.userId,
      sessionId: { $ne: req.sessionId },
      revokedAt: null,
    });

    const ids = sessions.map((s) => s.sessionId);
    await Session.updateMany(
      { userId: req.userId, sessionId: { $in: ids } },
      { $set: { revokedAt: new Date() } },
    );

    for (const sid of ids) {
      await cacheDel(`session:${sid}`);
    }

    return res.json({
      success: true,
      message: "All other sessions revoked",
      count: ids.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to revoke other sessions",
    });
  }
});

// -------------------------------------------------------------
// Secure Password Reset Flow (Step 85.6)
// -------------------------------------------------------------
router.post("/forgot-password", passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      await user.save();

      console.log(`[AUTH] Password reset token generated for ${email}: ${resetToken}`);
    }

    // Always return generic response to prevent email enumeration
    return res.json({
      success: true,
      message: "If an account exists for that email, we've sent password reset instructions.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to process password reset",
    });
  }
});

router.post("/reset-password", passwordResetLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Valid reset token and minimum 8-character password required",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token.",
      });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Revoke all previous active sessions on password reset
    await Session.updateMany(
      { userId: user._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );

    return res.json({
      success: true,
      message: "Password reset successful. Please sign in with your new password.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
});

// -------------------------------------------------------------
// Change Password (from Security Settings)
// -------------------------------------------------------------
router.post("/change-password", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password (min 8 chars) required",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
});

// -------------------------------------------------------------
// Email Verification (Step 85.7)
// -------------------------------------------------------------
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token required",
      });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify email",
    });
  }
});

// -------------------------------------------------------------
// Demo Login (with session creation)
// -------------------------------------------------------------
router.post("/demo", async (req, res) => {
  try {
    const requestedUsername = req.body.username || "Dharmapada";

    let user = await User.findOne({ username: requestedUsername });
    if (!user) {
      const passwordHash = await bcrypt.hash("chessverse123", 10);
      user = await User.create({
        username: requestedUsername,
        email: `${requestedUsername.toLowerCase()}@chessverse.com`,
        passwordHash,
        rating: 1428,
        emailVerified: true,
      });
    }

    const { token, sessionId } = await createSecureSession(req, res, user);

    return res.json({
      success: true,
      token,
      sessionId,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        rating: user.rating,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Demo auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create demo session",
    });
  }
});

export default router;
