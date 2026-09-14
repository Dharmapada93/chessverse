import { Router } from "express";
import { Room } from "../models/Room.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const {
      name,
      visibility,
      rated,
      spectators,
      timeControl,
    } = req.body;

    if (
      !name ||
      !timeControl ||
      typeof timeControl.minutes !==
        "number" ||
      typeof timeControl.increment !==
        "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid room data",
      });
    }

    const code = generateRoomCode();

    const room = await Room.create({
      code,
      name,
      visibility,
      rated,
      spectators,
      timeControl,
      status: "waiting",
    });

    return res.status(201).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create room",
    });
  }
});

router.get("/:code", async (req, res) => {
  try {
    const room = await Room.findOne({
      code: req.params.code.toUpperCase(),
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.json({
      success: true,
      room,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to find room",
    });
  }
});

function generateRoomCode() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "CV-";

  for (let i = 0; i < 4; i++) {
    code += characters.charAt(
      Math.floor(
        Math.random() * characters.length,
      ),
    );
  }

  return code;
}

export default router;
