import { Router } from "express";
import { Announcement } from "../models/Announcement.js";

const router = Router();

/**
 * GET /api/announcements/active
 * Public endpoint for player UI to fetch current active announcements
 */
router.get("/active", async (_req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      isActive: true,
      startTime: { $lte: now },
      $or: [{ endTime: null }, { endTime: { $gt: now } }],
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    return res.json({ success: true, announcements });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch announcements" });
  }
});

export default router;
