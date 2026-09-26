import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { connectDatabase } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import challengeRoutes from "./routes/challenges.js";
import gameRoutes from "./routes/games.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import messageRoutes from "./routes/messages.js";
import notificationRoutes from "./routes/notifications.js";
import roomRoutes from "./routes/rooms.js";
import socialRoutes from "./routes/social.js";
import userRoutes from "./routes/users.js";
import coachRoutes from "./routes/coach.js";
import puzzleRoutes from "./routes/puzzles.js";
import aiRoutes from "./routes/ai.js";
import trainingRoutes from "./routes/training.js";
import friendsRoutes from "./routes/friends.js";
import progressionRoutes from "./routes/progression.js";
import reportRoutes from "./routes/reports.js";
import matchmakingRoutes from "./routes/matchmaking.js";
import chatRoutes from "./routes/chat.js";
import adminRoutes from "./routes/admin.js";
import announcementRoutes from "./routes/announcements.js";
import healthRoutes from "./routes/health.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";
import { verifyOriginCsrf, ALLOWED_ORIGINS } from "./middleware/csrf.js";
import { telemetryMiddleware } from "./middleware/telemetry.js";
import { registerSocketHandlers } from "./socket/socket.js";
import { Session } from "./models/Session.js";
import { User } from "./models/User.js";
import { cacheGet, cacheSet } from "./services/redis.js";
import { logger } from "./utils/logger.js";

const app = express();
const httpServer = createServer(app);

// Real-time API Telemetry Tracking
app.use(telemetryMiddleware);

// Step 95.2: Hardened HTTP Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    xContentTypeOptions: true,
    xFrameOptions: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

// Permissions Policy (Camera, Microphone, Geolocation disabled)
app.use((_req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use("/.well-known", (_req, res) => {
  res.status(204).end();
});

app.get("/", (_req, res) => {
  res.json({
    success: true,
    service: "ChessVerse API",
    status: "running",
    version: "1.0.0",
  });
});

const PORT = Number(process.env.PORT) || 4000;
const allowedOrigins = Array.from(ALLOWED_ORIGINS);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

// Step 95.5: CSRF / Origin Verification on State-Changing Mutations
app.use("/api", verifyOriginCsrf);

app.use("/api/auth", authRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/game/invite", challengeRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/users", userRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/puzzles", puzzleRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/training", trainingRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/progression", progressionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/matchmaking", matchmakingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/announcements", announcementRoutes);

app.use("/health", healthRoutes);
app.use("/api/health", healthRoutes);

// Global Error Handler
app.use(globalErrorHandler);

export const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

// -------------------------------------------------------------
// Step 85.8: Server-Authoritative Socket Session Authentication
// -------------------------------------------------------------
io.use(async (socket, next) => {
  try {
    let sessionId: string | undefined = socket.handshake.auth?.sessionId;
    const token: string | undefined = socket.handshake.auth?.token;

    // Parse cookie from handshake headers
    const cookieHeader = socket.handshake.headers.cookie;
    if (cookieHeader && !sessionId) {
      const match = cookieHeader.match(/chessverse_session=([^;]+)/);
      if (match) {
        sessionId = decodeURIComponent(match[1]);
      }
    }

    let verifiedUserId: string | null = null;

    // 1. Verify token if passed
    if (token) {
      const secret = process.env.JWT_SECRET || "change-this-to-a-long-random-secret-key";
      try {
        const payload = jwt.verify(token, secret) as {
          userId: string;
          sessionId?: string;
        };
        verifiedUserId = payload.userId;
        if (payload.sessionId) sessionId = payload.sessionId;
      } catch {}
    }

    // 2. Validate session against Redis cache / MongoDB
    if (sessionId) {
      const cached = await cacheGet<{ userId: string; revoked: boolean; expiresAt: number }>(
        `session:${sessionId}`,
      );

      if (cached) {
        if (cached.revoked || cached.expiresAt < Date.now()) {
          return next(new Error("Session has been revoked or expired"));
        }
        socket.data.userId = cached.userId;
        socket.data.sessionId = sessionId;
        return next();
      }

      const dbSession = await Session.findOne({ sessionId });
      if (!dbSession || dbSession.revokedAt || dbSession.expiresAt < new Date()) {
        return next(new Error("Session has been revoked or expired"));
      }

      const user = await User.findById(dbSession.userId).select("role isRestricted");
      if (user?.isRestricted) {
        return next(new Error("Account restricted for fair-play violations"));
      }

      socket.data.userId = dbSession.userId.toString();
      socket.data.sessionId = sessionId;

      await cacheSet(`session:${sessionId}`, {
        userId: socket.data.userId,
        revoked: false,
        expiresAt: dbSession.expiresAt.getTime(),
      }, 300);

      return next();
    }

    if (verifiedUserId) {
      socket.data.userId = verifiedUserId;
      return next();
    }

    // Guest spectator connection support (R3.30)
    const guestId = "guest_" + Math.random().toString(36).substring(2, 9);
    socket.data.userId = guestId;
    socket.data.isGuest = true;
    socket.data.role = "spectator";
    return next();
  } catch (err) {
    return next(new Error("Invalid authentication session"));
  }
});

registerSocketHandlers(io);

async function startServer() {
  await connectDatabase();

  const HOST = process.env.HOST || "0.0.0.0";

  httpServer.listen(PORT, HOST, () => {
    logger.info("server_started", {
      port: PORT,
      host: HOST,
      nodeEnv: process.env.NODE_ENV || "development",
      allowedOrigins,
    });
    console.log(
      `ChessVerse server running on http://${HOST}:${PORT} [${process.env.NODE_ENV || "development"}]`,
    );
  });
}

startServer();
