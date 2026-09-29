import { NextRequest, NextResponse } from "next/server";
import { getUserAchievements } from "@/lib/server-store";

export async function GET(request: NextRequest) {
  const achievements = getUserAchievements("Dharmapada");

  return NextResponse.json({
    success: true,
    progression: {
      level: 14,
      xp: 2840,
      nextLevelXp: 3000,
      rating: 1428,
      rank: "Club Master",
    },
    achievements,
  });
}
