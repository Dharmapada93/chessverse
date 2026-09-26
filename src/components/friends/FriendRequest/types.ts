import type { FriendRequestItem } from "@/services/social/types";

export interface FriendRequestProps {
  request: FriendRequestItem;
  type: "incoming" | "outgoing";
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onCancel?: (id: string) => void;
  loading?: boolean;
}
