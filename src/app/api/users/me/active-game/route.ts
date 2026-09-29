import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Returns active game if any, or null
  return NextResponse.json({
    success: true,
    activeGame: null,
  });
}
