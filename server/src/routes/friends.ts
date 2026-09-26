import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { friendRequestLimiter } from "../middleware/rateLimiter.js";
import { User } from "../models/User.js";
import { Friendship } from "../models/Friendship.js";
import { Notification } from "../models/Notification.js";
import { Game } from "../models/Game.js";
import { isUserOnline, emitToUser } from "../socket/socket.js";

const router = Router();

// GET /api/friends - List all accepted friends
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    const friendships = await Friendship.find({
      $or: [
        { requesterId: userId, status: "accepted" },
        { recipientId: userId, status: "accepted" },
        // backward compat if receiverId was stored
        { receiverId: userId, status: "accepted" },
      ],
    });

    const friendIds = friendships.map((f) => {
      const rId = f.requesterId?.toString();
      const recId = (f.recipientId || f.receiverId)?.toString();
      return rId === userId ? recId : rId;
    }).filter(Boolean);

    const users = await User.find({ _id: { $in: friendIds } })
      .select("_id username avatar rating progression updatedAt")
      .lean();

    const activeGames = await Game.find({
      status: "playing",
      $or: [
        { whitePlayerId: { $in: friendIds } },
        { blackPlayerId: { $in: friendIds } },
      ],
    })
      .select("_id roomId whitePlayerId blackPlayerId whitePlayerName blackPlayerName")
      .lean();

    const gameMap = new Map<string, any>();
    for (const g of activeGames) {
      if (g.whitePlayerId) gameMap.set(g.whitePlayerId.toString(), {
        gameId: g._id.toString(),
        roomId: g.roomId,
        opponentName: g.blackPlayerName,
      });
      if (g.blackPlayerId) gameMap.set(g.blackPlayerId.toString(), {
        gameId: g._id.toString(),
        roomId: g.roomId,
        opponentName: g.whitePlayerName,
      });
    }

    const friends = users.map((user: any) => {
      const uId = user._id.toString();
      const online = isUserOnline(uId);
      const activeGame = gameMap.get(uId);

      return {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        rating: user.rating,
        online,
        inGame: !!activeGame,
        currentGameId: activeGame?.gameId,
        roomId: activeGame?.roomId,
        opponentName: activeGame?.opponentName,
        presence: activeGame ? "playing" : online ? "online" : "offline",
        lastSeen: user.progression?.lastActiveDate || user.updatedAt,
      };
    });

    return res.json({
      success: true,
      friends,
    });
  } catch (error) {
    console.error("GET /api/friends error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch friends",
    });
  }
});

