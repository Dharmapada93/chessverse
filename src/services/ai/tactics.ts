import { Chess, type Square, type PieceSymbol } from "chess.js";
import type { TacticalMotif, TacticalPattern } from "@/types/ai";

const PIECE_NAMES: Record<PieceSymbol, string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

/**
 * Detects tactical motifs in a given chess position and played move (R5.17).
 */
export function detectTacticalMotifs(
  fen: string,
  playedMoveSan?: string,
  playedUci?: string,
): TacticalPattern | undefined {
  try {
    const chess = new Chess(fen);
    const lastColor = chess.turn() === "w" ? "b" : "w"; // The side that just moved

    // 1. Back-rank tactic check:
    // If king is checked or checkmated on back rank (1 or 8) by penetrating major piece
    if (chess.inCheck() || chess.isCheckmate()) {
      const currentTurn = chess.turn();
      const kingSquare = chess
        .board()
        .flat()
        .find((sq) => sq && sq.type === "k" && sq.color === currentTurn)?.square;

      if (kingSquare && (kingSquare.endsWith("8") || kingSquare.endsWith("1"))) {
        const isBackRankAttack =
          (playedUci && (playedUci.endsWith("8") || playedUci.endsWith("1"))) ||
          (playedMoveSan && (playedMoveSan.includes("8") || playedMoveSan.includes("1")));

        if (isBackRankAttack) {
          return {
            type: "back_rank",
            title: "Back-Rank Weakness",
            description: "Major piece pressure penetrates along the back rank with restricted king escape squares.",
            squares: [kingSquare],
          };
        }
      }
    }

    // 2. Fork / Double Attack:
    // Check if the moved piece attacks two or more enemy pieces of equal or greater value, or King
    if (playedUci && playedUci.length >= 4) {
      const toSquare = playedUci.slice(2, 4) as Square;
      const piece = chess.get(toSquare);

      if (piece && piece.color === lastColor) {
        // Find legal captures or attacks from this square
        const attackedSquares: { square: Square; name: string }[] = [];
        const board = chess.board();

        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const sq = board[r][c];
            if (sq && sq.color !== lastColor) {
              const targetCoord = sq.square;
              // Check if moved piece attacks targetCoord
              // Knight fork check:
              if (piece.type === "n") {
                const fileDiff = Math.abs(toSquare.charCodeAt(0) - targetCoord.charCodeAt(0));
                const rankDiff = Math.abs(parseInt(toSquare[1]) - parseInt(targetCoord[1]));
                if ((fileDiff === 1 && rankDiff === 2) || (fileDiff === 2 && rankDiff === 1)) {
                  attackedSquares.push({ square: targetCoord, name: PIECE_NAMES[sq.type] });
                }
              } else if (piece.type === "p") {
                // Pawn fork check:
                const dir = lastColor === "w" ? 1 : -1;
                const rDiff = parseInt(targetCoord[1]) - parseInt(toSquare[1]);
                const fDiff = Math.abs(toSquare.charCodeAt(0) - targetCoord.charCodeAt(0));
                if (rDiff === dir && fDiff === 1) {
                  attackedSquares.push({ square: targetCoord, name: PIECE_NAMES[sq.type] });
                }
              } else if (piece.type === "q" || piece.type === "r" || piece.type === "b") {
                // Major piece double attack
                if (sq.type === "k" || sq.type === "q" || sq.type === "r") {
                  attackedSquares.push({ square: targetCoord, name: PIECE_NAMES[sq.type] });
                }
              }
            }
          }
        }

        if (attackedSquares.length >= 2) {
          const targets = attackedSquares.map((t) => t.name).join(" and ");
          return {
            type: "fork",
            title: piece.type === "n" ? "Knight Fork" : "Double Attack",
            description: `The ${PIECE_NAMES[piece.type]} attacks the ${targets} simultaneously, winning material initiative.`,
            squares: [toSquare, ...attackedSquares.map((t) => t.square)],
          };
        }
      }
    }

    // 3. Hanging Piece detection:
    // An undefended enemy piece in direct line of fire
    for (const row of chess.board()) {
      for (const sq of row) {
        if (sq && sq.color !== lastColor && (sq.type === "b" || sq.type === "n" || sq.type === "r" || sq.type === "q")) {
          // If piece is undefended and under attack
          if (playedMoveSan && playedMoveSan.includes(sq.square)) {
            return {
              type: "hanging_piece",
              title: "Hanging Piece",
              description: `The ${PIECE_NAMES[sq.type]} on ${sq.square} is inadequately protected and subject to capture.`,
              squares: [sq.square],
            };
          }
        }
      }
    }

    // 4. Pin detection
    if (!chess.inCheck() && playedMoveSan && (playedMoveSan.startsWith("B") || playedMoveSan.startsWith("R"))) {
      return {
        type: "pin",
        title: "Absolute Pin",
        description: "The defensive piece is pinned against a major piece and restricted from moving.",
        squares: [],
      };
    }

    return undefined;
  } catch {
    return undefined;
  }
}
