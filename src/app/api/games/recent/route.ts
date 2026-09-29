import { NextRequest, NextResponse } from "next/server";
import { getUserRecentGames } from "@/lib/server-store";

export async function GET(request: NextRequest) {
  const games = [
    {
      _id: "recent-1",
      whitePlayerName: "MagnusCarlsen",
      blackPlayerName: "AlirezaFirouzja",
      whiteRating: 2882,
      blackRating: 2805,
      result: "1-0",
      timeControl: "3+0 Blitz",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      fen: "8/5pk1/4p1p1/8/3b1P2/3r2P1/1P2R1K1/2B5 b - - 0 44",
    },
    {
      _id: "recent-2",
      whitePlayerName: "HikaruNakamura",
      blackPlayerName: "Dharmapada",
      whiteRating: 2875,
      blackRating: 1428,
      result: "1-0",
      timeControl: "5+0 Blitz",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      fen: "r1bq1rk1/pp2ppbp/2np1np1/8/2PNP3/2N1BP2/PP4PP/R2QKB1R w KQ - 3 9",
    },
    {
      _id: "recent-3",
      whitePlayerName: "Elena_K",
      blackPlayerName: "Marcus_T",
      whiteRating: 1740,
      blackRating: 1725,
      result: "0-1",
      timeControl: "10+0 Rapid",
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      fen: "r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
    },
  ];

  return NextResponse.json({
    success: true,
    games,
  });
}
