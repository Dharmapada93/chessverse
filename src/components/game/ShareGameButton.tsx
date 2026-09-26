"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareGameButton({
  gameId,
  roomCode,
}: {
  gameId?: string;
  roomCode?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://chessverse.app";

    const path = gameId
      ? `/games/${gameId}/review`
      : roomCode
        ? `/room/${roomCode}`
        : "";

    const url = `${origin}${path}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "ChessVerse Match",
          text: "Check out this chess match on ChessVerse!",
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={share}
      type="button"
      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
    >
      {copied ? (
        <>
          <Check size={16} className="text-emerald-400" />
          <span>Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={16} />
          <span>Share Game</span>
        </>
      )}
    </button>
  );
}
