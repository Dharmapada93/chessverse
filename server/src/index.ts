import "dotenv/config";

import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import { connectDatabase } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import { registerSocketHandlers } from "./socket/socket.js";

const app = express();
const httpServer = createServer(app);

const PORT = Number(process.env.PORT) || 4000;
const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:3000";

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

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
