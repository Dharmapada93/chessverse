"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { socket } from "@/lib/socket";

type TargetUser = {
  _id?: string;
  id?: string;
  username: string;
  rating?: number;
  avatar?: string;
};

type ChallengeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetUser: TargetUser | null;
  mode?: "modal" | "drawer";
};

const TIME_PRESETS = [
  { label: "1+0", minutes: 1, initialTime: 60000, increment: 0, category: "Bullet" },
  { label: "3+0", minutes: 3, initialTime: 180000, increment: 0, category: "Blitz" },
  { label: "5+0", minutes: 5, initialTime: 300000, increment: 0, category: "Blitz" },
  { label: "10+0", minutes: 10, initialTime: 600000, increment: 0, category: "Rapid" },
];

const INCREMENT_OPTIONS = [0, 1, 2, 5];

export default function ChallengeModal({
  isOpen,
  onClose,
  targetUser,
  mode = "modal",
}: ChallengeModalProps) {
  const [selectedPreset, setSelectedPreset] = useState(TIME_PRESETS[2]); // 5+0 Blitz default
  const [selectedIncrement, setSelectedIncrement] = useState(0);
  const [selectedColor, setSelectedColor] = useState<"random" | "white" | "black">("random");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !targetUser) return null;

  const targetId = targetUser._id || targetUser.id;

  async function handleSendChallenge() {
    if (!targetId) return;
    setIsSending(true);
    setErrorMessage(null);

    const initialTime = selectedPreset.minutes * 60 * 1000;
    const increment = selectedIncrement;

    try {
      if (!socket.connected) {
        const token = localStorage.getItem("chessverse-token");
        if (token) socket.auth = { token };
        socket.connect();
      }

      socket.emit("challenge:send", {
        receiverId: targetId,
        timeControl: {
          initialTime,
          increment,
        },
        colorPreference: selectedColor,
      });

      setSentSuccess(true);
      setTimeout(() => {
        setIsSending(false);
        setSentSuccess(false);
        onClose();
      }, 1500);
    } catch {
      setErrorMessage("Failed to send challenge. Please try again.");
      setIsSending(false);
    }
  }

  const content = (
    <div className="flex h-full flex-col justify-between p-6 text-[#18221E] dark:text-[#F4EFE3]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-white/8 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#18352B] dark:bg-[#1B2A24] text-sm font-semibold text-[#B58A3A] border border-[rgba(24,34,30,0.12)]">
              {targetUser.avatar || targetUser.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3]">
                Challenge {targetUser.username}
              </h2>
              {targetUser.rating && (
                <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">Rating: {targetUser.rating}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-[10px] p-1.5 text-[#69736C] hover:text-[#18221E] dark:hover:text-[#F4EFE3] transition hover:bg-[rgba(24,34,30,0.06)] cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Time Control */}
        <div className="mt-6">
          <label className="text-xs font-semibold uppercase tracking-[0.15em] text-[#69736C] dark:text-[#B5BDB5]">
            Time Control
          </label>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {TIME_PRESETS.map((preset) => {
              const isSelected = selectedPreset.label === preset.label;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setSelectedPreset(preset)}
                  className={`flex flex-col items-center rounded-[12px] border p-3 text-center transition cursor-pointer ${
                    isSelected
                      ? "border-[#B58A3A] bg-[#B58A3A]/10 text-[#18221E] dark:text-[#F4EFE3] font-semibold shadow-xs"
                      : "border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] hover:border-[#B58A3A]/40"
                  }`}
                >
                  <span className="font-mono text-sm font-bold text-[#18221E] dark:text-[#F4EFE3]">{preset.label}</span>
                  <span className="mt-0.5 text-[10px] text-[#69736C] dark:text-[#B5BDB5]">{preset.category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Increment */}
        <div className="mt-6">
          <label className="text-xs font-semibold uppercase tracking-[0.15em] text-[#69736C] dark:text-[#B5BDB5]">
            Increment
          </label>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {INCREMENT_OPTIONS.map((inc) => {
              const isSelected = selectedIncrement === inc;
              return (
                <button
                  key={inc}
                  type="button"
                  onClick={() => setSelectedIncrement(inc)}
                  className={`rounded-[12px] border py-2.5 text-center font-mono text-sm transition cursor-pointer ${
                    isSelected
                      ? "border-[#B58A3A] bg-[#B58A3A]/10 text-[#18221E] dark:text-[#F4EFE3] font-bold shadow-xs"
                      : "border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] hover:border-[#B58A3A]/40"
                  }`}
                >
                  {inc}s
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Choice */}
        <div className="mt-6">
          <label className="text-xs font-semibold uppercase tracking-[0.15em] text-[#69736C] dark:text-[#B5BDB5]">
            Your Color
          </label>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedColor("random")}
              className={`flex items-center justify-center gap-2 rounded-[12px] border py-2.5 text-xs font-medium transition cursor-pointer ${
                selectedColor === "random"
                  ? "border-[#B58A3A] bg-[#B58A3A]/10 text-[#18221E] dark:text-[#F4EFE3] font-semibold shadow-xs"
                  : "border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] hover:border-[#B58A3A]/40"
              }`}
            >
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-white to-[#18221E] border border-[rgba(24,34,30,0.2)]" />
              Random
            </button>

            <button
              type="button"
              onClick={() => setSelectedColor("white")}
              className={`flex items-center justify-center gap-2 rounded-[12px] border py-2.5 text-xs font-medium transition cursor-pointer ${
                selectedColor === "white"
                  ? "border-[#B58A3A] bg-[#B58A3A]/10 text-[#18221E] dark:text-[#F4EFE3] font-semibold shadow-xs"
                  : "border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] hover:border-[#B58A3A]/40"
              }`}
            >
              <div className="h-3 w-3 rounded-full border border-[rgba(24,34,30,0.3)] bg-white" />
              White
            </button>

            <button
              type="button"
              onClick={() => setSelectedColor("black")}
              className={`flex items-center justify-center gap-2 rounded-[12px] border py-2.5 text-xs font-medium transition cursor-pointer ${
                selectedColor === "black"
                  ? "border-[#B58A3A] bg-[#B58A3A]/10 text-[#18221E] dark:text-[#F4EFE3] font-semibold shadow-xs"
                  : "border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] hover:border-[#B58A3A]/40"
              }`}
            >
              <div className="h-3 w-3 rounded-full bg-[#18221E]" />
              Black
            </button>
          </div>
        </div>

        {errorMessage && (
          <p className="mt-4 text-xs text-[#A94B45] font-medium">{errorMessage}</p>
        )}
      </div>

      {/* Action Button */}
      <div className="mt-8 border-t border-[rgba(24,34,30,0.08)] dark:border-white/8 pt-4">
        <button
          type="button"
          onClick={handleSendChallenge}
          disabled={isSending || sentSuccess}
          className={`w-full rounded-[12px] py-3 text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer ${
            sentSuccess
              ? "bg-[#27815D] text-white"
              : "bg-[#18352B] text-[#F7F4EC] hover:bg-[#285443] disabled:opacity-50"
          }`}
        >
          {sentSuccess ? (
            <span className="flex items-center justify-center gap-2">
              <Check size={16} /> Challenge Sent!
            </span>
          ) : isSending ? (
            "Sending..."
          ) : (
            "Send Challenge"
          )}
        </button>
      </div>
    </div>
  );

  if (mode === "drawer") {
    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-[#18352B]/40 backdrop-blur-sm animate-in fade-in duration-150">
        <div
          className="fixed inset-0"
          onClick={onClose}
          aria-hidden="true"
        />
        <div className="relative z-10 h-full w-full max-w-md border-l border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] shadow-[0_20px_50px_rgba(24,34,30,0.2)] transition-transform">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18352B]/40 px-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md rounded-[20px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] shadow-[0_20px_50px_rgba(24,34,30,0.2)] overflow-hidden">
        {content}
      </div>
    </div>
  );
}
