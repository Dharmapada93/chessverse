import { Router } from "express";

import { Notification } from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    try {
      const notifications =
        await Notification.find({
          userId: req.userId,
        })
          .sort({
            createdAt: -1,
          })
          .limit(50);

      return res.json({
        success: true,
        notifications,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message:
          "Failed to load notifications",
      });
    }
  },
);

router.get(
  "/unread-count",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const count =
      await Notification.countDocuments({
        userId: req.userId,
        read: false,
      });

    return res.json({
      success: true,
      count,
    });
  },
);

router.patch(
  "/:id/read",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.userId,
        },
        {
          read: true,
        },
        {
          new: true,
        },
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    return res.json({
      success: true,
      notification,
    });
  },
);

router.patch(
  "/read-all",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    await Notification.updateMany(
      {
        userId: req.userId,
        read: false,
      },
      {
        read: true,
      },
    );

    return res.json({
      success: true,
    });
  },
);

export default router;
