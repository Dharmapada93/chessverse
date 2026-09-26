export type GameStatus =
  | "waiting"
  | "playing"
  | "finished"
  | "aborted";

export type PlayerColor = "white" | "black";

export interface Player {
  id?: string;
  name: string;
  rating: number;
  avatar?: string;
  title?: string;
  isOnline?: boolean;
}

export interface Move {
  number?: number;
  from: string;
  to: string;
  san: string;
  color?: "white" | "black" | "w" | "b";
  timestamp?: Date | number | string;
  promotion?: string;
}

export interface GameState {
  id: string;
  status: GameStatus;
  white: Player;
  black: Player;
  turn: PlayerColor;
  fen: string;
  moves: Move[];
  clocks: {
    white: number;
    black: number;
    turnStartedAt?: number;
    serverTime?: number;
    initialTime?: number;
    increment?: number;
  };
  spectators: number;
  lastMove?: Move | null;
  result?: string;
  resultReason?: string;
  checkSquare?: string | null;
  isCheck?: boolean;
  isCheckmate?: boolean;
}

export type ConnectionState =
  | "connected"
  | "reconnecting"
  | "synchronizing"
  | "disconnected";
