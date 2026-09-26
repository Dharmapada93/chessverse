export interface ActivityItem {
  id: string;
  type: "game_win" | "game_draw" | "game_loss" | "streak" | "achievement";
  actorUsername: string;
  actorAvatar?: string;
  opponentUsername?: string;
  description: string;
  timeAgo: string;
  gameId?: string;
}

export interface ActivityFeedProps {
  activities?: ActivityItem[];
  loading?: boolean;
}
