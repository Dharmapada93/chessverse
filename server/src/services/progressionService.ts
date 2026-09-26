import { User } from "../models/User.js";
import { Achievement, DEFAULT_ACHIEVEMENTS } from "../models/Achievement.js";
import { Notification } from "../models/Notification.js";
import { emitToUser } from "../socket/socket.js";

// Step 75.3: Predictable level curve
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.4));
}

export function cumulativeXpForLevel(level: number): number {
  let sum = 0;
  for (let i = 1; i < level; i++) {
    sum += xpForLevel(i);
  }
  return sum;
}

export function calculateLevelFromXp(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelThreshold: number;
  progressPercent: number;
} {
  let level = 1;
  let remainingXp = totalXp;

  while (true) {
    const required = xpForLevel(level);
    if (remainingXp >= required) {
      remainingXp -= required;
      level++;
    } else {
      const progressPercent = Math.min(100, Math.round((remainingXp / required) * 100));
      return {
        level,
        currentLevelXp: remainingXp,
        nextLevelThreshold: required,
        progressPercent,
      };
    }
  }
}

export async function awardXP(
  userId: string,
  amount: number,
  reason: string,
): Promise<{ xp: number; level: number; leveledUp: boolean } | null> {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    if (!user.progression) {
      user.progression = {
        xp: 0,
        level: 1,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date(),
      };
    }

    const previousLevel = user.progression.level || 1;
    user.progression.xp = (user.progression.xp || 0) + amount;

    // Check streak
    const now = new Date();
    const lastActive = user.progression.lastActiveDate
      ? new Date(user.progression.lastActiveDate)
      : null;

    if (lastActive) {
      const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
      if (diffHours >= 20 && diffHours <= 48) {
        user.progression.currentStreak = (user.progression.currentStreak || 1) + 1;
        if (user.progression.currentStreak > (user.progression.longestStreak || 1)) {
          user.progression.longestStreak = user.progression.currentStreak;
        }
      } else if (diffHours > 48) {
        user.progression.currentStreak = 1;
      }
    }
    user.progression.lastActiveDate = now;

    const { level } = calculateLevelFromXp(user.progression.xp);
    const leveledUp = level > previousLevel;
    user.progression.level = level;

    await user.save();

    if (leveledUp) {
      emitToUser(userId, "progression:levelup", {
        level,
        xp: user.progression.xp,
      });
    }

    // Check streak achievement
    if ((user.progression.currentStreak || 0) >= 7) {
      await checkAndUnlockAchievement(userId, "SEVEN_DAY_STREAK");
    }

    return {
      xp: user.progression.xp,
      level: user.progression.level,
      leveledUp,
    };
  } catch (error) {
    console.error("awardXP error:", error);
    return null;
  }
}

export async function checkAndUnlockAchievement(
  userId: string,
  achievementId: string,
): Promise<{ unlocked: boolean; achievement?: any }> {
  try {
    const user = await User.findById(userId);
    if (!user) return { unlocked: false };

    if (!user.achievements) {
      user.achievements = [];
    }

    const alreadyUnlocked = user.achievements.some(
      (a: any) => a.achievementId === achievementId,
    );
    if (alreadyUnlocked) {
      return { unlocked: false };
    }

    const template = DEFAULT_ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!template) return { unlocked: false };

    user.achievements.push({
      achievementId,
      unlockedAt: new Date(),
    });

    if (template.xpReward && user.progression) {
      user.progression.xp = (user.progression.xp || 0) + template.xpReward;
      const { level } = calculateLevelFromXp(user.progression.xp);
      user.progression.level = level;
    }

    await user.save();

    // Create Notification
    try {
      await Notification.create({
        userId: user._id,
        type: "game_finished",
        actorId: user._id,
        read: false,
      });
    } catch {}

    // Emit live achievement unlock to user socket
    emitToUser(userId, "achievement:unlocked", {
      achievement: template,
    });

    return {
      unlocked: true,
      achievement: template,
    };
  } catch (error) {
    console.error("checkAndUnlockAchievement error:", error);
    return { unlocked: false };
  }
}
