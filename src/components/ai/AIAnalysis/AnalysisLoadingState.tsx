"use client";

import React from "react";
import { Check, Circle } from "lucide-react";

interface Step {
  id: "opening" | "tactics" | "positions" | "summary";
  label: string;
}

const STEPS: Step[] = [
  { id: "opening", label: "Reviewing opening" },
  { id: "tactics", label: "Checking tactical moments" },
  { id: "positions", label: "Evaluating critical positions" },
  { id: "summary", label: "Preparing summary" },
];

interface AnalysisLoadingStateProps {
  currentStep?: "opening" | "tactics" | "positions" | "summary" | "completed";
}

export default function AnalysisLoadingState({
  currentStep = "positions",
}: AnalysisLoadingStateProps) {
  const currentIdx = STEPS.findIndex((s) => s.id === currentStep);
  const activeIdx = currentIdx === -1 ? 2 : currentIdx;

  return (
    <div className="rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-8 sm:p-12 text-center max-w-lg mx-auto shadow-[0_10px_35px_rgba(35,40,30,0.06)] backdrop-blur-md">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#B58A3A]/12 text-[#B58A3A] border border-[#B58A3A]/25">
        <span className="text-2xl animate-pulse">♟</span>
      </div>

      <h2 className="mt-5 text-xl font-serif font-bold tracking-tight text-[#18352B] dark:text-[#F4EFE3]">
        Analyzing game...
      </h2>
      <p className="mt-1.5 text-xs text-[#69736C] dark:text-[#B5BDB5]">
        Stockfish 18 calculates precision evaluations while the AI assistant prepares explanations.
      </p>

      {/* Multi-step progress list */}
      <div className="mt-7 space-y-3 text-left max-w-xs mx-auto">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 text-xs transition-colors ${
                isDone
                  ? "text-[#27815D] font-medium"
                  : isCurrent
                  ? "text-[#18352B] dark:text-[#F4EFE3] font-semibold"
                  : "text-[#69736C]/40 dark:text-[#B5BDB5]/40"
              }`}
            >
              {isDone ? (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#27815D]/15 text-[#27815D]">
                  <Check size={12} strokeWidth={2.5} />
                </div>
              ) : isCurrent ? (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#B58A3A]/20 text-[#B58A3A]">
                  <span className="h-2 w-2 rounded-full bg-[#B58A3A] animate-ping" />
                </div>
              ) : (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(24,34,30,0.06)] dark:bg-white/5 text-[#69736C]/40 dark:text-white/20">
                  <Circle size={10} />
                </div>
              )}

              <span>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
