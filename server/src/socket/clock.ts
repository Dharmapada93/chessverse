import { Game } from "../models/Game.js";

export type ClockColor =
  | "white"
  | "black";

export async function startGameClock(
  gameId: string,
) {
  const game =
    await Game.findById(gameId);

  if (!game) {
    throw new Error(
      "Game not found",
    );
  }

  game.activeColor = "white";
  game.startedAt =
    game.startedAt ?? new Date();
  game.status = "playing";

  await game.save();

  return game;
}

export async function updateClockAfterMove(
  gameId: string,
  nextColor: ClockColor,
) {
  const game =
    await Game.findById(gameId);

  if (!game) {
    throw new Error(
      "Game not found",
    );
  }

  if (
    game.status !== "playing"
  ) {
    return game;
  }

  const now = Date.now();

  const lastMoveAt =
    game.updatedAt.getTime();

  const elapsed =
    Math.max(
      0,
      now - lastMoveAt,
    );

  if (
    game.activeColor === "white"
  ) {
    game.whiteTimeMs =
      Math.max(
        0,
        game.whiteTimeMs -
          elapsed,
      );

    game.whiteTimeMs +=
      game.incrementMs;
  }

  if (
    game.activeColor === "black"
  ) {
    game.blackTimeMs =
      Math.max(
        0,
        game.blackTimeMs -
          elapsed,
      );

    game.blackTimeMs +=
      game.incrementMs;
  }

  game.activeColor =
    nextColor;

  await game.save();

  return game;
}

export async function getCurrentClock(
  gameId: string,
) {
  const game =
    await Game.findById(gameId);

  if (!game) {
    return null;
  }

  let whiteTime =
    game.whiteTimeMs;

  let blackTime =
    game.blackTimeMs;

  if (
    game.status === "playing" &&
    game.activeColor
  ) {
    const elapsed =
      Date.now() -
      game.updatedAt.getTime();

    if (
      game.activeColor ===
      "white"
    ) {
      whiteTime =
        Math.max(
          0,
          whiteTime - elapsed,
        );
    }

    if (
      game.activeColor ===
      "black"
    ) {
      blackTime =
        Math.max(
          0,
          blackTime - elapsed,
        );
    }
  }

  return {
    white: whiteTime,
    black: blackTime,
    activeColor:
      game.activeColor,
  };
}
