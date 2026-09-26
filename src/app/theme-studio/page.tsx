"use client";

import React, { useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { boardThemes, type BoardTheme } from "@/config/boards";
import { pieceSets, type PieceSet } from "@/config/pieces";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { Check, Palette, Sparkles } from "lucide-react";

export default function ThemeStudioPage() {
  const { boardTheme, setBoardTheme, pieceSet, setPieceSet } = useTheme();
  const { notify } = useToast();

  const [activeBoard, setActiveBoard] = useState(boardTheme);
  const [activePiece, setActivePiece] = useState(pieceSet);

  function handleApply() {
    setBoardTheme(activeBoard);
    setPieceSet(activePiece);
    notify.success("Theme settings saved successfully.");
  }

  return (
    <AppLayout maxWidth="lg">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)] mb-3">
            <Palette size={13} />
            <span>100% Free Customization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text)]">
            Theme Studio
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Personalize your board aesthetics and piece geometry. All themes and styles are free for all ChessVerse players.
          </p>
        </div>

        {/* Board Themes Section */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-7 shadow-xs space-y-5">
          <SectionHeader
            title="Board Palette"
            subtitle="Select your preferred square contrast and board material"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {boardThemes.map((b) => {
              const isSelected = activeBoard === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setActiveBoard(b.id)}
                  className={`rounded-[var(--radius-md)] border p-3.5 text-left transition-all duration-120 cursor-pointer ${
                    isSelected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)] shadow-xs ring-1 ring-[var(--color-primary)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  {/* 4x4 Mini Board Swatch */}
                  <div className="mb-3 h-14 w-full overflow-hidden rounded-[var(--radius-sm)] border border-black/40 grid grid-cols-4">
                    <div style={{ backgroundColor: b.light }} />
                    <div style={{ backgroundColor: b.dark }} />
                    <div style={{ backgroundColor: b.light }} />
                    <div style={{ backgroundColor: b.dark }} />
                    <div style={{ backgroundColor: b.dark }} />
                    <div style={{ backgroundColor: b.light }} />
                    <div style={{ backgroundColor: b.dark }} />
                    <div style={{ backgroundColor: b.light }} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--color-text)] truncate">
                      {b.name}
                    </span>
                    {isSelected && (
                      <Check size={14} className="text-[var(--color-primary)] shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Piece Sets Section */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-7 shadow-xs space-y-5">
          <SectionHeader
            title="Piece Sets"
            subtitle="Choose your piece silhouette and typeface styling"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {pieceSets.map((p) => {
              const isSelected = activePiece === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePiece(p.id)}
                  className={`flex items-center gap-3.5 rounded-[var(--radius-md)] border p-3.5 text-left transition-all duration-120 cursor-pointer ${
                    isSelected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)] shadow-xs ring-1 ring-[var(--color-primary)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-white/[0.04] text-2xl font-serif text-[var(--color-text)]">
                    {p.samplePiece}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--color-text)] truncate">
                        {p.name}
                      </span>
                      {isSelected && (
                        <Check size={14} className="text-[var(--color-primary)] shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--color-text-secondary)] truncate mt-0.5">
                      {p.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleApply}
            className="px-8 shadow-md"
          >
            Apply Theme
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
