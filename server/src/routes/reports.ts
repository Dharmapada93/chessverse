import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { reportLimiter } from "../middleware/rateLimiter.js";
import { Report } from "../models/Report.js";
import { User } from "../models/User.js";

const router = Router();

// POST /api/reports - File a confidential user report
router.post("/", requireAuth, reportLimiter, async (req: AuthRequest, res) => {
  try {
    const reporterId = req.userId;
    const { reportedUserId, category, description, gameId } = req.body;

    if (!reportedUserId || !mongoose.Types.ObjectId.isValid(reportedUserId)) {
      return res.status(400).json({
        success: false,
        message: "A valid reported user ID is required.",
      });
    }

    if (reportedUserId === reporterId) {
      return res.status(400).json({
        success: false,
        message: "You cannot report yourself.",
      });
    }

    const validCategories = ["Cheating", "Harassment", "Spam", "Inappropriate content", "Abusive behavior", "Other"];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${validCategories.join(", ")}`,
      });
    }

    const targetUser = await User.findById(reportedUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target user not found.",
      });
    }

    const report = await Report.create({
      reporterId,
      reportedUserId,
      category,
      description: description ? String(description).trim().slice(0, 1000) : "",
      gameId: gameId && mongoose.Types.ObjectId.isValid(gameId) ? gameId : undefined,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully. Our safety team will review it confidentially.",
      reportId: report._id,
    });
  } catch (error) {
    console.error("POST /api/reports error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit report. Please try again later.",
    });
  }
});

export default router;
