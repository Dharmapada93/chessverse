import { Router } from "express";
import {
  requireAuth,
  type AuthRequest,
} from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Friendship } from "../models/Friendship.js";
import { Follow } from "../models/Follow.js";

const router = Router();

router.post(
  "/follow/:username",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    try {
      const target =
        await User.findOne({
          username:
            req.params.username,
        });

      if (!target) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      if (
        target._id.toString() ===
        req.userId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot follow yourself",
        });
      }

      await Follow.updateOne(
        {
          followerId:
            req.userId,
          followingId:
            target._id.toString(),
        },
        {
          followerId:
            req.userId,
          followingId:
            target._id.toString(),
        },
        {
          upsert: true,
        },
      );

      return res.json({
        success: true,
        message: "Following user",
      });
    } catch {
      return res.status(500).json({
        success: false,
        message:
          "Failed to follow user",
      });
    }
  },
);

router.delete(
  "/follow/:username",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const target =
      await User.findOne({
        username:
          req.params.username,
      });

    if (!target) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    await Follow.deleteOne({
      followerId:
        req.userId,
      followingId:
        target._id.toString(),
    });

    return res.json({
      success: true,
      message: "Unfollowed user",
    });
  },
);

router.post(
  "/friend/:username",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const target =
      await User.findOne({
        username:
          req.params.username,
      });

    if (!target) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    if (
      target._id.toString() ===
      req.userId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot friend yourself",
      });
    }

    const existing =
      await Friendship.findOne({
        $or: [
          {
            requesterId:
              req.userId,
            receiverId:
              target._id.toString(),
          },
          {
            requesterId:
              target._id.toString(),
            receiverId:
              req.userId,
          },
        ],
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "Friend request already exists",
      });
    }

    await Friendship.create({
      requesterId:
        req.userId,
      receiverId:
        target._id.toString(),
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message:
        "Friend request sent",
    });
  },
);

router.post(
  "/friend/:id/accept",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const friendship =
      await Friendship.findOne({
        _id: req.params.id,
        receiverId:
          req.userId,
        status: "pending",
      });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message:
          "Friend request not found",
      });
    }

    friendship.status =
      "accepted";

    await friendship.save();

    return res.json({
      success: true,
      message: "Friend request accepted",
    });
  },
);

router.get(
  "/friends",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const friendships =
      await Friendship.find({
        $or: [
          {
            requesterId:
              req.userId,
            status: "accepted",
          },
          {
            receiverId:
              req.userId,
            status: "accepted",
          },
        ],
      });

    const ids =
      friendships.map((item) =>
        item.requesterId ===
        req.userId
          ? item.receiverId
          : item.requesterId,
      );

    const friends =
      await User.find({
        _id: {
          $in: ids,
        },
      }).select(
        "_id username avatar rating",
      );

    return res.json({
      success: true,
      friends,
    });
  },
);

export default router;
