import { Router } from "express";

import { Challenge } from "../models/Challenge.js";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { createNotification } from "../services/notification.js";

const router = Router();

router.post(
  "/",
  requireAuth,
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

      const challenger =
        await User.findById(
          req.userId,
        );

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

    return res.json({
      success: true,
      challenge,
    });
  },
);

export default router;
