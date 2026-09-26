"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Palette,
  ArrowLeft,
  Check,
  Volume2,
  Sliders,
  Sparkles,
  Eye,
} from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { boardThemes, type BoardTheme } from "@/config/boards";
import { pieceSets, type PieceSet } from "@/config/pieces";
import { chessThemes, type ChessTheme } from "@/config/themes";
import MiniBoard from "@/components/chess/MiniBoard";
import { apiFetch } from "@/lib/api";

export default function AppearanceSettingsPage() {
  const [selectedBoard, setSelectedBoard] = useState<string>("tournament");
  const [selectedPiece, setSelectedPiece] = useState<string>("classic");
  const [selectedUiTheme, setSelectedUiTheme] = useState<string>("dark");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(true);
  const [coordinates, setCoordinates] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Load local storage preferences
    if (typeof window !== "undefined") {
      const b = localStorage.getItem("chessverse-board-theme");
      const p = localStorage.getItem("chessverse-piece-set");
      const u = localStorage.getItem("chessverse-ui-theme");
      if (b) setSelectedBoard(b);
      if (p) setSelectedPiece(p);
      if (u) setSelectedUiTheme(u);
    }

    async function loadServerPrefs() {
      try {
        const res = await apiFetch("/api/progression/preferences");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.preferences) {
            const prefs = data.preferences;
            if (prefs.boardTheme) setSelectedBoard(prefs.boardTheme);
            if (prefs.pieceSet) setSelectedPiece(prefs.pieceSet);
            if (prefs.theme) setSelectedUiTheme(prefs.theme);
            if (typeof prefs.soundEnabled === "boolean") setSoundEnabled(prefs.soundEnabled);
            if (typeof prefs.animationsEnabled === "boolean") setAnimationsEnabled(prefs.animationsEnabled);
            if (typeof prefs.coordinates === "boolean") setCoordinates(prefs.coordinates);
          }
        }
      } catch {}
    }

    loadServerPrefs();
  }, []);

  const handleSavePreferences = async (newBoard = selectedBoard, newPiece = selectedPiece, newTheme = selectedUiTheme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chessverse-board-theme", newBoard);
      localStorage.setItem("chessverse-piece-set", newPiece);
      localStorage.setItem("chessverse-ui-theme", newTheme);
    }

    try {
      await apiFetch("/api/progression/preferences", {
        method: "POST",
        body: JSON.stringify({
          boardTheme: newBoard,
          pieceSet: newPiece,
          theme: newTheme,
          soundEnabled,
          animationsEnabled,
          coordinates,
        }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch {}
  };

  const currentBoardConfig =
    boardThemes.find((b) => b.id === selectedBoard) || boardThemes[1];

  return (
    <div className="flex min-h-screen bg-transparent text-[#171A18] animate-pageEnter">
      <AppSidebar />

      <div className="min-w-0 flex-1 pb-16 md:pb-0">
        <AppHeader />

        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[rgba(30,30,20,0.08)] pb-6">
            <div>
              <Link
                href="/settings"
                className="mb-2 inline-flex items-center gap-1.5 text-xs text-[#68706A] hover:text-[#171A18] transition"
              >
                <ArrowLeft size={13} />
                <span>Back to Settings</span>
              </Link>
              <div className="flex items-center gap-2 text-[#B88A32]">
                <Palette size={18} />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B88A32]">
                  APPEARANCE & THEMES
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[#171A18] mt-1">
                Board & Piece Customization
              </h1>
              <p className="mt-1 text-xs text-[#68706A]">
                Personalize board woods, piece sets, coordinates, and visual contrast.
              </p>
            </div>

            {savedSuccess && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm animate-in fade-in">
                <Check size={13} />
                <span>Preferences Saved</span>
              </span>
            )}
          </div>

          {/* ── Live Preview Board ───────────────────────────────── */}
          <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 p-6 sm:p-8 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#68706A]">
                LIVE PREVIEW
              </span>
              <span className="text-xs text-[#B88A32] font-semibold">
                {currentBoardConfig.name}
              </span>
            </div>

            <div className="mx-auto aspect-square max-w-[280px] overflow-hidden rounded-2xl border-4 border-[#EFECE3] shadow-[0_16px_50px_rgba(35,30,20,0.08)]">
              <div
                className="grid grid-cols-8 aspect-square select-none"
                style={{ backgroundColor: currentBoardConfig.dark }}
              >
                {/* 8x8 preview grid */}
                {Array.from({ length: 64 }).map((_, idx) => {
                  const r = Math.floor(idx / 8);
                  const c = idx % 8;
                  const isLight = (r + c) % 2 === 0;
                  const pieceSymbol =
                    idx === 0
                      ? "♜"
                      : idx === 1
                      ? "♞"
                      : idx === 4
                      ? "♚"
                      : idx === 60
                      ? "♔"
                      : idx === 59
                      ? "♕"
                      : idx === 52
                      ? "♟"
                      : idx === 11
                      ? "♟"
                      : "";

                  return (
                    <div
                      key={idx}
                      className="flex aspect-square items-center justify-center text-xl font-serif"
                      style={{
                        backgroundColor: isLight
                          ? currentBoardConfig.light
                          : currentBoardConfig.dark,
                      }}
                    >
                      {pieceSymbol && (
                        <span
                          className={
                            r >= 6
                              ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                              : "text-neutral-900 drop-shadow-[0_0.5px_0.5px_rgba(255,255,255,0.3)]"
                          }
                        >
                          {pieceSymbol}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Section 1: Chessboard Color Swatches ─────────────── */}
          <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 p-6 sm:p-7 shadow-[0_8px_30px_rgba(35,30,20,0.04)] space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#68706A]">
                CHESSBOARD THEME
              </span>
              <h3 className="text-base font-bold text-[#171A18] mt-0.5">
                Select Board Surface
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {boardThemes.map((board) => {
                const isSelected = selectedBoard === board.id;
                return (
                  <button
                    key={board.id}
                    onClick={() => {
                      setSelectedBoard(board.id);
                      handleSavePreferences(board.id, selectedPiece, selectedUiTheme);
                    }}
                    className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? "border-[#B88A32] bg-[#B88A32]/10 scale-[1.02]"
                        : "border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] hover:border-[rgba(30,30,20,0.2)]"
                    }`}
                  >
                    {/* 2x2 Mini Board Swatch */}
                    <div className="mb-2.5 h-10 w-full overflow-hidden rounded-lg border border-black/10 grid grid-cols-4">
                      <div style={{ backgroundColor: board.light }} />
                      <div style={{ backgroundColor: board.dark }} />
                      <div style={{ backgroundColor: board.light }} />
                      <div style={{ backgroundColor: board.dark }} />
                      <div style={{ backgroundColor: board.dark }} />
                      <div style={{ backgroundColor: board.light }} />
                      <div style={{ backgroundColor: board.dark }} />
                      <div style={{ backgroundColor: board.light }} />
                    </div>

                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-[#171A18] truncate">
                        {board.name}
                      </span>
                      {isSelected && <Check size={13} className="text-[#B88A32]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Section 2: Piece Set Selector ────────────────────── */}
          <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 p-6 sm:p-7 shadow-[0_8px_30px_rgba(35,30,20,0.04)] space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#68706A]">
                PIECE SET
              </span>
              <h3 className="text-base font-bold text-[#171A18] mt-0.5">
                Choose Piece Typography
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pieceSets.map((piece) => {
                const isSelected = selectedPiece === piece.id;
                return (
                  <button
                    key={piece.id}
                    onClick={() => {
                      setSelectedPiece(piece.id);
                      handleSavePreferences(selectedBoard, piece.id, selectedUiTheme);
                    }}
                    className={`flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? "border-[#B88A32] bg-[#B88A32]/10"
                        : "border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] hover:border-[rgba(30,30,20,0.2)]"
                    }`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFECE3] border border-[rgba(30,30,20,0.08)] text-2xl font-serif text-[#171A18]">
                      {piece.samplePiece}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#171A18]">
                          {piece.name}
                        </span>
                        {isSelected && <Check size={13} className="text-[#B88A32]" />}
                      </div>
                      <p className="text-[10px] text-[#68706A] truncate mt-0.5">
                        {piece.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Section 3: Interface Theme & Options ─────────────── */}
          <div className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 p-6 sm:p-7 shadow-[0_8px_30px_rgba(35,30,20,0.04)] space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#68706A]">
                SYSTEM & BEHAVIOR
              </span>
              <h3 className="text-base font-bold text-[#171A18] mt-0.5">
                Interface Preferences
              </h3>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { id: "light", label: "Warm Ivory", desc: "Premium editorial light aesthetic" },
                { id: "tournament", label: "Classic Warm", desc: "Refined club wood tones" },
                { id: "system", label: "System Default", desc: "Match device OS brightness" },
              ].map((theme) => {
                const isSelected = selectedUiTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSelectedUiTheme(theme.id);
                      handleSavePreferences(selectedBoard, selectedPiece, theme.id);
                    }}
                    className={`rounded-2xl border p-4 text-left transition cursor-pointer shadow-sm ${
                      isSelected
                        ? "border-[#B88A32] bg-[#B88A32]/10"
                        : "border-[rgba(30,30,20,0.08)] bg-[#FAF8F2] hover:border-[rgba(30,30,20,0.2)]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#171A18]">{theme.label}</span>
                      {isSelected && <Check size={13} className="text-[#B88A32]" />}
                    </div>
                    <p className="text-[11px] text-[#68706A]">{theme.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Toggles */}
            <div className="border-t border-[rgba(30,30,20,0.08)] pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#171A18]">Show Board Coordinates</p>
                  <p className="text-[11px] text-[#68706A]">Display ranks 1–8 and files a–h along the board edge</p>
                </div>
                <input
                  type="checkbox"
                  checked={coordinates}
                  onChange={(e) => {
                    setCoordinates(e.target.checked);
                    handleSavePreferences();
                  }}
                  className="h-5 w-5 accent-[#B88A32] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#171A18]">Piece Move Audio</p>
                  <p className="text-[11px] text-[#68706A]">Subtle wooden click sound effects on move, capture, and check</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => {
                    setSoundEnabled(e.target.checked);
                    handleSavePreferences();
                  }}
                  className="h-5 w-5 accent-[#B88A32] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
