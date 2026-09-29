import { NextRequest, NextResponse } from "next/server";
import { findUserByUsername, getUserAchievements, getUserRecentGames } from "@/lib/server-store";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;
  const user = findUserByUsername(decodeURIComponent(username));

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  const achievements = getUserAchievements(user.username);
  const recentGames = getUserRecentGames(user.username);

  return NextResponse.json({
    success: true,
    user: {
      ...user,
      achievements,
      recentGames,
    },
  });
}
