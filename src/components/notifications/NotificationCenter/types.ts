import type { NotificationItem } from "@/services/social/types";

export type NotificationCategory = "all" | "challenges" | "friends" | "messages" | "system";

export interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkAllRead?: () => void;
  onRead?: (id: string) => void;
  onAction?: (type: string, payload: any) => void;
  loading?: boolean;
}
