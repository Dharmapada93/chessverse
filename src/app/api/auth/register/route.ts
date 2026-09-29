import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/server-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = body.username || "Player";
    const email = body.email || `${username.toLowerCase()}@chessverse.com`;
    const password = body.password || "password";

    const { user, token } = registerUser(username, email, password);

    const response = NextResponse.json({
      success: true,
      token,
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
      },
    });

    response.cookies.set("chessverse-token", token, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Registration failed" },
      { status: 400 }
    );
  }
}
