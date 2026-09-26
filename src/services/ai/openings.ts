import type { GameOpeningInfo } from "@/types/ai";

export interface OpeningEntry {
  eco: string;
  name: string;
  moves: string[]; // UCI or SAN sequences
}

export const OPENINGS_DATABASE: OpeningEntry[] = [
  // Italian Game & Variations
  { eco: "C50", name: "Italian Game", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"] },
  { eco: "C50", name: "Italian Game: Giuoco Piano", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"] },
  { eco: "C53", name: "Italian Game: Giuoco Pianissimo", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d3"] },
  { eco: "C51", name: "Evans Gambit", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4"] },
  { eco: "C55", name: "Two Knights Defense", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"] },
  { eco: "C57", name: "Fried Liver Attack", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nxd5", "Nxf7"] },

  // Ruy Lopez
  { eco: "C60", name: "Ruy Lopez", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"] },
  { eco: "C65", name: "Ruy Lopez: Berlin Defense", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6"] },
  { eco: "C78", name: "Ruy Lopez: Morphy Defense", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7"] },

  // Sicilian Defense
  { eco: "B20", name: "Sicilian Defense", moves: ["e4", "c5"] },
  { eco: "B21", name: "Sicilian Defense: Smith-Morra Gambit", moves: ["e4", "c5", "d4", "cxd4", "c3"] },
  { eco: "B22", name: "Sicilian Defense: Alapin Variation", moves: ["e4", "c5", "c3"] },
  { eco: "B23", name: "Sicilian Defense: Closed", moves: ["e4", "c5", "Nc3"] },
  { eco: "B90", name: "Sicilian Defense: Najdorf Variation", moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"] },
  { eco: "B70", name: "Sicilian Defense: Dragon Variation", moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"] },

  // French & Caro-Kann
  { eco: "C00", name: "French Defense", moves: ["e4", "e6"] },
  { eco: "C02", name: "French Defense: Advance Variation", moves: ["e4", "e6", "d4", "d5", "e5"] },
  { eco: "B10", name: "Caro-Kann Defense", moves: ["e4", "c6"] },
  { eco: "B12", name: "Caro-Kann Defense: Advance Variation", moves: ["e4", "c6", "d4", "d5", "e5"] },

  // Queen's Gambit & 1.d4
  { eco: "D00", name: "Queen's Pawn Game", moves: ["d4", "d5"] },
  { eco: "D06", name: "Queen's Gambit", moves: ["d4", "d5", "c4"] },
  { eco: "D20", name: "Queen's Gambit Accepted", moves: ["d4", "d5", "c4", "dxc4"] },
  { eco: "D30", name: "Queen's Gambit Declined", moves: ["d4", "d5", "c4", "e6"] },
  { eco: "D10", name: "Slav Defense", moves: ["d4", "d5", "c4", "c6"] },
  { eco: "E60", name: "King's Indian Defense", moves: ["d4", "Nf6", "c4", "g6"] },
  { eco: "E20", name: "Nimzo-Indian Defense", moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"] },
  { eco: "D02", name: "London System", moves: ["d4", "d5", "Bf4"] },

  // Flank Openings
  { eco: "A10", name: "English Opening", moves: ["c4"] },
  { eco: "A04", name: "Réti Opening", moves: ["Nf3"] },
  { eco: "B01", name: "Scandinavian Defense", moves: ["e4", "d5"] },
  { eco: "B07", name: "Pirc Defense", moves: ["e4", "d6", "d4", "Nf6"] },
];

/**
 * Clean move string from check or mate annotations (e.g. "Bxf7+" -> "Bxf7")
 */
function cleanSan(san: string): string {
  return san.replace(/[+#?!]/g, "").trim();
}

/**
 * Confidently identifies the opening from played moves (R5.16).
 * Returns "Unclassified" if no recognized book line is matched. Never hallucinates.
 */
export function identifyOpening(moves: string[]): GameOpeningInfo {
  if (!moves || moves.length === 0) {
    return { name: "Unclassified", eco: "", confidence: 0 };
  }

  const cleanedPlayed = moves.map(cleanSan);
  let bestMatch: OpeningEntry | null = null;
  let maxMatchedMoves = 0;

  for (const opening of OPENINGS_DATABASE) {
    const cleanedBook = opening.moves.map(cleanSan);
    if (cleanedPlayed.length < cleanedBook.length) continue;

    let matches = true;
    for (let i = 0; i < cleanedBook.length; i++) {
      if (cleanedPlayed[i] !== cleanedBook[i]) {
        matches = false;
        break;
      }
    }

    if (matches && cleanedBook.length > maxMatchedMoves) {
      maxMatchedMoves = cleanedBook.length;
      bestMatch = opening;
    }
  }

  if (bestMatch && maxMatchedMoves >= 1) {
    const confidence = Math.min(100, Math.round((maxMatchedMoves / bestMatch.moves.length) * 100));
    return {
      name: bestMatch.name,
      eco: bestMatch.eco,
      confidence,
    };
  }

  return {
    name: "Unclassified",
    confidence: 0,
  };
}