// GET /api/friends/requests - List pending incoming and outgoing requests
router.get("/requests", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    const incoming = await Friendship.find({
      $or: [{ recipientId: userId }, { receiverId: userId }],
      status: "pending",
    })
      .populate("requesterId", "_id username avatar rating")
      .lean();

    const outgoing = await Friendship.find({
      requesterId: userId,
      status: "pending",
    })
      .populate("recipientId", "_id username avatar rating")
      .lean();

    return res.json({
      success: true,
      incoming: incoming.map((reqItem: any) => ({
        id: reqItem._id,
        user: reqItem.requesterId,
        createdAt: reqItem.createdAt,
      })),
      outgoing: outgoing.map((reqItem: any) => ({
        id: reqItem._id,
        user: reqItem.recipientId,
        createdAt: reqItem.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/friends/requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch friend requests",
    });
  }
});

// GET /api/friends/search?q=... - Search users and indicate friendship status
router.get("/search", requireAuth, async (req: AuthRequest, res) => {
  try {
    const query = String(req.query.q || "").trim();
    if (!query) {
      return res.json({ success: true, users: [] });
    }

    const currentUserId = req.userId;
    const currentUser = await User.findById(currentUserId).select("blockedUserIds");
    const blockedByMe = (currentUser?.blockedUserIds || []).map((id: any) => id.toString());

    const users = await User.find({
      username: { $regex: query, $options: "i" },
      _id: { $nin: [currentUserId, ...blockedByMe] },
      blockedUserIds: { $ne: new mongoose.Types.ObjectId(currentUserId) },
    })
      .select("_id username avatar rating")
      .limit(20)
      .lean();

    const userIds = users.map((u: any) => u._id);

    const existingFriendships = await Friendship.find({
      $or: [
        { requesterId: currentUserId, recipientId: { $in: userIds } },
        { requesterId: { $in: userIds }, recipientId: currentUserId },
        { requesterId: currentUserId, receiverId: { $in: userIds } },
        { requesterId: { $in: userIds }, receiverId: currentUserId },
      ],
    });

    const results = users.map((user: any) => {
      const uId = user._id.toString();
      const friendship = existingFriendships.find((f) => {
        const reqId = f.requesterId?.toString();
        const recId = (f.recipientId || f.receiverId)?.toString();
        return (reqId === currentUserId && recId === uId) || (reqId === uId && recId === currentUserId);
      });

      let relationship = "none";
      let friendshipId = null;

      if (friendship) {
        friendshipId = friendship._id;
        if (friendship.status === "accepted") {
          relationship = "friends";
        } else if (friendship.status === "pending") {
          const reqId = friendship.requesterId?.toString();
          relationship = reqId === currentUserId ? "pending_sent" : "pending_received";
        } else {
          relationship = friendship.status;
        }
      }

      return {
        ...user,
        online: isUserOnline(uId),
        relationship,
        friendshipId,
      };
    });

    return res.json({
      success: true,
      users: results,
    });
  } catch (error) {
    console.error("GET /api/friends/search error:", error);
    return res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
});

// POST /api/friends/request - Send friend request (Step 65.2, Step 77.5, Step 77.6, Step 78.7)
router.post("/request", requireAuth, friendRequestLimiter, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target user ID",
      });
    }

    if (userId === req.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot add yourself as a friend",
      });
    }

    // Check if either player has blocked the other (Step 78.7)
    const currentUser = await User.findById(req.userId);
    const myBlocked = (currentUser?.blockedUserIds || []).map((id: any) => id.toString());
    if (myBlocked.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You have blocked this user. Unblock them first.",
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const targetBlocked = (targetUser.blockedUserIds || []).map((id: any) => id.toString());
    if (targetBlocked.includes(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "Unable to send friend request",
      });
    }

    // Check MAX_PENDING_INVITES = 20 (Step 77.6)
    const pendingCount = await Friendship.countDocuments({
      requesterId: req.userId,
      status: "pending",
    });
    if (pendingCount >= 20) {
      return res.status(429).json({
        success: false,
        message: "Pending friend request limit reached (max 20). Please wait for responses.",
      });
    }

    const existing = await Friendship.findOne({
      $or: [
        { requesterId: req.userId, recipientId: userId },
        { requesterId: userId, recipientId: req.userId },
        { requesterId: req.userId, receiverId: userId },
        { requesterId: userId, receiverId: req.userId },
      ],
    });

    if (existing) {
      if (existing.status === "accepted") {
        return res.status(400).json({
          success: false,
          message: "You are already friends with this user",
        });
      }
      if (existing.status === "pending") {
        return res.status(400).json({
          success: false,
          message: "A friend request is already pending",
        });
      }
      if (existing.status === "blocked") {
        return res.status(403).json({
          success: false,
          message: "Unable to send friend request",
        });
      }
    }

    const friendship = await Friendship.create({
      requesterId: req.userId,
      recipientId: userId,
      status: "pending",
    });

    const sender = await User.findById(req.userId).select("username avatar rating");

    const notification = await Notification.create({
      userId: targetUser._id,
      type: "friend_request",
      actorId: req.userId,
      actorUsername: sender?.username || "Someone",
      title: "New Friend Request",
      message: `${sender?.username || "A player"} sent you a friend request.`,
      referenceId: friendship._id.toString(),
    });

    emitToUser(userId, "notification:new", notification);
    emitToUser(userId, "social:notification", notification);
    emitToUser(userId, "friend:request", {
      friendshipId: friendship._id,
      from: sender,
    });
    emitToUser(userId, "social:friend-request", {
      friendshipId: friendship._id,
      from: sender,
    });

    return res.status(201).json({
      success: true,
      message: "Friend request sent",
      friendship,
    });
  } catch (error) {
    console.error("POST /api/friends/request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send friend request",
    });
  }
});

