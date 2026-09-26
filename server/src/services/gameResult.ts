import { Game } from "../models/Game.js";
import { User } from "../models/User.js";
import { calculateRatingChange } from "../lib/elo.js";
import { getTimeControlCategory } from "./ratingService.js";
import { awardXP, checkAndUnlockAchievement } from "./progressionService.js";
import { logger } from "../utils/logger.js";

export async function finishGame(
  gameId: string,
  result: "white" | "black" | "draw",
  reason: "checkmate" | "timeout" | "resignation" | "draw" | "aborted",
) {
  const game = await Game.findById(gameId);

  if (!game) {
    throw new Error("Game not found");
  }

  if (game.status === "finished") {
    return game;
  }

  game.status = "finished";
  game.result = result;
  game.resultReason = reason;
  game.finishedAt = new Date();
  game.activeColor = undefined;

  // Rating updates only if game is rated and not already processed (Step 72.3 & 72.4)
  const isRated = game.rated !== false;
  const alreadyProcessed = !!game.ratingProcessed;

  if (isRated && !alreadyProcessed && game.whitePlayerId && game.blackPlayerId) {
    const white = await User.findById(game.whitePlayerId);
    const black = await User.findById(game.blackPlayerId);

    if (white && black) {
      let whiteScore = 0.5;
      let blackScore = 0.5;

      if (result === "white") {
        whiteScore = 1;
        blackScore = 0;
      } else if (result === "black") {
        whiteScore = 0;
        blackScore = 1;
      }

      const category = getTimeControlCategory(
        game.whiteTimeMs || 300000,
        game.incrementMs || 0,
      );

      const whiteChange = calculateRatingChange(
        white.rating,
        black.rating,
        whiteScore,
      );

      const blackChange = calculateRatingChange(
        black.rating,
        white.rating,
        blackScore,
      );

      white.rating += whiteChange;
      black.rating += blackChange;

      // Update category ratings (Step 72.7)
      if (!white.ratings) {
        white.ratings = { bullet: 1200, blitz: 1200, rapid: 1200, classical: 1200 };
      }
      if (!black.ratings) {
        black.ratings = { bullet: 1200, blitz: 1200, rapid: 1200, classical: 1200 };
      }

      white.ratings[category] = (white.ratings[category] || 1200) + whiteChange;
      black.ratings[category] = (black.ratings[category] || 1200) + blackChange;

      if (!white.ratingHistory) white.ratingHistory = [];
      if (!black.ratingHistory) black.ratingHistory = [];

      white.ratingHistory.push({
        rating: white.rating,
        change: whiteChange,
        gameId: game._id.toString(),
        createdAt: new Date(),
      });

      black.ratingHistory.push({
        rating: black.rating,
        change: blackChange,
        gameId: game._id.toString(),
        createdAt: new Date(),
      });

      await white.save();
      await black.save();

      game.ratingProcessed = true;

      // Step 75.1: Award XP and achievements
      if (result === "white") {
        await awardXP(white._id.toString(), 20, "win");
        await checkAndUnlockAchievement(white._id.toString(), "FIRST_WIN");
        if (reason === "checkmate") {
          await checkAndUnlockAchievement(white._id.toString(), "FIRST_CHECKMATE");
        }
      } else if (result === "black") {
        await awardXP(black._id.toString(), 20, "win");
        await checkAndUnlockAchievement(black._id.toString(), "FIRST_WIN");
        if (reason === "checkmate") {
          await checkAndUnlockAchievement(black._id.toString(), "FIRST_CHECKMATE");
        }
      } else if (result === "draw") {
        await awardXP(white._id.toString(), 10, "draw");
        await awardXP(black._id.toString(), 10, "draw");
      }
    }
  }

  await game.save();

  // Invalidate cached leaderboards on game completion
  try {
    const { cacheInvalidatePrefix } = await import("./redis.js");
    await cacheInvalidatePrefix("leaderboard:");
  } catch {}

  logger.info("game_completed", {
    gameId: game._id.toString(),
    roomId: game.roomId,
    result,
    reason,
    rated: game.rated,
  });

  return game;
}
