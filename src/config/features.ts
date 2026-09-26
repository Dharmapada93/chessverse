/**
 * ChessVerse Feature Matrix (R7.5)
 *
 * Every player-facing feature in ChessVerse is completely free.
 * There are no paid tiers, subscriptions, paywalls, or upgrade gates.
 */

export const FEATURES = {
  realtimeGames: true,
  friends: true,
  spectators: true,
  gameAnalysis: true,
  aiCoach: true,
  aiOpponent: true,
  puzzles: true,
  themes: true,
  tournaments: true,
} as const;

export type FeatureKey = keyof typeof FEATURES;

export interface FeatureMetadata {
  title: string;
  description: string;
  category: "play" | "ai" | "social" | "learn" | "customization";
  iconName: string;
}

export const FEATURE_METADATA: Record<FeatureKey, FeatureMetadata> = {
  realtimeGames: {
    title: "Real-time Chess",
    description: "Ultra-low latency WebSocket matchmaking, private friend lobbies, and custom time controls.",
    category: "play",
    iconName: "Zap",
  },
  friends: {
    title: "Friends & Social",
    description: "Direct challenges, friend lists, live presence tracking, and instant game invitations.",
    category: "social",
    iconName: "Users",
  },
  spectators: {
    title: "Live Spectating",
    description: "Watch ongoing games in real time with synchronized board state, clocks, and chat.",
    category: "social",
    iconName: "Eye",
  },
  gameAnalysis: {
    title: "Deep Engine Analysis",
    description: "Stockfish-powered position evaluation, blunder detection, and interactive accuracy graphs.",
    category: "ai",
    iconName: "Cpu",
  },
  aiCoach: {
    title: "AI Chess Coach",
    description: "Natural language move explanations, tactical guidance, and post-game lessons.",
    category: "learn",
    iconName: "MessageSquare",
  },
  aiOpponent: {
    title: "AI Bots & Sparring",
    description: "Adaptive computer opponents from beginner to master level with realistic play styles.",
    category: "play",
    iconName: "Bot",
  },
  puzzles: {
    title: "Tactical Puzzles",
    description: "Daily tactical puzzles, rating-based puzzle training, and instant game blunder replays.",
    category: "learn",
    iconName: "Award",
  },
  themes: {
    title: "Custom Themes & Boards",
    description: "Handcrafted board palettes, piece sets, sounds, and animations without paywalls.",
    category: "customization",
    iconName: "Palette",
  },
  tournaments: {
    title: "Community Tournaments",
    description: "Free bracket-style and Swiss tournaments for players and communities.",
    category: "play",
    iconName: "Trophy",
  },
};

/**
 * Check if a feature is enabled.
 * All player-facing features return true in ChessVerse's free-only architecture.
 */
export function isFeatureAvailable(feature: FeatureKey): boolean {
  return FEATURES[feature] === true;
}
