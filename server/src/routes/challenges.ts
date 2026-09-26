import { Router } from "express";

import crypto from "node:crypto";
import { Challenge } from "../models/Challenge.js";
import { User } from "../models/User.js";
import { GameInviteToken } from "../models/GameInviteToken.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { createNotification } from "../services/notification.js";
import { createPrivateRoom } from "../services/room.js";
import {
  createGameForRoom,
  assignPlayerToGame,
} from "../services/game.js";
import { emitToUser } from "../socket/socket.js";
import { friendRequestLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  friendRequestLimiter,
  async (
    req: AuthRequest,
    res,
  ) => {
    try {
      const {
        username,
        timeControl,
        rated = true,
        colorPreference = "random",
      } = req.body;

      const opponent =
        await User.findOne({
          username,
        });

      if (!opponent) {
        return res.status(404).json({
          success: false,
          message: "Player not found",
        });
      }

      if (
        opponent._id.toString() ===
        req.userId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot challenge yourself",
        });
      }

      // Check if either player has blocked the other (Step 78.7)
      const challenger = await User.findById(req.userId);
      const challengerBlocked = (challenger?.blockedUserIds || []).map((id: any) => id.toString());
      if (challengerBlocked.includes(opponent._id.toString())) {
        return res.status(400).json({
          success: false,
          message: "You have blocked this player. Unblock them first.",
        });
      }

      const opponentBlocked = (opponent.blockedUserIds || []).map((id: any) => id.toString());
      if (opponentBlocked.includes(req.userId)) {
        return res.status(403).json({
          success: false,
          message: "Unable to challenge this player.",
        });
      }

      // Check MAX_PENDING_INVITES = 20 (Step 77.6)
      const pendingCount = await Challenge.countDocuments({
        challengerId: req.userId,
        status: "pending",
      });
      if (pendingCount >= 20) {
        return res.status(429).json({
          success: false,
          message: "Pending challenge limit reached (max 20). Please wait for responses.",
        });
      }

      const existing =
        await Challenge.findOne({
          challengerId: req.userId,
          challengedId:
            opponent._id.toString(),
          status: "pending",
        });

      if (existing) {
        return res.status(409).json({
          success: false,
          message:
            "Challenge already pending",
        });
      }

      const challenge =
        await Challenge.create({
          challengerId: req.userId,
          challengedId:
            opponent._id.toString(),

          timeControl,

          rated,

          colorPreference,

          expiresAt:
            new Date(
              Date.now() +
                10 * 60 * 1000,
            ),
        });

      if (challenger) {
        await createNotification({
          userId:
            opponent._id.toString(),

          type: "challenge",

          title:
            "New chess challenge",

          message:
            `${challenger.username} challenged you to a chess game.`,

          actorId:
            challenger._id.toString(),

          actorUsername:
            challenger.username,

          referenceId:
            challenge._id.toString(),
        });
      }

      return res.status(201).json({
        success: true,
        challenge,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message:
          "Failed to create challenge",
      });
    }
  },
);

router.post(
  "/:id/accept",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const challenge =
      await Challenge.findOne({
        _id: req.params.id,
        challengedId: req.userId,
        status: "pending",
      });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message:
          "Challenge not found",
      });
    }

    if (
      challenge.expiresAt <
      new Date()
    ) {
      challenge.status =
        "expired";

      await challenge.save();

      return res.status(400).json({
        success: false,
        message:
          "Challenge has expired",
      });
    }

    challenge.status =
      "accepted";

    const room =
      await createPrivateRoom(
        "Chess Challenge",
        challenge.timeControl.minutes,
        challenge.timeControl.increment,
        challenge.challengerId,
      );

    const game =
      await createGameForRoom(
        room._id.toString(),
      );

    await assignPlayerToGame(
      game._id.toString(),
      challenge.challengerId,
    );

    await assignPlayerToGame(
      game._id.toString(),
      challenge.challengedId,
    );

    challenge.roomId =
      room._id.toString();

    challenge.gameId =
      game._id.toString();

    await challenge.save();

    await createNotification({
      userId:
        challenge.challengerId,

      type:
        "friend_accepted",

      title:
        "Challenge accepted",

      message:
        "Your chess challenge was accepted.",

      referenceId:
        challenge._id.toString(),
    });

    return res.json({
      success: true,

      challenge,

      room: {
        id: room._id,
        code: room.code,
      },

      game: {
        id: game._id,
      },
    });
  },
);

router.post(
  "/:id/decline",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const challenge =
      await Challenge.findOne({
        _id: req.params.id,
        challengedId: req.userId,
        status: "pending",
      });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message:
          "Challenge not found",
      });
    }

    challenge.status =
      "declined";

    await challenge.save();

    emitToUser(challenge.challengerId, "social:game-invite-declined", {
      challengeId: challenge._id,
    });

    return res.json({
      success: true,
      challenge,
    });
  },
);

