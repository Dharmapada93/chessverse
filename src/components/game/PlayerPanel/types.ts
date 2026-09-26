import { ReactNode } from "react";

export interface PlayerPanelProps {
  name: string;
  rating: number;
  avatar?: string;
  title?: string;
  color: "white" | "black";
  isCurrentTurn: boolean;
  isUserPlayer?: boolean;
  clockMs: number;
  turnStartedAt?: number;
  serverTime?: number;
  isClockActive: boolean;
  capturedPieces?: string[];
  materialDifference?: number;
  isDisconnected?: boolean;
  disconnectGraceSeconds?: number | null;
  className?: string;
  children?: ReactNode;
}
