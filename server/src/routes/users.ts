import { Router } from "express";
import { User } from "../models/User.js";

const router = Router();

router.get(
  "/:username",
  async (req, res) => {
    try {
      const user =
        await User.findOne({
          username:
            req.params.username,
        }).select(
          "_id username avatar rating createdAt",
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      return res.json({
        success: true,
        user,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message:
          "Failed to load profile",
      });
    }
  },
);

export default router;
