import { NextRequest, NextResponse } from "next/server";
import { getDemoToken } from "@/lib/server-store";

export async function POST(request: NextRequest) {
  try {
    let username = "Dharmapada";
    try {
      const body = await request.json();
      if (body?.username) username = body.username;
    } catch {}

    const { user, token } = getDemoToken(username);

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
      { success: false, message: err?.message || "Demo auth failed" },
      { status: 500 }
    );
  }
}
