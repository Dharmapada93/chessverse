"use client";

import React from "react";
import { AlertCircle, RotateCcw, ShieldCheck } from "lucide-react";

interface AnalysisErrorStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
  message?: string;
}

export default function AnalysisErrorState({
  onRetry,
  isRetrying = false,
  message,
}: AnalysisErrorStateProps) {
  return (
    <div className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-8 sm:p-12 text-center max-w-lg mx-auto shadow-[0_10px_35px_rgba(35,40,30,0.06)] backdrop-blur-md">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#A94B45]/10 text-[#A94B45] border border-[#A94B45]/20">
        <AlertCircle size={24} />
      </div>

      <h2 className="mt-5 text-xl font-serif font-bold tracking-tight text-[#18352B] dark:text-[#F4EFE3]">
        Analysis unavailable
      </h2>

      <p className="mt-2 text-xs sm:text-sm text-[#69736C] dark:text-[#B5BDB5]">
        We couldn&apos;t complete the analysis right now.
      </p>

      {/* Safe game assurance */}
      <div className="mt-4 inline-flex items-center gap-2 rounded-[12px] bg-[#27815D]/10 border border-[#27815D]/20 px-3.5 py-1.5 text-xs font-medium text-[#27815D]">
        <ShieldCheck size={14} />
        <span>Your game is safe.</span>
      </div>

      {message && (
        <p className="mt-3 text-xs text-[#69736C]/70 dark:text-[#B5BDB5]/70 font-mono">
          {message}
        </p>
      )}

      <div className="mt-7">
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 rounded-[12px] bg-[#18352B] dark:bg-[#285443] px-6 py-2.5 text-xs font-semibold text-[#FBF9F3] transition hover:bg-[#285443] dark:hover:bg-[#396E5A] disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <RotateCcw size={14} className={isRetrying ? "animate-spin" : ""} />
          <span>{isRetrying ? "Retrying..." : "Try Again"}</span>
        </button>
      </div>
    </div>
  );
}
