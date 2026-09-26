import type { Friend } from "@/services/social/types";

export interface FriendCardProps {
  friend: Friend;
  onPlay?: (friend: Friend) => void;
  onWatch?: (friend: Friend) => void;
  onMessage?: (friend: Friend) => void;
  onRemove?: (friend: Friend) => void;
  onBlock?: (friend: Friend) => void;
  onReport?: (friend: Friend) => void;
}
