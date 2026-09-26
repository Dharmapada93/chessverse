import { Move } from "@/components/game/MoveHistory";

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  P: 1,
  N: 3,
  B: 3,
  R: 5,
  Q: 9,
};

const SYMBOLS: Record<string, string> = {
  P: "♙",
  N: "♘",
  B: "♗",
  R: "♖",
  Q: "♕",
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
};

const INITIAL_PIECE_COUNTS: Record<string, number> = {
  P: 8,
  N: 2,
  B: 2,
  R: 2,
  Q: 1,
  p: 8,
  n: 2,
  b: 2,
  r: 2,
  q: 1,
};

export type CapturedState = {
  whiteCaptured: string[]; // Black pieces captured by White (♟, ♞, etc.)
  blackCaptured: string[]; // White pieces captured by Black (♙, ♘, etc.)
  whiteAdvantage: number;
  blackAdvantage: number;
};

export function getCapturedPiecesAndAdvantage(fen: string): CapturedState {
  const boardPart = fen.split(" ")[0] || "";
  const currentCounts: Record<string, number> = {
    P: 0,
    N: 0,
    B: 0,
    R: 0,
    Q: 0,
    p: 0,
    n: 0,
    b: 0,
    r: 0,
    q: 0,
  };

  let whiteMaterial = 0;
  let blackMaterial = 0;

  for (const char of boardPart) {
    if (char in currentCounts) {
      currentCounts[char]++;
      if (char === char.toUpperCase()) {
        whiteMaterial += PIECE_VALUES[char] || 0;
      } else {
        blackMaterial += PIECE_VALUES[char] || 0;
      }
    }
  }

  // Black pieces captured by White (p, n, b, r, q that are missing)
  const whiteCaptured: string[] = [];
  for (const piece of ["p", "n", "b", "r", "q"] as const) {
    const missing = Math.max(0, INITIAL_PIECE_COUNTS[piece] - currentCounts[piece]);
    for (let i = 0; i < missing; i++) {
      whiteCaptured.push(SYMBOLS[piece]);
    }
  }

  // White pieces captured by Black (P, N, B, R, Q that are missing)
  const blackCaptured: string[] = [];
  for (const piece of ["P", "N", "B", "R", "Q"] as const) {
    const missing = Math.max(0, INITIAL_PIECE_COUNTS[piece] - currentCounts[piece]);
    for (let i = 0; i < missing; i++) {
      blackCaptured.push(SYMBOLS[piece]);
    }
  }

  const whiteAdvantage = Math.max(0, whiteMaterial - blackMaterial);
  const blackAdvantage = Math.max(0, blackMaterial - whiteMaterial);

  return {
    whiteCaptured,
    blackCaptured,
    whiteAdvantage,
    blackAdvantage,
  };
}

export function formatMovesList(
  moves: Array<{ san?: string; from?: string; to?: string } | string>,
): Move[] {
  const result: Move[] = [];

  for (let i = 0; i < moves.length; i += 2) {
    const whiteItem = moves[i];
    const blackItem = moves[i + 1];

    const whiteSan =
      typeof whiteItem === "string"
        ? whiteItem
        : whiteItem?.san || (whiteItem ? `${whiteItem.from}-${whiteItem.to}` : undefined);

    const blackSan =
      typeof blackItem === "string"
        ? blackItem
        : blackItem?.san || (blackItem ? `${blackItem.from}-${blackItem.to}` : undefined);

    result.push({
      number: Math.floor(i / 2) + 1,
      white: whiteSan,
      black: blackSan,
    });
  }

  return result;
}
