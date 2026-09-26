import type { ProfileData } from "@/services/social/types";

export interface PlayerProfileProps {
  profile: ProfileData;
  onPlay?: () => void;
  onMessage?: () => void;
  onWatch?: () => void;
  onAddFriend?: () => void;
  onBlock?: () => void;
  onReport?: () => void;
  loading?: boolean;
}
