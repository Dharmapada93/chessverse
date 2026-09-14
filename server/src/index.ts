import "dotenv/config";

import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";

import { connectDatabase } from "./config/database.js";
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
