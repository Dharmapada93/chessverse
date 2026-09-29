import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const friends = [
    {
      _id: "f-1",
      username: "MagnusCarlsen",
      rating: 2882,
      online: true,
      status: "online",
      avatar: null,
    },
    {
      _id: "f-2",
      username: "HikaruNakamura",
      rating: 2875,
      online: true,
      status: "in-game",
      avatar: null,
    },
    {
      _id: "f-3",
      username: "Elena_K",
      rating: 1740,
      online: true,
      status: "online",
      avatar: null,
    },
  ];

  return NextResponse.json({
    success: true,
    friends,
  });
}
