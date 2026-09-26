"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateRoomButton() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  async function createRoom() {
    setLoading(true);

    try {
      let resolvedUserId = "CURRENT_USER_ID";
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("chessverse-token");
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload?.userId) {
              resolvedUserId = payload.userId;
            }
          } catch {}
        }
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:4000";

      const response = await fetch(
        `${apiUrl}/api/rooms`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            userId: resolvedUserId,
          }),
        },
      );

      const data = await response.json();

      if (data.room?.code) {
        router.push(
          `/room/${data.room.code}`,
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={createRoom}
      disabled={loading}
      className="rounded-xl bg-[#e9e2d0] px-5 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-40 shadow-sm"
    >
      {loading
        ? "Creating..."
        : "Create Private Game"}
    </button>
  );
}
