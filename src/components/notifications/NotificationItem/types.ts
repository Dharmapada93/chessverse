import type { NotificationItem as NotificationItemType } from "@/services/social/types";

export interface NotificationItemProps {
  notification: NotificationItemType;
  onRead?: (id: string) => void;
  onAction?: (type: string, payload: any) => void;
}
