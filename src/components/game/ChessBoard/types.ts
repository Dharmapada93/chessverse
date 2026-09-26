import { PieceSetStyle } from "./PieceSets";

export interface ChessBoardProps {
  fen: string;
  orientation?: "white" | "black";
  selectedSquare?: string | null;
  legalDestinations?: string[];
  lastMove?: { from: string; to: string } | null;
  checkSquare?: string | null;
  isCheckmate?: boolean;
  pieceSet?: PieceSetStyle;
  boardTheme?: string;
  showCoordinates?: boolean;
  showLegalMoves?: boolean;
  interactive?: boolean;
  onSquareClick?: (square: string) => void;
  className?: string;
}
