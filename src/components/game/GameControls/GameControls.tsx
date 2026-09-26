"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { Flag, Handshake, RotateCcw, Volume2, VolumeX, Settings } from "lucide-react";
import { GameControlsProps } from "./types";

export default function GameControls({
  onOfferDraw,
  onResign,
  onFlipBoard,
  onToggleSound,
  onOpenSettings,
  soundEnabled = true,
  isGameOver = false,
  isSpectator = false,
  drawOffered = false,
  className = "",
}: GameControlsProps) {
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [showDrawConfirm, setShowDrawConfirm] = useState(false);

  function handleDrawClick() {
    setShowDrawConfirm(true);
  }

  function handleConfirmDraw() {
    setShowDrawConfirm(false);
    onOfferDraw();
  }

  function handleResignClick() {
    setShowResignConfirm(true);
  }

  function handleConfirmResign() {
    setShowResignConfirm(false);
    onResign();
  }

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {/* Primary Gameplay Actions for Players */}
      {!isSpectator && (
        <div className="grid grid-cols-2 gap-2">
          {/* DRAW BUTTON */}
          <Button
            variant="secondary"
            size="md"
            disabled={isGameOver || drawOffered}
            onClick={handleDrawClick}
            className="w-full justify-center gap-2 border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#18352B] dark:text-[#F4EFE3] hover:bg-[#FAF8F2] dark:hover:bg-[#23372F] shadow-xs cursor-pointer rounded-[12px]"
          >
            <Handshake size={16} />
            <span>{drawOffered ? "Draw Offered" : "Offer Draw"}</span>
          </Button>

          {/* RESIGN BUTTON */}
          <Button
            variant="danger"
            size="md"
            disabled={isGameOver}
            onClick={handleResignClick}
            className="w-full justify-center gap-2 shadow-xs cursor-pointer rounded-[12px] bg-[#A94B45] hover:bg-[#913B35] text-white"
          >
            <Flag size={15} />
            <span>Resign</span>
          </Button>
        </div>
      )}

      {/* Secondary Quick Utilities Bar */}
      <div className="flex items-center justify-between gap-2 border-t border-[rgba(24,34,30,0.08)] dark:border-white/10 pt-2">
        <div className="flex items-center gap-1">
          {onFlipBoard && (
            <button
              type="button"
              onClick={onFlipBoard}
              title="Flip Board Orientation"
              aria-label="Flip Board Orientation"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-2.5 py-1.5 text-xs text-[#69736C] dark:text-[#B5BDB5] hover:bg-[#FAF8F2] hover:text-[#18352B] dark:hover:text-[#F4EFE3] transition shadow-xs cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Flip</span>
            </button>
          )}

          {onToggleSound && (
            <button
              type="button"
              onClick={onToggleSound}
              title={soundEnabled ? "Mute Sound" : "Enable Sound"}
              aria-label={soundEnabled ? "Mute Sound" : "Enable Sound"}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-2.5 py-1.5 text-xs text-[#69736C] dark:text-[#B5BDB5] hover:bg-[#FAF8F2] hover:text-[#18352B] dark:hover:text-[#F4EFE3] transition shadow-xs cursor-pointer"
            >
              {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span>{soundEnabled ? "Sound" : "Muted"}</span>
            </button>
          )}
        </div>

        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            title="Game Settings"
            aria-label="Game Settings"
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-2.5 py-1.5 text-xs text-[#69736C] dark:text-[#B5BDB5] hover:bg-[#FAF8F2] hover:text-[#18352B] dark:hover:text-[#F4EFE3] transition shadow-xs cursor-pointer"
          >
            <Settings size={13} />
            <span>Settings</span>
          </button>
        )}
      </div>

      {/* Resign Confirmation Modal */}
      {showResignConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resign-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#18352B]/40 dark:bg-[#0E1713]/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-sm rounded-[20px] border border-[#A94B45]/30 bg-[#FBF9F3] dark:bg-[#21332B] p-5 shadow-[0_24px_64px_rgba(24,34,30,0.14)] space-y-4 text-[#18221E] dark:text-[#F4EFE3]">
            <div className="flex items-center gap-2 text-[#A94B45]">
              <Flag size={20} />
              <h3 id="resign-title" className="text-base font-serif font-bold text-[#18352B] dark:text-[#F4EFE3]">
                Resign Game?
              </h3>
            </div>

            <p className="text-xs text-[#69736C] dark:text-[#B5BDB5] leading-relaxed">
              Are you sure you want to resign? The match will conclude immediately and a loss will be recorded.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResignConfirm(false)}
                className="rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-4 py-2 text-xs font-semibold text-[#18352B] dark:text-[#F4EFE3] hover:bg-[#FAF8F2] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResign}
                className="rounded-[12px] bg-[#A94B45] hover:bg-[#913B35] px-4 py-2 text-xs font-semibold text-white transition cursor-pointer shadow-xs"
              >
                Confirm Resign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draw Confirmation Modal */}
      {showDrawConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="draw-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#18352B]/40 dark:bg-[#0E1713]/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-sm rounded-[20px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-5 shadow-[0_24px_64px_rgba(24,34,30,0.14)] space-y-4 text-[#18221E] dark:text-[#F4EFE3]">
            <div className="flex items-center gap-2 text-[#B58A3A]">
              <Handshake size={20} />
              <h3 id="draw-title" className="text-base font-serif font-bold text-[#18352B] dark:text-[#F4EFE3]">
                Offer a Draw?
              </h3>
            </div>

            <p className="text-xs text-[#69736C] dark:text-[#B5BDB5] leading-relaxed">
              Send a draw offer to your opponent? If they accept, the game will end in a tie.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDrawConfirm(false)}
                className="rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-4 py-2 text-xs font-semibold text-[#18352B] dark:text-[#F4EFE3] hover:bg-[#FAF8F2] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDraw}
                className="rounded-[12px] bg-[#18352B] dark:bg-[#285443] hover:bg-[#285443] px-4 py-2 text-xs font-semibold text-white transition cursor-pointer shadow-xs"
              >
                Send Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
