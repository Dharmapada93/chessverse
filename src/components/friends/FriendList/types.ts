import type { Friend } from "@/services/social/types";

export type FriendFilter = "all" | "online" | "playing" | "offline";
export type FriendSort = "online_first" | "rating" | "alphabetical";

export interface FriendListProps {
  friends: Friend[];
  onPlay?: (friend: Friend) => void;
  onWatch?: (friend: Friend) => void;
  onMessage?: (friend: Friend) => void;
  onRemove?: (friend: Friend) => void;
  onBlock?: (friend: Friend) => void;
  onReport?: (friend: Friend) => void;
  loading?: boolean;
}
