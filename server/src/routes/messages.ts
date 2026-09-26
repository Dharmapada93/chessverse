import { Router } from "express";
import mongoose from "mongoose";
import { DirectMessage } from "../models/DirectMessage.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { emitToUser, isUserOnline } from "../socket/socket.js";

const router = Router();

// In-memory rate limiting map for message sending (R4.40): userId -> timestamp[]
const userMessageRateLimits = new Map<string, number[]>();

function checkMessageRateLimit(userId: string): boolean {
  const now = Date.now();
  const timestamps = userMessageRateLimits.get(userId) || [];
  // Keep timestamps in the last 10 seconds
  const recent = timestamps.filter((t) => now - t < 10000);
  if (recent.length >= 10) {
    // max 10 messages per 10s
    return false;
  }
  recent.push(now);
  userMessageRateLimits.set(userId, recent);
  return true;
}

// GET /api/messages/conversations - List conversations with last message & unread count
router.get("/conversations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.userId);

    // Aggregate to find most recent message per conversation
    const messages = await DirectMessage.find({
      $or: [
        { senderId: currentUserId, deletedBySender: false },
        { recipientId: currentUserId, deletedByRecipient: false },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    const conversationMap = new Map<string, any>();

    for (const msg of messages) {
      const isSender = msg.senderId.toString() === req.userId;
      const partnerId = isSender ? msg.recipientId.toString() : msg.senderId.toString();

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          lastMessage: {
            id: msg._id,
            text: msg.message,
            senderId: msg.senderId.toString(),
            createdAt: msg.createdAt,
            read: msg.read,
          },
          unreadCount: 0,
        });
      }

      if (!isSender && !msg.read) {
        const conv = conversationMap.get(partnerId);
        conv.unreadCount += 1;
      }
    }

    const partnerIds = Array.from(conversationMap.keys());
    const partners = await User.find({ _id: { $in: partnerIds } })
      .select("_id username avatar rating")
      .lean();

    const partnerProfileMap = new Map(partners.map((p: any) => [p._id.toString(), p]));

    const conversations = Array.from(conversationMap.values()).map((conv) => {
      const partner = partnerProfileMap.get(conv.partnerId) || {
        _id: conv.partnerId,
        username: "Unknown Player",
        rating: 1200,
      };

      return {
        ...conv,
        partner: {
          ...partner,
          online: isUserOnline(conv.partnerId),
        },
      };
    });

    return res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("GET /api/messages/conversations error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load conversations",
    });
  }
});

// GET /api/messages/:otherUserId - Paginated messages for a conversation (R4.37)
router.get("/:otherUserId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const otherUserId = String(Array.isArray(req.params.otherUserId) ? req.params.otherUserId[0] : req.params.otherUserId);
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const limit = Math.min(parseInt(String(req.query.limit || "30"), 10), 100);
    const before = req.query.before ? new Date(String(req.query.before)) : null;

    const query: any = {
      $or: [
        { senderId: req.userId, recipientId: otherUserId, deletedBySender: false },
        { senderId: otherUserId, recipientId: req.userId, deletedByRecipient: false },
      ],
    };

    if (before && !isNaN(before.getTime())) {
      query.createdAt = { $lt: before };
    }

    const messages = await DirectMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const hasMore = messages.length === limit;

    // Return in chronological order for UI display
    return res.json({
      success: true,
      messages: messages.reverse(),
      hasMore,
    });
  } catch (error) {
    console.error("GET /api/messages/:otherUserId error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load messages",
    });
  }
});

// POST /api/messages/:otherUserId - Send direct message (R4.34, R4.35, R4.40)
router.post("/:otherUserId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const otherUserId = String(Array.isArray(req.params.otherUserId) ? req.params.otherUserId[0] : req.params.otherUserId);
    const text = String(req.body.message || "").trim();

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ success: false, message: "Invalid recipient ID" });
    }

    if (otherUserId === req.userId) {
      return res.status(400).json({ success: false, message: "Cannot message yourself" });
    }

    if (!text || text.length === 0) {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    if (text.length > 500) {
      return res.status(400).json({ success: false, message: "Message exceeds 500 characters" });
    }

    // Rate limiting check (R4.40)
    if (!checkMessageRateLimit(req.userId!)) {
      return res.status(429).json({
        success: false,
        message: "You are sending messages too quickly. Please wait a moment.",
      });
    }

    // Check block list
    const [sender, recipient] = await Promise.all([
      User.findById(req.userId).select("username avatar rating blockedUserIds"),
      User.findById(otherUserId).select("username avatar rating blockedUserIds"),
    ]);

    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found" });
    }

    const senderBlocked = (sender?.blockedUserIds || []).map((id: any) => id.toString());
    const recipientBlocked = (recipient?.blockedUserIds || []).map((id: any) => id.toString());

    if (senderBlocked.includes(otherUserId) || recipientBlocked.includes(req.userId!)) {
      return res.status(403).json({
        success: false,
        message: "Unable to send message to this user",
      });
    }

    const message = await DirectMessage.create({
      senderId: req.userId,
      recipientId: otherUserId,
      message: text,
      read: false,
    });

    const msgPayload = {
      _id: message._id.toString(),
      senderId: req.userId,
      recipientId: otherUserId,
      message: text,
      read: false,
      createdAt: message.createdAt,
      sender: {
        _id: sender?._id,
        username: sender?.username,
        avatar: sender?.avatar,
      },
    };

    // Emit realtime socket event to recipient and sender
    emitToUser(otherUserId, "social:message", msgPayload);
    emitToUser(req.userId!, "social:message", msgPayload);

    // Create social notification if not online
    if (!isUserOnline(otherUserId)) {
      const notification = await Notification.create({
        userId: otherUserId,
        type: "message",
        actorId: req.userId,
        actorUsername: sender?.username || "Player",
        title: "New message",
        message: `${sender?.username || "Someone"} sent you a message.`,
        referenceId: message._id.toString(),
      });
      emitToUser(otherUserId, "notification:new", notification);
      emitToUser(otherUserId, "social:notification", notification);
    }

    return res.status(201).json({
      success: true,
      message: msgPayload,
    });
  } catch (error) {
    console.error("POST /api/messages/:otherUserId error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});

// DELETE /api/messages/:messageId - Delete own message (R4.35)
router.delete("/:messageId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const messageId = String(Array.isArray(req.params.messageId) ? req.params.messageId[0] : req.params.messageId);
    const message = await DirectMessage.findOne({
      _id: messageId,
      senderId: req.userId,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or not authorized to delete",
      });
    }

    message.deletedBySender = true;
    await message.save();

    emitToUser(message.recipientId.toString(), "message:deleted", {
      messageId: message._id.toString(),
      senderId: req.userId,
    });
    emitToUser(req.userId!, "message:deleted", {
      messageId: message._id.toString(),
      senderId: req.userId,
    });

    return res.json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    console.error("DELETE /api/messages/:messageId error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete message",
    });
  }
});

// PATCH /api/messages/:otherUserId/read - Mark conversation as read (R4.39)
router.patch("/:otherUserId/read", requireAuth, async (req: AuthRequest, res) => {
  try {
    const otherUserId = String(Array.isArray(req.params.otherUserId) ? req.params.otherUserId[0] : req.params.otherUserId);

    await DirectMessage.updateMany(
      {
        senderId: otherUserId,
        recipientId: req.userId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      },
    );

    emitToUser(otherUserId, "message:read", {
      byUserId: req.userId,
    });

    return res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("PATCH /api/messages/:otherUserId/read error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update read state",
    });
  }
});

export default router;
