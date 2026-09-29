import { NextRequest, NextResponse } from "next/server";
import { getUserRecentGames } from "@/lib/server-store";

export async function GET(request: NextRequest) {
  const games = getUserRecentGames("Dharmapada");
  return NextResponse.json({
    success: true,
    games,
  });
}
