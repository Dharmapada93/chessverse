"use client";

import React, { useState } from "react";
import { Bot, Play, X } from "lucide-react";

interface AIOpponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAIGame: (config: {
    difficulty: "beginner" | "intermediate" | "advanced" | "expert";
    playerColor: "white" | "black" | "random";
    timeControl: { initial: number; inc: number };
  }) => void;
}

const BOT_DIFFICULTIES = {
  beginner: {
    id: "beginner" as const,
    name: "Beginner Bot",
    rating: "800",
    description: "Fast moves, frequent tactical oversights. Perfect for beginners.",
  },
  intermediate: {
    id: "intermediate" as const,
    name: "Club Player",
    rating: "1500",
    description: "Solid fundamentals, calculated tactics, disciplined center play.",
  },
  advanced: {
    id: "advanced" as const,
    name: "Master Bot",
    rating: "2100",
    description: "Deep calculation, pawn structure awareness, strong endgames.",
  },
  expert: {
    id: "expert" as const,
    name: "Grandmaster Bot",
    rating: "2800+",
    description: "Stockfish full depth evaluation. Highly challenging tactical accuracy.",
  },
};

const TIME_PRESETS = [
  { label: "1 + 0 Bullet", initial: 60, inc: 0 },
  { label: "3 + 0 Blitz", initial: 180, inc: 0 },
  { label: "5 + 0 Blitz", initial: 300, inc: 0 },
  { label: "10 + 0 Rapid", initial: 600, inc: 0 },
];

export default function AIOpponentModal({
  isOpen,
  onClose,
  onStartAIGame,
}: AIOpponentModalProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<"beginner" | "intermediate" | "advanced" | "expert">("intermediate");
  const [selectedColor, setSelectedColor] = useState<"white" | "black" | "random">("white");
  const [selectedTime, setSelectedTime] = useState(TIME_PRESETS[2]);
  const [isStarting, setIsStarting] = useState(false);

  if (!isOpen) return null;

  function handleConfirm() {
    setIsStarting(true);
    try {
      onStartAIGame({
        difficulty: selectedDifficulty,
        playerColor: selectedColor,
        timeControl: { initial: selectedTime.initial, inc: selectedTime.inc },
      });
      onClose();
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18352B]/40 dark:bg-[#0E1713]/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-[20px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-6 sm:p-8 shadow-[0_24px_64px_rgba(24,34,30,0.14)] text-[#18221E] dark:text-[#F4EFE3] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#B58A3A]/15 text-[#B58A3A]">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold tracking-tight text-[#18352B] dark:text-[#F4EFE3]">
                Play Against AI Opponent
              </h2>
              <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                Calibrated engine difficulty with standard tournament rules
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#69736C] hover:bg-[rgba(24,34,30,0.06)] hover:text-[#18352B] dark:hover:text-[#F4EFE3] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Select Difficulty */}
        <div>
          <label className="text-[11px] uppercase font-mono tracking-wider text-[#69736C] dark:text-[#B5BDB5] mb-2.5 block font-semibold">
            Select Difficulty
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.values(BOT_DIFFICULTIES).map((bot) => {
              const isSelected = selectedDifficulty === bot.id;
              return (
                <button
                  key={bot.id}
                  onClick={() => setSelectedDifficulty(bot.id)}
                  className={`rounded-[14px] border p-3.5 text-left transition cursor-pointer ${
                    isSelected
                      ? "border-[#B58A3A] bg-[#B58A3A]/12 shadow-xs"
                      : "border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] hover:border-[#B58A3A]/40"
                  }`}
                >
                  <p className="text-xs font-bold text-[#18352B] dark:text-[#F4EFE3] capitalize">{bot.name}</p>
                  <p className="text-[10px] text-[#69736C] dark:text-[#B5BDB5] mt-1 leading-snug line-clamp-2">
                    {bot.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Choose Side / Color */}
        <div>
          <label className="text-[11px] uppercase font-mono tracking-wider text-[#69736C] dark:text-[#B5BDB5] mb-2.5 block font-semibold">
            Your Side
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "white", label: "White (First)", icon: "♔" },
              { id: "random", label: "Random", icon: "☯" },
              { id: "black", label: "Black (Second)", icon: "♚" },
            ].map((side) => (
              <button
                key={side.id}
                onClick={() => setSelectedColor(side.id as any)}
                className={`rounded-[12px] border py-2.5 text-center text-xs font-semibold transition cursor-pointer ${
                  selectedColor === side.id
                    ? "border-[#B58A3A] bg-[#B58A3A]/12 text-[#18352B] dark:text-[#F4EFE3]"
                    : "border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] hover:border-[#B58A3A]/40"
                }`}
              >
                <span className="text-base mr-1.5">{side.icon}</span>
                <span>{side.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Time Control */}
        <div>
          <label className="text-[11px] uppercase font-mono tracking-wider text-[#69736C] dark:text-[#B5BDB5] mb-2.5 block font-semibold">
            Time Control
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TIME_PRESETS.map((tc, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTime(tc)}
                className={`rounded-[12px] border py-2 px-3 text-xs text-left transition font-mono cursor-pointer ${
                  selectedTime.initial === tc.initial && selectedTime.inc === tc.inc
                    ? "border-[#B58A3A] bg-[#B58A3A]/12 text-[#18352B] dark:text-[#F4EFE3] font-bold"
                    : "border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] hover:border-[#B58A3A]/40"
                }`}
              >
                {tc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 py-3 text-xs font-semibold text-[#18352B] dark:text-[#F4EFE3] hover:bg-[#F7F4EC] dark:hover:bg-[#1B2A24] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isStarting}
            className="flex-1 rounded-[12px] bg-[#18352B] dark:bg-[#285443] py-3 text-xs font-bold text-white transition hover:bg-[#285443] dark:hover:bg-[#396E5A] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Play size={14} />
            <span>{isStarting ? "Starting Game..." : "Start AI Match"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
