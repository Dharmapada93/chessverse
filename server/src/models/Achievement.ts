import mongoose, { Schema, Document } from "mongoose";

export interface IAchievement extends Document {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "games" | "puzzles" | "streaks" | "mastery";
  xpReward: number;
}

const achievementSchema = new Schema<IAchievement>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["games", "puzzles", "streaks", "mastery"],
      default: "games",
    },
    xpReward: {
      type: Number,
      default: 50,
    },
  },
  {
    timestamps: true,
  },
);

export const Achievement =
  mongoose.models.Achievement ||
  mongoose.model<IAchievement>("Achievement", achievementSchema);

export const DEFAULT_ACHIEVEMENTS = [
  {
    id: "FIRST_WIN",
    title: "First Victory",
    description: "Won your first rated chess game.",
    icon: "♟",
    category: "games",
    xpReward: 50,
  },
  {
    id: "FIRST_CHECKMATE",
    title: "Checkmate",
    description: "Concluded a game decisively by checkmate.",
    icon: "♛",
    category: "games",
    xpReward: 40,
  },
  {
    id: "TEN_WINS",
    title: "Tactical Adept",
    description: "Won 10 rated games against players in ChessVerse.",
    icon: "⚔",
    category: "games",
    xpReward: 100,
  },
  {
    id: "HUNDRED_GAMES",
    title: "Century Club",
    description: "Played 100 matches in the platform.",
    icon: "🛡",
    category: "games",
    xpReward: 250,
  },
  {
    id: "PUZZLE_BEGINNER",
    title: "Sharp Eye",
    description: "Solved your first 10 tactical chess puzzles.",
    icon: "🧩",
    category: "puzzles",
    xpReward: 30,
  },
  {
    id: "PUZZLE_MASTER",
    title: "Puzzle Mind",
    description: "Mastered and solved 100 chess puzzles.",
    icon: "🧠",
    category: "puzzles",
    xpReward: 150,
  },
  {
    id: "SEVEN_DAY_STREAK",
    title: "On Fire",
    description: "Maintained a 7-day daily activity streak.",
    icon: "🔥",
    category: "streaks",
    xpReward: 100,
  },
];
