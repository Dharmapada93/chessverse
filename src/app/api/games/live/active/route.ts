import { NextRequest, NextResponse } from "next/server";
import { LIVE_GAMES_POOL } from "@/lib/server-store";

export async function GET(request: NextRequest) {
  // Update clocks dynamically to simulate live games ticking down
  const now = Date.now();
  const updatedGames = LIVE_GAMES_POOL.map((g) => {
    const elapsed = Math.floor((now - g.startedAt) / 1000);
    const whiteSec = Math.max(12, Math.floor(g.whiteTimeMs / 1000) - Math.floor(elapsed / 2));
    const blackSec = Math.max(15, Math.floor(g.blackTimeMs / 1000) - Math.floor(elapsed / 2));

    return {
      ...g,
      whiteTimeMs: whiteSec * 1000,
      blackTimeMs: blackSec * 1000,
      spectators: g.spectators + (Math.floor(elapsed / 15) % 12),
    };
  });

  return NextResponse.json({
    success: true,
    games: updatedGames,
  });
}