// POST /api/challenges/:id/cancel - Cancel outgoing challenge (R4.17)
router.post(
  "/:id/cancel",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const challenge = await Challenge.findOne({
        _id: req.params.id,
        challengerId: req.userId,
        status: "pending",
      });

      if (!challenge) {
        return res.status(404).json({
          success: false,
          message: "Challenge not found or already processed",
        });
      }

      challenge.status = "declined"; // or cancelled
      await challenge.save();

      emitToUser(challenge.challengedId, "social:game-invite-cancelled", {
        challengeId: challenge._id,
      });

      return res.json({
        success: true,
        message: "Challenge cancelled",
      });
    } catch (error) {
      console.error("POST /api/challenges/:id/cancel error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to cancel challenge",
      });
    }
  },
);

// POST /api/challenges/invite - Generate shareable invite link (R4.32, R4.33)
router.post(
  "/invite",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const {
        timeControl = { initialTime: 600000, increment: 0 },
        colorPreference = "random",
        rated = true,
      } = req.body;

      const token = crypto.randomBytes(6).toString("hex"); // e.g. 'a8f3b2c19e'
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min validity

      const invite = await GameInviteToken.create({
        token,
        creatorId: req.userId,
        timeControl,
        colorPreference,
        rated,
        status: "active",
        expiresAt,
      });

      const user = await User.findById(req.userId).select("username avatar rating");

      return res.status(201).json({
        success: true,
        invite: {
          token: invite.token,
          inviteUrl: `/game/invite/${invite.token}`,
          creator: user,
          timeControl: invite.timeControl,
          colorPreference: invite.colorPreference,
          rated: invite.rated,
          expiresAt: invite.expiresAt,
        },
      });
    } catch (error) {
      console.error("POST /api/challenges/invite error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create invite link",
      });
    }
  },
);

// GET /api/challenges/invite/:token - Validate & inspect invite link (R4.33)
router.get(
  "/invite/:token",
  async (req, res) => {
    try {
      const { token } = req.params;
      const invite = await GameInviteToken.findOne({ token })
        .populate("creatorId", "_id username avatar rating")
        .lean();

      if (!invite) {
        return res.status(404).json({
          success: false,
          message: "Invitation link not found",
        });
      }

      if (invite.status !== "active" || new Date() > new Date(invite.expiresAt)) {
        return res.status(410).json({
          success: false,
          message: "This invitation link has expired or has already been used",
          status: invite.status === "active" ? "expired" : invite.status,
        });
      }

      return res.json({
        success: true,
        invite: {
          token: invite.token,
          creator: invite.creatorId,
          timeControl: invite.timeControl,
          colorPreference: invite.colorPreference,
          rated: invite.rated,
          expiresAt: invite.expiresAt,
        },
      });
    } catch (error) {
      console.error("GET /api/challenges/invite/:token error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to load invitation",
      });
    }
  },
);

// POST /api/challenges/invite/:token/accept - Accept shareable invite link (R4.33)
router.post(
  "/invite/:token/accept",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const { token } = req.params;
      const invite = await GameInviteToken.findOne({ token, status: "active" });

      if (!invite) {
        return res.status(404).json({
          success: false,
          message: "Invitation not found or no longer active",
        });
      }

      if (invite.creatorId.toString() === req.userId) {
        return res.status(400).json({
          success: false,
          message: "You cannot accept your own invitation link",
        });
      }

      if (new Date() > new Date(invite.expiresAt)) {
        invite.status = "expired";
        await invite.save();
        return res.status(410).json({
          success: false,
          message: "Invitation link has expired",
        });
      }

      const initialTime = invite.timeControl?.initialTime || 600000;
      const increment = invite.timeControl?.increment || 0;
      const minutes = Math.max(1, Math.round(initialTime / 60000));

      const room = await createPrivateRoom(
        "Invite Link Match",
        minutes,
        increment,
        invite.creatorId.toString(),
      );

      const game = await createGameForRoom(room._id.toString());
      await assignPlayerToGame(game._id.toString(), invite.creatorId.toString());
      await assignPlayerToGame(game._id.toString(), req.userId!);

      invite.status = "used";
      invite.acceptedById = req.userId as any;
      invite.gameId = game._id;
      await invite.save();

      emitToUser(invite.creatorId.toString(), "social:game-invite-accepted", {
        gameId: game._id.toString(),
        roomId: room.code,
      });

      return res.json({
        success: true,
        gameId: game._id.toString(),
        roomId: room.code,
      });
    } catch (error) {
      console.error("POST /api/challenges/invite/:token/accept error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to accept invite link",
      });
    }
  },
);

export default router;
