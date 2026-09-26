import { Router } from "express";
import { CoachProfile } from "../models/CoachProfile.js";

const router = Router();

router.get("/:userId", async (req, res) => {
  try {
    const profile =
      await CoachProfile.findOne({
        userId: req.params.userId,
      });

    res.json({
      profile,
    });
  } catch {
    res.status(500).json({
      message: "Failed to load coach profile",
    });
  }
});

export default router;
