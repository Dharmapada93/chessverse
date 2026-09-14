import { Router } from "express";
import { Message } from "../models/Message.js";
import {
  requireAuth,
  type AuthRequest,
} from "../middleware/auth.js";

const router = Router();

router.get(
  "/:roomId",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    try {
      const messages =
        await Message.find({
          roomId:
            req.params.roomId,
        })
          .sort({
            createdAt: -1,
          })
          .limit(100)
          .lean();

      return res.json({
        success: true,
        messages:
          messages.reverse(),
      });
    } catch {
      return res.status(500).json({
        success: false,
        message:
          "Failed to load messages",
      });
    }
  },
);

export default router;
