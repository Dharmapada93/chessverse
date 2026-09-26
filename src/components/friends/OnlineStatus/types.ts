import type { OnlinePresenceState } from "@/services/social/types";

export interface OnlineStatusProps {
  presence: OnlinePresenceState;
  opponentName?: string;
  lastSeen?: string | Date;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}
