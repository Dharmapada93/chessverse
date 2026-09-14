import { Game } from "../models/Game.js";
import { User } from "../models/User.js";
import { calculateRatingChange } from "../lib/elo.js";

export async function finishGame(
  gameId: string,
  result:
    | "white"
    | "black"
    | "draw",
  reason:
    | "checkmate"
    | "timeout"
    | "resignation"
    | "draw"
    | "aborted",
) {
  const game =
    await Game.findById(gameId);

  if (!game) {
    throw new Error(
      "Game not found",
    );
  }

  if (
    game.status === "finished"
  ) {
    return game;
  }

  if (
    !game.whitePlayerId ||
    !game.blackPlayerId
  ) {
    throw new Error(
      "Both players are required",
    );
  }

  const white =
    await User.findById(
      game.whitePlayerId,
    );

  const black =
    await User.findById(
      game.blackPlayerId,
    );

  if (!white || !black) {
    throw new Error(
      "Both players are required",
    );
  }

  let whiteScore = 0.5;
  let blackScore = 0.5;

  if (result === "white") {
    whiteScore = 1;
    blackScore = 0;
  }

  if (result === "black") {
    whiteScore = 0;
    blackScore = 1;
  }

  const whiteChange =
    calculateRatingChange(
      white.rating,
      black.rating,
      whiteScore,
    );

  const blackChange =
    calculateRatingChange(
      black.rating,
      white.rating,
      blackScore,
    );

  white.rating +=
    whiteChange;

  black.rating +=
    blackChange;

  if (!white.ratingHistory) {
    white.ratingHistory = [];
  }
  if (!black.ratingHistory) {
    black.ratingHistory = [];
  }

  white.ratingHistory.push({
    rating: white.rating,
    change: whiteChange,
    gameId:
      game._id.toString(),
    createdAt: new Date(),
  });

  black.ratingHistory.push({
    rating: black.rating,
    change: blackChange,
    gameId:
      game._id.toString(),
    createdAt: new Date(),
  });

  await white.save();
  await black.save();

  game.status =
    "finished";

  game.result =
    result;

  game.resultReason =
    reason;

  game.finishedAt =
    new Date();

  game.activeColor =
    undefined;

  await game.save();

  return game;
}
