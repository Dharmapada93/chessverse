"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import GameRoom from "@/views/GameRoom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { apiFetch } from "@/lib/api";
import { Swords, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";

export default function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const resolvedParams = use(params);
  const gameId = resolvedParams.gameId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function validateGame() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/api/games/${gameId}`);
        if (!isMounted) return;

        if (res.status === 404) {
          setError("Game not found or has expired.");
        } else if (!res.ok) {
          // If server returns error, we still allow socket fallback
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch {
        // Socket connection fallback
        if (isMounted) setLoading(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    validateGame();

    return () => {
      isMounted = false;
    };
  }, [gameId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090909] text-[#f3efe5] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={28} className="animate-spin text-[#d7b875]" />
          <p className="text-sm font-semibold tracking-wider text-white/70">
            CONNECTING TO GAME ROOM...
          </p>
          <span className="text-xs font-mono text-white/30">ID: {gameId}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#090909] text-[#f3efe5] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#12110f] p-8 text-center space-y-5 shadow-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">Game unavailable</h2>
            <p className="mt-1.5 text-xs text-white/50 leading-relaxed">
              This game may have ended or the link may be invalid.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#d7b875] hover:bg-[#c4a45e] py-2.5 px-4 text-xs font-bold text-black transition"
            >
              <ArrowLeft size={14} />
              <span>Back to ChessVerse</span>
            </Link>
            <Link
              href="/play"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] py-2.5 px-4 text-xs font-semibold text-white transition"
            >
              <Swords size={14} />
              <span>Find Match</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      sectionName="GameRoom"
      fallback={({ reset }) => (
        <div className="min-h-screen bg-[#090909] text-[#f3efe5] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#12110f] p-8 text-center space-y-5 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <RefreshCw size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Game connection interrupted</h2>
              <p className="mt-1.5 text-xs text-white/50 leading-relaxed">
                Your authoritative game state is safely preserved on the server.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={reset}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#d7b875] hover:bg-[#c4a45e] py-2.5 px-4 text-xs font-bold text-black transition shadow-lg shadow-[#d7b875]/10"
              >
                <RefreshCw size={14} />
                <span>Retry Game Room</span>
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] py-2.5 px-4 text-xs font-semibold text-white transition"
              >
                <ArrowLeft size={14} />
                <span>Lobby</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    >
      <GameRoom gameId={gameId} />
    </ErrorBoundary>
  );
}
