import { z } from "zod";

export const createGameSchema = z.object({
  category: z.enum(["bullet", "blitz", "rapid", "classical"]).default("rapid"),
  timeControl: z.string().optional(),
  initialTime: z.number().int().positive().max(7200).default(600), // max 2 hours in seconds
  increment: z.number().int().min(0).max(60).default(0), // max 60s increment
  rated: z.boolean().default(true),
  opponentId: z.string().optional(),
});

export const moveProposalSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  from: z.string().regex(/^[a-h][1-8]$/, "Invalid source square"),
  to: z.string().regex(/^[a-h][1-8]$/, "Invalid target square"),
  promotion: z.enum(["q", "r", "b", "n"]).optional(),
});

export const reportSchema = z.object({
  reportedUserId: z.string().min(1, "Target user ID is required"),
  gameId: z.string().optional(),
  reason: z.enum(["cheating", "harassment", "stalling", "inappropriate_content", "other"]),
  notes: z.string().max(1000).optional(),
});

export const friendRequestSchema = z.object({
  targetUserId: z.string().min(1, "Target user ID is required"),
});

export const chatMessageSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  message: z.string().min(1).max(500, "Message cannot exceed 500 characters"),
});

export const passwordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});
