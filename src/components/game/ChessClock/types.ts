export type ClockState =
  | "normal"
  | "active"
  | "low-time"
  | "critical"
  | "expired"
  | "paused"
  | "disconnected";

export interface ChessClockProps {
  timeMs: number;
  turnStartedAt?: number;
  serverTime?: number;
  active: boolean;
  paused?: boolean;
  disconnected?: boolean;
  onFlag?: () => void;
  className?: string;
  label?: string;
}
