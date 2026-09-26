"use client";

import React from "react";
import { Volume2, VolumeX, Eye, Hash, Sparkles, Palette, X } from "lucide-react";
import { PieceSetStyle } from "@/components/game/ChessBoard/PieceSets";

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  coordinates: boolean;
  onToggleCoordinates: (enabled: boolean) => void;
  showLegalMoves: boolean;
  onToggleLegalMoves: (enabled: boolean) => void;
  animations: boolean;
  onToggleAnimations: (enabled: boolean) => void;
  pieceSet: PieceSetStyle;
  onSelectPieceSet: (style: PieceSetStyle) => void;
}

export default function GameSettingsModal({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  coordinates,
  onToggleCoordinates,
  showLegalMoves,
  onToggleLegalMoves,
  animations,
  onToggleAnimations,
  pieceSet,
  onSelectPieceSet,
}: GameSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18352B]/40 dark:bg-[#0E1713]/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-sm rounded-[20px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-6 shadow-[0_24px_64px_rgba(24,34,30,0.14)] space-y-5 text-[#18221E] dark:text-[#F4EFE3]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-white/10 pb-3">
          <h3 id="game-settings-title" className="text-sm font-serif font-bold uppercase tracking-wider text-[#18352B] dark:text-[#F4EFE3]">
            Game Settings
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1 rounded-lg text-[#69736C] hover:bg-[rgba(24,34,30,0.06)] hover:text-[#18352B] dark:hover:text-[#F4EFE3] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Volume2 size={16} className="text-[#B58A3A]" />
              <span className="text-xs font-medium text-[#18221E] dark:text-[#F4EFE3]">Sound Effects</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              onClick={() => onToggleSound(!soundEnabled)}
              className={[
                "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
                soundEnabled ? "bg-[#B58A3A]" : "bg-[rgba(24,34,30,0.15)] dark:bg-white/20",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-1 left-1 bg-white rounded-full h-4 w-4 transition-transform shadow-xs",
                  soundEnabled ? "translate-x-5" : "translate-x-0",
                ].join(" ")}
              />
            </button>
          </div>

          {/* Board Coordinates Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Hash size={16} className="text-[#B58A3A]" />
              <span className="text-xs font-medium text-[#18221E] dark:text-[#F4EFE3]">Board Coordinates</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={coordinates}
              onClick={() => onToggleCoordinates(!coordinates)}
              className={[
                "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
                coordinates ? "bg-[#B58A3A]" : "bg-[rgba(24,34,30,0.15)] dark:bg-white/20",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-1 left-1 bg-white rounded-full h-4 w-4 transition-transform shadow-xs",
                  coordinates ? "translate-x-5" : "translate-x-0",
                ].join(" ")}
              />
            </button>
          </div>

          {/* Show Legal Moves Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Eye size={16} className="text-[#B58A3A]" />
              <span className="text-xs font-medium text-[#18221E] dark:text-[#F4EFE3]">Show Legal Moves</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showLegalMoves}
              onClick={() => onToggleLegalMoves(!showLegalMoves)}
              className={[
                "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
                showLegalMoves ? "bg-[#B58A3A]" : "bg-[rgba(24,34,30,0.15)] dark:bg-white/20",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-1 left-1 bg-white rounded-full h-4 w-4 transition-transform shadow-xs",
                  showLegalMoves ? "translate-x-5" : "translate-x-0",
                ].join(" ")}
              />
            </button>
          </div>

          {/* Animations Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-[#B58A3A]" />
              <span className="text-xs font-medium text-[#18221E] dark:text-[#F4EFE3]">Smooth Animations</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={animations}
              onClick={() => onToggleAnimations(!animations)}
              className={[
                "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
                animations ? "bg-[#B58A3A]" : "bg-[rgba(24,34,30,0.15)] dark:bg-white/20",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-1 left-1 bg-white rounded-full h-4 w-4 transition-transform shadow-xs",
                  animations ? "translate-x-5" : "translate-x-0",
                ].join(" ")}
              />
            </button>
          </div>
        </div>

        {/* Piece Set Selector */}
        <div className="border-t border-[rgba(24,34,30,0.08)] dark:border-white/10 pt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-[#18352B] dark:text-[#F4EFE3]">
            <Palette size={15} className="text-[#B58A3A]" />
            <span>Piece Set Style</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(["classic", "modern", "minimal"] as PieceSetStyle[]).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => onSelectPieceSet(style)}
                className={[
                  "py-2 px-3 rounded-[12px] border text-xs font-semibold capitalize transition cursor-pointer text-center",
                  pieceSet === style
                    ? "bg-[#18352B] text-white dark:bg-[#285443] border-[#18352B] shadow-xs"
                    : "bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#18221E] dark:text-[#F4EFE3] border-[rgba(24,34,30,0.10)] dark:border-white/10 hover:border-[#B58A3A]/40",
                ].join(" ")}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-[12px] bg-[#18352B] dark:bg-[#285443] hover:bg-[#285443] py-2.5 text-xs font-bold text-white transition cursor-pointer shadow-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
}
