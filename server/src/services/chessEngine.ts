import { Chess } from "chess.js";

export type PlayerColor = "w" | "b";

export function createGame(fen?: string) {
  return new Chess(fen);
}

export function validateMove(
  fen: string,
  from: string,
  to: string,
  promotion?: string,
) {
  const chess = new Chess(fen);

  try {
    const move = chess.move({
      from,
      to,
      promotion: promotion || undefined,
    });

    return {
      legal: true,
      move,
      fen: chess.fen(),
      isGameOver: chess.isGameOver(),
      isCheckmate: chess.isCheckmate(),
      isDraw: chess.isDraw(),
      turn: chess.turn() as PlayerColor,
    };
  } catch {
    return {
      legal: false,
    };
  }
}
