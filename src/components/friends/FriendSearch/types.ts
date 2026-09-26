export interface FriendSearchResult {
  _id: string;
  username: string;
  avatar?: string;
  rating: number;
  online: boolean;
  relationship: "none" | "pending_sent" | "pending_received" | "friends" | "blocked";
  friendshipId?: string;
}

export interface FriendSearchProps {
  onAddFriend?: (userId: string) => Promise<boolean>;
  placeholder?: string;
  className?: string;
}
