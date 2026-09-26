export type GameStatusType =
  | "live"
  | "waiting"
  | "completed"
  | "draw"
  | "checkmate"
  | "resigned"
  | "timeout"
  | "stalemate"
  | "abandoned";

export interface GameStatusProps {
  status: GameStatusType;
  winnerColor?: "white" | "black";
  className?: string;
}
