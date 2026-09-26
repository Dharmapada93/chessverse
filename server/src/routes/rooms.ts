import { Router } from "express";
import mongoose from "mongoose";
import { Room } from "../models/Room.js";
import { User } from "../models/User.js";
import { generateRoomCode } from "../utils/roomCode.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    let {
      userId,
      name,
      visibility,
      rated,
      timeControl,
    } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      // Find a default user or fallback user so guest creation works gracefully
      const defaultUser = await User.findOne();
      if (defaultUser) {
        userId = defaultUser._id;
      } else {
        return res.status(400).json({
          message: "userId is required",
        });
      }
    }

    const activeRooms = await Room.countDocuments({
      hostId: userId,
      status: { $in: ["waiting", "playing"] },
    });
    if (activeRooms >= 5) {
      return res.status(429).json({
        success: false,
        message: "Active room limit reached (maximum 5 active rooms).",
      });
    }

    let code = generateRoomCode();

    while (await Room.exists({ code })) {
      code = generateRoomCode();
    }

    const room = await Room.create({
      code,
      hostId: userId,
      status: "waiting",
      spectators: [],
      name: name || "Chess Match",
      visibility: visibility || "private",
      rated: Boolean(rated),
      timeControl: timeControl || {
        minutes: 10,
        increment: 0,
        label: "10+0",
      },
    });

    return res.status(201).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create room",
    });
  }
});

router.get("/:code", async (req, res) => {
  try {
    const rawCode = req.params.code;
    const isObjectId = mongoose.Types.ObjectId.isValid(rawCode);

    const query = isObjectId
      ? { $or: [{ _id: rawCode }, { code: rawCode.toUpperCase() }] }
      : { code: rawCode.toUpperCase() };

    const room = await Room.findOne(query)
      .populate("hostId", "username avatar rating")
      .populate("guestId", "username avatar rating")
      .populate("spectators", "username avatar rating");

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    return res.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to load room",
    });
  }
});

router.post("/:code/spectate", async (req, res) => {
  try {
    let { userId } = req.body;

    const rawCode = req.params.code;
    const isObjectId = mongoose.Types.ObjectId.isValid(rawCode);

    const query = isObjectId
      ? { $or: [{ _id: rawCode }, { code: rawCode.toUpperCase() }] }
      : { code: rawCode.toUpperCase() };

    const room = await Room.findOne(query);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const alreadySpectating = room.spectators.some(
        (id: any) => id.toString() === userId.toString(),
      );

      if (!alreadySpectating) {
        room.spectators.push(userId);
        await room.save();
      }
    }

    return res.json({
      success: true,
      spectatorsCount: room.spectators.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to join spectator mode",
    });
  }
});

export default router;
