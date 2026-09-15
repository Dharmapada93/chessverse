import { Game } from "../models/Game.js";

export async function checkGameTimeout(
  gameId: string,
) {
  const game =
    await Game.findById(
      gameId,
    );

  if (
    !game ||
    game.status !== "playing" ||
    !game.activeColor
  ) {
    return null;
  }

  const lastUpdate =
    game.lastClockUpdateAt?.getTime() ??
    game.updatedAt.getTime();

  const elapsed =
    Date.now() -
    lastUpdate;

  let remaining;

  if (
    game.activeColor ===
    "white"
  ) {
    remaining =
      game.whiteTimeMs -
      elapsed;
  } else {
    remaining =
      game.blackTimeMs -
      elapsed;
  }

  if (remaining > 0) {
    return null;
  }

  const result: "white" | "black" =
    game.activeColor ===
    "white"
      ? "black"
      : "white";

  return {
    result,
    reason: "timeout" as const,
  };
}
