export type ConnectionStateType =
  | "connected"
  | "reconnecting"
  | "synchronizing"
  | "disconnected";

export interface ConnectionStatusProps {
  status: ConnectionStateType;
  onRetry?: () => void;
  className?: string;
}
