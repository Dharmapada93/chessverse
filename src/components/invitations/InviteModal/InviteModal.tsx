"use client";

import React, { useState } from "react";
import { Swords, X, Link as LinkIcon, Check, Copy, Loader2, Sparkles } from "lucide-react";
import { invitationService } from "@/services/social";
import type { InviteModalProps } from "./types";

const TIME_PRESETS = [
  { id: "bullet_1_0", label: "1 + 0", name: "Bullet", timeMs: 60000, inc: 0, min: 1 },
  { id: "blitz_3_0", label: "3 + 0", name: "Blitz", timeMs: 180000, inc: 0, min: 3 },
  { id: "blitz_5_0", label: "5 + 0", name: "Blitz", timeMs: 300000, inc: 0, min: 5 },
  { id: "rapid_10_0", label: "10 + 0", name: "Rapid", timeMs: 600000, inc: 0, min: 10 },
  { id: "rapid_15_10", label: "15 + 10", name: "Rapid", timeMs: 900000, inc: 10, min: 15 },
  { id: "custom", label: "Custom", name: "Custom Time", timeMs: 0, inc: 0, min: 0 },
];

export function InviteModal({
  isOpen,
  onClose,
  friend,
  onChallengeSent,
}: InviteModalProps) {
  const [selectedPreset, setSelectedPreset] = useState("rapid_10_0");
  const [customMinutes, setCustomMinutes] = useState(10);
  const [customIncrement, setCustomIncrement] = useState(0);
  const [colorPref, setColorPref] = useState<"random" | "white" | "black">("random");
  const [rated, setRated] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Link generation tab state
  const [mode, setMode] = useState<"direct" | "link">("direct");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  async function handleSendChallenge(e: React.FormEvent) {
    e.preventDefault();
    if (!friend && mode === "direct") return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const preset = TIME_PRESETS.find((p) => p.id === selectedPreset);
    let timeControl = {
      initialTime: preset?.timeMs || customMinutes * 60000,
      increment: preset?.id === "custom" ? customIncrement : preset?.inc || 0,
      minutes: preset?.id === "custom" ? customMinutes : preset?.min || 10,
    };

    if (mode === "direct" && friend) {
      const res = await invitationService.sendChallenge({
        username: friend.username,
        timeControl,
        colorPreference: colorPref,
        rated,
      });

      setIsSubmitting(false);
      if (res.success) {
        onChallengeSent?.();
        onClose();
      } else {
        setErrorMsg(res.message || "Failed to send challenge.");
      }
    } else {
      // Create shareable invite link
      const res = await invitationService.createInviteLink({
        timeControl: {
          initialTime: timeControl.initialTime,
          increment: timeControl.increment,
        },
        colorPreference: colorPref,
        rated,
      });

      setIsSubmitting(false);
      if (res.success && res.inviteUrl) {
        const fullUrl = `${window.location.origin}${res.inviteUrl}`;
        setGeneratedLink(fullUrl);
      } else {
        setErrorMsg(res.message || "Failed to create invite link.");
      }
    }
  }

  function handleCopy() {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18352B]/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-[20px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[rgba(24,34,30,0.10)] dark:border-white/10 shadow-[0_20px_50px_rgba(24,34,30,0.18)] p-5 sm:p-6 overflow-hidden text-[#18221E] dark:text-[#F4EFE3]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(24,34,30,0.08)] dark:border-white/8">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-[#B58A3A]" />
            <h2 className="text-base font-bold text-[#18221E] dark:text-[#F4EFE3]">
              {mode === "direct" && friend ? `Challenge ${friend.username}` : "Play With Friend"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[10px] text-[#69736C] hover:text-[#18221E] dark:hover:text-[#F4EFE3] hover:bg-[rgba(24,34,30,0.06)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Direct vs Shareable Link */}
        <div className="flex rounded-[12px] bg-[#F7F4EC] dark:bg-[#1B2A24] p-1 mt-4 border border-[rgba(24,34,30,0.08)] dark:border-white/8">
          <button
            type="button"
            onClick={() => setMode("direct")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-[10px] transition-colors cursor-pointer ${
              mode === "direct"
                ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18221E] dark:text-[#F4EFE3] shadow-xs"
                : "text-[#69736C] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
            }`}
          >
            Direct Challenge
          </button>
          <button
            type="button"
            onClick={() => setMode("link")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-[10px] transition-colors cursor-pointer ${
              mode === "link"
                ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18221E] dark:text-[#F4EFE3] shadow-xs"
                : "text-[#69736C] hover:text-[#18221E] dark:hover:text-[#F4EFE3]"
            }`}
          >
            Shareable Link
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSendChallenge} className="mt-4 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-[12px] bg-rose-500/10 border border-rose-500/20 text-[#A94B45] text-xs">
              {errorMsg}
            </div>
          )}

          {/* Time Control Presets */}
          <div>
            <label className="block text-xs font-semibold text-[#69736C] dark:text-[#B5BDB5] mb-2">
              Time Control
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`p-2 rounded-[12px] text-center border transition-all cursor-pointer ${
                    selectedPreset === preset.id
                      ? "border-[#B58A3A] bg-[#B58A3A]/10 text-[#18221E] dark:text-[#F4EFE3] font-bold shadow-xs"
                      : "border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] hover:border-[#B58A3A]/40"
                  }`}
                >
                  <div className="text-xs font-bold text-[#18221E] dark:text-[#F4EFE3]">{preset.label}</div>
                  <div className="text-[10px] text-[#69736C] dark:text-[#B5BDB5]">{preset.name}</div>
                </button>
              ))}
            </div>

            {/* Custom Time Control inputs */}
            {selectedPreset === "custom" && (
              <div className="grid grid-cols-2 gap-3 mt-2.5 p-3 rounded-[12px] bg-[#F7F4EC] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.08)] dark:border-white/8">
                <div>
                  <label className="block text-[11px] text-[#69736C] dark:text-[#B5BDB5] mb-1">
                    Minutes ({customMinutes}m)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-2.5 py-1.5 rounded-[10px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[rgba(24,34,30,0.12)] text-xs text-[#18221E] dark:text-[#F4EFE3]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#69736C] dark:text-[#B5BDB5] mb-1">
                    Increment ({customIncrement}s)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={customIncrement}
                    onChange={(e) => setCustomIncrement(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 rounded-[10px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[rgba(24,34,30,0.12)] text-xs text-[#18221E] dark:text-[#F4EFE3]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Color Preference */}
          <div>
            <label className="block text-xs font-semibold text-[#69736C] dark:text-[#B5BDB5] mb-2">
              Color Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setColorPref("random")}
                className={`py-2 rounded-[12px] text-xs font-medium border transition-all cursor-pointer ${
                  colorPref === "random"
                    ? "border-[#B58A3A] bg-[#B58A3A]/10 text-[#18221E] dark:text-[#F4EFE3] font-semibold shadow-xs"
                    : "border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5]"
                }`}
              >
                Random
              </button>
              <button
                type="button"
                onClick={() => setColorPref("white")}
                className={`py-2 rounded-[12px] text-xs font-medium border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  colorPref === "white"
                    ? "border-[#B58A3A] bg-[#B58A3A]/10 text-[#18221E] dark:text-[#F4EFE3] font-semibold shadow-xs"
                    : "border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5]"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full border border-[rgba(24,34,30,0.3)] bg-white" />
                <span>White</span>
              </button>
              <button
                type="button"
                onClick={() => setColorPref("black")}
                className={`py-2 rounded-[12px] text-xs font-medium border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  colorPref === "black"
                    ? "border-[#B58A3A] bg-[#B58A3A]/10 text-[#18221E] dark:text-[#F4EFE3] font-semibold shadow-xs"
                    : "border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5]"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#18352B]" />
                <span>Black</span>
              </button>
            </div>
          </div>

          {/* Rated Match Toggle */}
          <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F7F4EC] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.08)] dark:border-white/8">
            <div>
              <div className="text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3]">Rated Game</div>
              <div className="text-[11px] text-[#69736C] dark:text-[#B5BDB5]">Affects your rating</div>
            </div>
            <button
              type="button"
              onClick={() => setRated(!rated)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                rated ? "bg-[#27815D]" : "bg-neutral-300 dark:bg-neutral-600"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                  rated ? "translate-x-4" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Generated Link Display (if link mode) */}
          {generatedLink && (
            <div className="p-3 rounded-[12px] bg-[#F7F4EC] dark:bg-[#1B2A24] border border-[#B58A3A]/40 space-y-2">
              <div className="text-xs text-[#B58A3A] font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Share this link with any friend:</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="flex-1 px-2.5 py-1.5 rounded-[10px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[rgba(24,34,30,0.12)] text-xs text-[#18221E] dark:text-[#F4EFE3] truncate font-mono select-all"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-[#18352B] text-[#F7F4EC] text-xs font-semibold hover:bg-[#285443] transition-colors cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-[#B58A3A]" /> : <Copy className="w-3.5 h-3.5 text-[#B58A3A]" />}
                  <span>{isCopied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-[12px] bg-[#18352B] text-[#F7F4EC] font-semibold text-xs uppercase tracking-wider hover:bg-[#285443] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#B58A3A]" />
            ) : mode === "direct" ? (
              <Swords className="w-4 h-4 text-[#B58A3A]" />
            ) : (
              <LinkIcon className="w-4 h-4 text-[#B58A3A]" />
            )}
            <span>
              {isSubmitting
                ? "Creating Challenge..."
                : mode === "direct"
                ? "Send Challenge"
                : "Generate Invite Link"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default InviteModal;
