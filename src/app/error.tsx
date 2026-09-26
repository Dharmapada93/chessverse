"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, ArrowLeft, AlertTriangle } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client error without leaking sensitive internals
    console.error("Client runtime error caught:", error.message);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#090909] text-[#f4f1e9] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#12110f]/80 backdrop-blur-xl p-8 sm:p-10 text-center space-y-6 shadow-2xl relative z-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 select-none shadow-inner">
          <AlertTriangle size={28} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Something went wrong.
          </h1>
          <p className="text-sm text-white/55 leading-relaxed">
            Please try again. Your game data is safely preserved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#d7b875] hover:bg-[#c4a45e] px-5 py-2.5 text-xs font-bold text-black transition shadow-lg shadow-[#d7b875]/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCw size={14} />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-5 py-2.5 text-xs font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft size={14} />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
