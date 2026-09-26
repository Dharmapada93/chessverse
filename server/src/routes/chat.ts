import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { chatLimiter } from "../middleware/rateLimiter.js";
import { GameChat } from "../models/GameChat.js";
import { Message } from "../models/Message.js";
import { Game } from "../models/Game.js";
import { User } from "../models/User.js";
import { io } from "../index.js";

const router = Router();

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// POST /api/chat/message - Send message via HTTP API with rate limiting
router.post("/message", requireAuth, chatLimiter, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { gameId, roomId, message } = req.body;
    const cleanMessage = String(message || "").trim();

    if (!cleanMessage) {
      return res.status(400).json({ success: false, message: "Message cannot be empty." });
    }

    if (cleanMessage.length > 300) {
      return res.status(400).json({ success: false, message: "Message exceeds 300 characters." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Check game membership if gameId provided
    if (gameId) {
      if (!mongoose.Types.ObjectId.isValid(gameId)) {
        return res.status(400).json({ success: false, message: "Invalid game ID." });
      }
      const game = await Game.findById(gameId);
      if (!game) {
        return res.status(404).json({ success: false, message: "Game not found." });
      }
    }

    const safeMessage = escapeHtml(cleanMessage);
    let savedId = new mongoose.Types.ObjectId().toString();
    const createdAt = new Date();

    if (gameId && mongoose.Types.ObjectId.isValid(gameId)) {
      try {
        const gameChat = await GameChat.create({
          gameId: new mongoose.Types.ObjectId(gameId),
          userId: user._id,
          message: safeMessage,
        });
        savedId = gameChat._id.toString();
      } catch (err) {
        console.error("GameChat create error:", err);
      }
    }

    if (roomId) {
      try {
        const savedMessage = await Message.create({
          roomId,
          userId: user._id.toString(),
          username: user.username,
          message: safeMessage,
        });
        savedId = savedMessage._id.toString();
      } catch (err) {
        console.error("Message create error:", err);
      }
    }

    const messagePayload = {
      id: savedId,
      userId: user._id.toString(),
      username: user.username,
      name: user.username,
      message: safeMessage,
      createdAt,
    };

    // Broadcast via Socket.IO if available
    try {
      if (io) {
        if (roomId) io.to(roomId).emit("chat:message", messagePayload);
        if (gameId) io.to(`game:${gameId}`).emit("chat:message", messagePayload);
      }
    } catch {}

    return res.status(201).json({
      success: true,
      message: messagePayload,
    });
  } catch (error) {
    console.error("POST /api/chat/message error:", error);
    return res.status(500).json({ success: false, message: "Failed to send chat message." });
  }
});

export default router;
