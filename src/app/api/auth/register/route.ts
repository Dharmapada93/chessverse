import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/server-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username : "";
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Username, email, and password are required" },
        { status: 400 },
      );
    }

    const result = await registerUser(username, email, password);
    if (!result) {
      return NextResponse.json(
        { success: false, message: "Username or email already exists" },
        { status: 409 },
      );
    }

    const { user, token } = result;

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
