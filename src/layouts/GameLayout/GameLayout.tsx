"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, ScrollText, Users, Eye } from "lucide-react";

export interface GameLayoutProps {
  header?: React.ReactNode;
  board: React.ReactNode;
  topPlayer: React.ReactNode;
  bottomPlayer: React.ReactNode;
  controls: React.ReactNode;
  sidebar?: React.ReactNode;
  moveList?: React.ReactNode;
  chat?: React.ReactNode;
  spectators?: React.ReactNode;
  statusBanner?: React.ReactNode;
  spectatorCount?: number;
  isSpectator?: boolean;
  gameTitle?: string;
  timeControlText?: string;
}

export default function GameLayout({
  header,
  board,
  topPlayer,
  bottomPlayer,
  controls,
  sidebar,
  moveList,
  chat,
  spectators,
  statusBanner,
  spectatorCount = 0,
  isSpectator = false,
  gameTitle = "Live Match",
  timeControlText = "10 + 0",
}: GameLayoutProps) {
  const [mobileTab, setMobileTab] = useState<"board" | "moves" | "chat" | "spectators">("board");

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[#171A18] animate-pageEnter">
      {/* Top Header */}
      {header ? (
        header
      ) : (
        <header className="sticky top-0 z-40 border-b border-[rgba(30,30,20,0.08)] bg-[#F7F4EC]/90 backdrop-blur-xl">
          <div className="mx-auto flex h-14 sm:h-16 max-w-[1500px] items-center justify-between px-3 sm:px-6">
            <div className="flex items-center gap-3">
              <Link
                href="/play"
                aria-label="Return to Play"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-[rgba(30,30,20,0.12)] bg-white text-[#171A18] hover:bg-[#FAF8F2] transition-colors shadow-sm"
              >
                <ArrowLeft size={16} />
              </Link>

              <div className="flex items-center gap-2">
                <span className="text-sm font-serif font-bold tracking-wider text-[#171A18]">CHESSVERSE</span>
                <span className="rounded-full bg-[#EFECE3] px-2.5 py-0.5 text-[10px] font-mono uppercase text-[#68706A] border border-[rgba(30,30,20,0.06)] hidden sm:inline">
                  {isSpectator ? "Spectator Mode" : "Game Room"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#68706A]">
                <span>{timeControlText}</span>
              </div>

              {spectatorCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-[#68706A] bg-white px-2.5 py-1 rounded-full border border-[rgba(30,30,20,0.08)] font-mono shadow-sm">
                  <Eye size={12} className="text-[#B88A32]" />
                  <span>{spectatorCount}</span>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Global Status Banner (e.g. Draw offer, reconnect notice) */}
      {statusBanner}

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-[1500px] px-2 sm:px-4 lg:px-8 py-2 sm:py-4 flex flex-col lg:flex-row gap-4 sm:gap-6 items-center lg:items-start justify-center">
        {/* Dominant Centerpiece: Chessboard + Players + Clocks */}
        <section
          aria-label="Chessboard and players"
          className="flex-1 flex flex-col items-center max-w-[620px] w-full gap-2 sm:gap-3"
        >
          {/* Top Player (Opponent) */}
          <div className="w-full">{topPlayer}</div>

          {/* Resilient Square Board */}
          <div className="w-full flex justify-center aspect-square max-w-[620px] my-auto">
            {board}
          </div>

          {/* Bottom Player (Current User) */}
          <div className="w-full">{bottomPlayer}</div>

          {/* Core Game Controls */}
          <div className="w-full mt-1 sm:mt-2">{controls}</div>
        </section>

        {/* Desktop Sidebar: Move notation, Chat, Spectator info */}
        <aside
          aria-label="Game details, move list, and chat"
          className="hidden lg:flex w-[380px] shrink-0 flex-col gap-3 rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/80 p-3 shadow-[0_8px_30px_rgba(35,30,20,0.04)] max-h-[820px] overflow-y-auto"
        >
          {sidebar ? (
            sidebar
          ) : (
            <>
              {moveList}
              {spectators}
              {chat}
            </>
          )}
        </aside>

        {/* Mobile Layout Bottom Tabs / Drawers */}
        <div className="lg:hidden w-full max-w-[620px] mt-2">
          {/* Bottom Tab Bar for Mobile */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#EFECE3] border border-[rgba(30,30,20,0.08)] rounded-xl">
            <button
              type="button"
              onClick={() => setMobileTab(mobileTab === "moves" ? "board" : "moves")}
              className={[
                "flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition",
                mobileTab === "moves"
                  ? "bg-[#B88A32] text-white shadow-sm"
                  : "text-[#68706A] hover:text-[#171A18]",
              ].join(" ")}
            >
              <ScrollText size={14} />
              <span>Moves</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab(mobileTab === "chat" ? "board" : "chat")}
              className={[
                "flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition",
                mobileTab === "chat"
                  ? "bg-[#B88A32] text-white shadow-sm"
                  : "text-[#68706A] hover:text-[#171A18]",
              ].join(" ")}
            >
              <MessageSquare size={14} />
              <span>Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab(mobileTab === "spectators" ? "board" : "spectators")}
              className={[
                "flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition",
                mobileTab === "spectators"
                  ? "bg-[#B88A32] text-white shadow-sm"
                  : "text-[#68706A] hover:text-[#171A18]",
              ].join(" ")}
            >
              <Users size={14} />
              <span>Watchers</span>
            </button>
          </div>

          {/* Mobile Tab Drawer Panel */}
          {mobileTab !== "board" && (
            <div className="mt-3 rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/90 p-3 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
              {mobileTab === "moves" && moveList}
              {mobileTab === "chat" && chat}
              {mobileTab === "spectators" && spectators}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
