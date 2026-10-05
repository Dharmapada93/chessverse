import { NextRequest, NextResponse } from "next/server";
import { LIVE_GAMES_POOL } from "@/lib/server-store";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await context.params;

  // Check if it's one of the live games
  const foundLive = LIVE_GAMES_POOL.find((g) => g.id === gameId || g.roomId === gameId);
  if (foundLive) {
    return NextResponse.json({
      success: true,
      game: {
        id: foundLive.id,
        roomId: foundLive.roomId,
        whitePlayer: { id: "p1", name: foundLive.whitePlayerName, rating: foundLive.whiteRating },
        blackPlayer: { id: "p2", name: foundLive.blackPlayerName, rating: foundLive.blackRating },
        fen: foundLive.currentFen,
        moves: foundLive.moves,
        status: "playing",
        timeControl: foundLive.timeControl,
        clocks: {
          whiteRemaining: foundLive.whiteTimeMs,
          blackRemaining: foundLive.blackTimeMs,
        },
        spectators: foundLive.spectators,
      },
    });
  }

  // Otherwise, return standard active duel match structure
  return NextResponse.json({
    success: true,
    game: {
      id: gameId,
      roomId: gameId,
      whitePlayer: { id: "p1", name: "White Player", rating: 1500 },
      blackPlayer: { id: "bot-grandmaster", name: "Grandmaster AI", rating: 1500 },
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      moves: [],
      status: "playing",
      timeControl: "5+0 Blitz",
      clocks: {
        whiteRemaining: 300000,
        blackRemaining: 300000,
      },
      spectators: 1,
    },
  });
}
