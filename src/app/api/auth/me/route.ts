import { NextRequest, NextResponse } from "next/server";
import { findUserByToken } from "@/lib/server-store";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  let token = authHeader?.replace("Bearer ", "") || null;

  if (!token) {
    const cookieToken = request.cookies.get("chessverse-token")?.value;
    if (cookieToken) token = cookieToken;
  }

  const user = findUserByToken(token);

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      _id: user.id,
      username: user.username,
      email: user.email,
      rating: user.rating,
      ratings: user.ratings,
      role: user.role,
      online: user.online,
      stats: user.stats,
      avatar: user.avatar,
    },
  });
}
