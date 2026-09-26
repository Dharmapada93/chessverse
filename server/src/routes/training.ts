import { Router } from "express";
import mongoose from "mongoose";
import { TrainingProgress } from "../models/TrainingProgress.js";
import { detectPlayerWeaknesses } from "../services/training/weaknessDetector.js";
import { generateWeeklyReport } from "../services/training/trainingPlan.js";

const router = Router();

router.get("/:userId/weekly-report", async (req, res) => {
  try {
    const { userId } = req.params;
    const report = await generateWeeklyReport(userId);
    return res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Weekly report error:", error);
    return res.status(500).json({
      message: "Failed to generate weekly report",
    });
  }
});

router.get("/:userId/weaknesses", async (req, res) => {
  try {
    const { userId } = req.params;
    const weaknesses = await detectPlayerWeaknesses(userId);
    return res.json({
      success: true,
      weaknesses,
    });
  } catch (error) {
    console.error("Weakness detector error:", error);
    return res.status(500).json({
      message: "Failed to detect player weaknesses",
    });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      // Return realistic defaults for demo / unauthenticated usage
      return res.json({
        progress: {
          puzzleRating: 1100,
          puzzlesSolved: 14,
          puzzlesAttempted: 18,
          currentStreak: 4,
          longestStreak: 7,
          themes: [
            { theme: "forks", solved: 6, attempted: 7 },
            { theme: "pins", solved: 5, attempted: 6 },
            { theme: "back-rank", solved: 3, attempted: 5 },
          ],
        },
      });
    }

    let progress =
      await TrainingProgress.findOne({
        userId,
      });

    if (!progress) {
      progress =
        await TrainingProgress.create({
          userId,
        });
    }

    return res.json({
      progress,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to load training progress",
    });
  }
});

export default router;
