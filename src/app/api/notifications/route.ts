import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const notifications = [
    {
      _id: "notif-1",
      type: "challenge",
      title: "Friendly Match Request",
      message: "Elena_K invited you to a 5+0 Blitz game.",
      actorUsername: "Elena_K",
      read: false,
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
    {
      _id: "notif-2",
      type: "achievement",
      title: "Badge Unlocked!",
      message: "You completed Tactical Visionary (25 tactics solved).",
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      _id: "notif-3",
      type: "system",
      title: "Welcome to ChessVerse",
      message: "Welcome to ChessVerse! Enjoy zero ads, open tactics, and master analysis.",
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  return NextResponse.json({
    success: true,
    notifications,
  });
}
