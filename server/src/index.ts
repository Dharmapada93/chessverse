import "dotenv/config";

import express from "express";
import cors from "cors";
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
import { registerSocketHandlers } from "./socket/socket.js";

const app = express();
const httpServer = createServer(app);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  }),
);

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
const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:3000";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    service: "ChessVerse API",
    status: "healthy",
  });
});

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token;

  if (!token) {
    return next(
      new Error(
        "Authentication required",
      ),
    );
  }

  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    return next(
      new Error(
        "JWT secret not configured",
      ),
    );
  }

  try {
    const payload =
      jwt.verify(
        token,
        secret,
      ) as {
        userId: string;
      };

    socket.data.userId =
      payload.userId;

    next();
  } catch {
    next(
      new Error(
        "Invalid authentication token",
      ),
    );
  }
});

registerSocketHandlers(io);

async function startServer() {
  await connectDatabase();

  httpServer.listen(PORT, () => {
    console.log(
      `ChessVerse server running on http://localhost:${PORT}`,
    );
  });
}

startServer();