// POST /api/friends/:id/accept - Accept friend request (Step 65.3)
router.post("/:id/accept", requireAuth, async (req: AuthRequest, res) => {
  try {
    const friendship = await Friendship.findOne({
      _id: req.params.id,
      $or: [{ recipientId: req.userId }, { receiverId: req.userId }],
      status: "pending",
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    friendship.status = "accepted";
    await friendship.save();

    const currentUser = await User.findById(req.userId).select("username avatar rating");
    const requesterId = friendship.requesterId.toString();

    const notification = await Notification.create({
      userId: friendship.requesterId,
      type: "friend_accepted",
      actorId: req.userId,
      actorUsername: currentUser?.username || "A friend",
      title: "Friend Request Accepted",
      message: `${currentUser?.username || "Your friend"} accepted your friend request.`,
      referenceId: friendship._id.toString(),
    });

    emitToUser(requesterId, "notification:new", notification);
    emitToUser(requesterId, "social:notification", notification);
    emitToUser(requesterId, "friend:accepted", {
      friendshipId: friendship._id,
      user: currentUser,
    });
    emitToUser(requesterId, "social:friend-accepted", {
      friendshipId: friendship._id,
      user: currentUser,
    });

    return res.json({
      success: true,
      message: "Friend request accepted",
      friendship,
    });
  } catch (error) {
    console.error("POST /api/friends/:id/accept error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to accept friend request",
    });
  }
});

// POST /api/friends/:id/decline - Decline friend request
router.post("/:id/decline", requireAuth, async (req: AuthRequest, res) => {
  try {
    const friendship = await Friendship.findOne({
      _id: req.params.id,
      $or: [{ recipientId: req.userId }, { receiverId: req.userId }],
      status: "pending",
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    friendship.status = "declined";
    await friendship.save();

    emitToUser(friendship.requesterId.toString(), "social:friend-declined", {
      friendshipId: friendship._id,
    });

    return res.json({
      success: true,
      message: "Friend request declined",
    });
  } catch (error) {
    console.error("POST /api/friends/:id/decline error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to decline friend request",
    });
  }
});

// DELETE /api/friends/:id - Remove a friend
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const targetId = String(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    await Friendship.deleteOne({
      $or: [
        { requesterId: userId, recipientId: targetId },
        { requesterId: targetId, recipientId: userId },
        { requesterId: userId, receiverId: targetId },
        { requesterId: targetId, receiverId: userId },
      ],
    });

    emitToUser(targetId, "social:friend-removed", {
      userId,
    });

    return res.json({
      success: true,
      message: "Friend removed",
    });
  } catch (error) {
    console.error("DELETE /api/friends/:id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove friend",
    });
  }
});

// POST /api/friends/:id/cancel - Cancel outgoing friend request (R4.6)
router.post("/:id/cancel", requireAuth, async (req: AuthRequest, res) => {
  try {
    const friendship = await Friendship.findOne({
      _id: req.params.id,
      requesterId: req.userId,
      status: "pending",
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found or already handled",
      });
    }

    const recipientId = (friendship.recipientId || friendship.receiverId)?.toString();
    await Friendship.deleteOne({ _id: friendship._id });

    if (recipientId) {
      emitToUser(recipientId, "social:friend-removed", {
        friendshipId: friendship._id,
        userId: req.userId,
      });
    }

    return res.json({
      success: true,
      message: "Friend request cancelled",
    });
  } catch (error) {
    console.error("POST /api/friends/:id/cancel error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel friend request",
    });
  }
});

export default router;
