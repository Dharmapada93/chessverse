import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#090909] text-[#f4f1e9] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d7b875]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#12110f]/80 backdrop-blur-xl p-8 sm:p-10 text-center space-y-6 shadow-2xl relative z-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 text-4xl select-none shadow-inner">
          ♟
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            This position doesn&apos;t exist.
          </h1>
          <p className="text-sm text-white/55 leading-relaxed">
            The page you&apos;re looking for couldn&apos;t be found.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d7b875] hover:bg-[#c4a45e] px-6 py-3 text-xs font-bold text-black transition shadow-lg shadow-[#d7b875]/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft size={14} />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
