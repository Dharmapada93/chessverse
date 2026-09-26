import mongoose from "mongoose";
import { Chess } from "chess.js";

import { Game } from "../models/Game.js";
import { Room } from "../models/Room.js";
import { User } from "../models/User.js";
import { logger } from "../utils/logger.js";

export async function createGameForRoom(
  roomId: string,
) {
  const query = mongoose.Types.ObjectId.isValid(roomId)
    ? [{ _id: roomId }, { code: roomId.toUpperCase() }]
    : [{ code: roomId.toUpperCase() }];

  const room = await Room.findOne({
    $or: query,
  });

  if (!room) {
    throw new Error("Room not found");
  }

  const existing =
    await Game.findOne({
      roomId: room._id.toString(),
      status: {
        $in: [
          "waiting",
          "playing",
        ],
      },
    });

  if (existing) {
    return existing;
  }

  const game =
    await Game.create({
      roomId:
        room._id.toString(),

      status: "waiting",

      initialFen:
        new Chess().fen(),

      currentFen:
        new Chess().fen(),

      whiteTimeMs:
        room.timeControl.minutes *
        60 *
        1000,

      blackTimeMs:
        room.timeControl.minutes *
        60 *
        1000,

      incrementMs:
        room.timeControl.increment *
        1000,

      lastClockUpdateAt:
        new Date(),
    });

  logger.info("game_created", {
    gameId: game._id.toString(),
    roomId: room._id.toString(),
    rated: room.rated,
  });

  return game;
}

export async function assignPlayerToGame(
  gameId: string,
  userId: string,
) {
  const game =
    await Game.findById(gameId);

  if (!game) {
    throw new Error("Game not found");
  }

  const user =
    await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const id =
    user._id.toString();

  if (
    game.whitePlayerId === id ||
    game.blackPlayerId === id
  ) {
    return game;
  }

  if (!game.whitePlayerId) {
    game.whitePlayerId = id;
    game.whitePlayerName =
      user.username;
    game.whiteRating =
      user.rating;
  } else if (!game.blackPlayerId) {
    game.blackPlayerId = id;
    game.blackPlayerName =
      user.username;
    game.blackRating =
      user.rating;
  } else {
    throw new Error(
      "Game already has two players",
    );
  }

  if (
    game.whitePlayerId &&
    game.blackPlayerId
  ) {
    game.status = "playing";
    game.activeColor = "white";
    game.startedAt =
      new Date();
  }

  await game.save();

  return game;
}
