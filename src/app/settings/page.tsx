"use client";

import { useState, useEffect } from "react";
import {
  User as UserIcon,
  Palette,
  LayoutGrid,
  Swords,
  Bell,
  Shield,
  Volume2,
  VolumeX,
  LogOut,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import { useAuth } from "@/context/AuthContext";
import { soundEngine, type SoundCategorySettings } from "@/lib/soundEngine";
import { apiFetch } from "@/lib/api";

type SettingsTab =
  | "account"
  | "appearance"
  | "board"
  | "gameplay"
  | "notifications"
  | "privacy";

export default function SettingsPage() {
  const { user, isAuthenticated, logout, openLogin, openRegister } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Appearance & Board states
  const [boardTheme, setBoardTheme] = useState<string>("tournament");
  const [pieceSet, setPieceSet] = useState<string>("classic");
  const [uiTheme, setUiTheme] = useState<string>("dark");
  const [showCoords, setShowCoords] = useState<boolean>(true);
  const [highlightLastMove, setHighlightLastMove] = useState<boolean>(true);
  const [showLegalMoves, setShowLegalMoves] = useState<boolean>(true);
  const [showEvalBar, setShowEvalBar] = useState<boolean>(true);
  const [autoFlip, setAutoFlip] = useState<boolean>(false);

  // Gameplay states
  const [autoQueen, setAutoQueen] = useState<boolean>(true);
  const [enablePremoves, setEnablePremoves] = useState<boolean>(true);
  const [confirmResign, setConfirmResign] = useState<boolean>(true);

  // Sound states
  const [soundSettings, setSoundSettings] = useState<SoundCategorySettings>(() =>
    soundEngine.getSettings()
  );

  // Notifications states
  const [notifyChallenges, setNotifyChallenges] = useState<boolean>(true);
  const [notifyFriendOnline, setNotifyFriendOnline] = useState<boolean>(true);
  const [notifySpectators, setNotifySpectators] = useState<boolean>(false);

  // Privacy states
  const [presenceVisibility, setPresenceVisibility] = useState<string>("friends");
  const [allowSpectating, setAllowSpectating] = useState<boolean>(true);
  const [challengeSource, setChallengeSource] = useState<string>("anyone");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const b = localStorage.getItem("chessverse-board-theme");
      const p = localStorage.getItem("chessverse-piece-set");
      const u = localStorage.getItem("chessverse-ui-theme");
      if (b) setBoardTheme(b);
      if (p) setPieceSet(p);
      if (u) setUiTheme(u);

      const coords = localStorage.getItem("chessverse-show-coords");
      if (coords !== null) setShowCoords(coords === "true");

      const hl = localStorage.getItem("chessverse-highlight-last-move");
      if (hl !== null) setHighlightLastMove(hl === "true");

      const evalBar = localStorage.getItem("chessverse-show-eval");
      if (evalBar !== null) setShowEvalBar(evalBar === "true");

      const premove = localStorage.getItem("chessverse-premoves");
      if (premove !== null) setEnablePremoves(premove === "true");
    }

    async function loadServerPrefs() {
      try {
        const res = await apiFetch("/api/progression/preferences");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.preferences) {
            const prefs = data.preferences;
            if (prefs.boardTheme) setBoardTheme(prefs.boardTheme);
            if (prefs.pieceSet) setPieceSet(prefs.pieceSet);
            if (prefs.theme) setUiTheme(prefs.theme);
            if (typeof prefs.coordinates === "boolean") setShowCoords(prefs.coordinates);
          }
        }
      } catch {}
    }

    if (isAuthenticated) {
      loadServerPrefs();
    }
  }, [isAuthenticated]);

  function triggerFeedback(msg: string) {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 2500);
  }

  function handleSoundCategory(cat: keyof SoundCategorySettings, val: boolean) {
    soundEngine.setCategoryEnabled(cat, val);
    setSoundSettings(soundEngine.getSettings());
    triggerFeedback("Audio preferences updated");
  }

  function handleBoardThemeChange(theme: string) {
    setBoardTheme(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem("chessverse-board-theme", theme);
    }
    apiFetch("/api/progression/preferences", {
      method: "PUT",
      body: JSON.stringify({ boardTheme: theme }),
    }).catch(() => {});
    triggerFeedback(`Board theme set to ${theme}`);
  }

  function handlePieceSetChange(set: string) {
    setPieceSet(set);
    if (typeof window !== "undefined") {
      localStorage.setItem("chessverse-piece-set", set);
    }
    apiFetch("/api/progression/preferences", {
      method: "PUT",
      body: JSON.stringify({ pieceSet: set }),
    }).catch(() => {});
    triggerFeedback(`Piece set set to ${set}`);
  }

  const navItems = [
    { id: "account" as const, label: "Account", icon: UserIcon },
    { id: "appearance" as const, label: "Appearance", icon: Palette },
    { id: "board" as const, label: "Board", icon: LayoutGrid },
    { id: "gameplay" as const, label: "Gameplay", icon: Swords },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "privacy" as const, label: "Privacy", icon: Shield },
  ];

  return (
    <div className="flex min-h-screen bg-transparent text-[#18221E] dark:text-[#F4EFE3] animate-pageEnter">
      <AppSidebar />

      <div className="min-w-0 flex-1 flex flex-col">
        <AppHeader />

        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:px-12 flex-1">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[rgba(24,34,30,0.08)] dark:border-white/8 pb-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B58A3A]">
                Preferences
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3]">
                Settings
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-[#69736C] dark:text-[#B5BDB5]">
                Customize your account, board aesthetics, game controls, and privacy.
              </p>
            </div>

            {saveSuccess && (
              <div className="inline-flex items-center gap-2 rounded-[12px] bg-[#27815D]/10 border border-[#27815D]/20 px-3.5 py-1.5 text-xs font-semibold text-[#27815D] shadow-xs animate-in fade-in duration-200">
                <Check size={14} />
                <span>{saveSuccess}</span>
              </div>
            )}
          </div>

          {/* Settings Workspace: Clean Split Layout */}
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 lg:gap-12">
            {/* Sidebar Navigation */}
            <nav className="flex md:flex-col overflow-x-auto md:overflow-visible gap-1 pb-2 md:pb-0 scrollbar-none border-b md:border-b-0 border-[rgba(24,34,30,0.08)] dark:border-white/8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-xs sm:text-sm font-semibold transition whitespace-nowrap text-left cursor-pointer ${
                      isActive
                        ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18221E] dark:text-[#F4EFE3] md:border-l-2 md:border-[#B58A3A] shadow-xs"
                        : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E] dark:hover:text-[#F4EFE3] hover:bg-[#F7F4EC] dark:hover:bg-[#1B2A24]"
                    }`}
                  >
                    <Icon size={16} className={isActive ? "text-[#B58A3A]" : "text-[#69736C] dark:text-[#B5BDB5]"} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Content Area */}
            <div className="min-w-0">
              {/* ACCOUNT SECTION */}
              {activeTab === "account" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold text-[#18221E] dark:text-[#F4EFE3]">Account Information</h2>
                    <p className="text-xs text-[#69736C] dark:text-[#B5BDB5] mt-0.5">
                      Your identity and authentication state across ChessVerse.
                    </p>
                  </div>

                  {isAuthenticated && user ? (
                    <div className="divide-y divide-[rgba(24,34,30,0.06)] dark:divide-white/6 border-y border-[rgba(24,34,30,0.08)] dark:border-white/8">
                      <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] font-medium">Username</p>
                          <p className="text-sm font-semibold text-[#18221E] dark:text-[#F4EFE3] mt-1">{user.username}</p>
                        </div>
                        <span className="text-xs text-[#B58A3A] font-mono font-bold">
                          Rating: {user.rating || 1428} Elo
                        </span>
                      </div>

                      <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] font-medium">Email Address</p>
                          <p className="text-sm text-[#18221E] dark:text-[#F4EFE3] mt-1">{user.email || "No email on record"}</p>
                        </div>
                        <span className="text-xs text-[#27815D] bg-[#27815D]/10 px-2.5 py-0.5 rounded-full border border-[#27815D]/20 font-medium">
                          Verified
                        </span>
                      </div>

                      <div className="py-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Security & Active Sessions</p>
                          <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                            Inspect logged-in devices and revoke stale browser sessions.
                          </p>
                        </div>
                        <a
                          href="/settings/security"
                          className="inline-flex items-center gap-1.5 text-xs text-[#B58A3A] font-semibold hover:underline"
                        >
                          Manage Sessions
                          <ChevronRight size={13} />
                        </a>
                      </div>

                      <div className="py-5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-[#A94B45]">Session Termination</p>
                          <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                            Sign out from this browser and invalidate the active token.
                          </p>
                        </div>
                        <button
                          onClick={logout}
                          className="inline-flex items-center gap-2 rounded-[12px] border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-[#A94B45] transition hover:bg-rose-500/20 cursor-pointer shadow-xs"
                        >
                          <LogOut size={14} />
                          Log Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[20px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-6 text-center shadow-[0_4px_16px_rgba(35,40,30,0.04)]">
                      <p className="text-sm font-semibold text-[#18221E] dark:text-[#F4EFE3]">
                        You are currently playing as a guest.
                      </p>
                      <p className="text-xs text-[#69736C] dark:text-[#B5BDB5] mt-1 max-w-sm mx-auto">
                        Log in or create a free account to track your real rating, games, and friend activity.
                      </p>
                      <div className="mt-5 flex items-center justify-center gap-3">
                        <button
                          onClick={openLogin}
                          className="rounded-[12px] bg-[#18352B] px-4 py-2 text-xs font-bold text-[#F7F4EC] transition hover:bg-[#285443] shadow-xs cursor-pointer"
                        >
                          Log In
                        </button>
                        <button
                          onClick={openRegister}
                          className="rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-4 py-2 text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3] transition hover:border-[#B58A3A]/40 shadow-xs cursor-pointer"
                        >
                          Create Account
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* APPEARANCE SECTION */}
              {activeTab === "appearance" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold text-[#18221E] dark:text-[#F4EFE3]">Board & Piece Styling</h2>
                    <p className="text-xs text-[#69736C] dark:text-[#B5BDB5] mt-0.5">
                      Curated colorways designed for optimal piece-to-square contrast.
                    </p>
                  </div>

                  {/* Board Themes */}
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] font-semibold">Board Palette</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: "tournament", name: "Classic Wood", dark: "#B58863", light: "#F0D9B5" },
                        { id: "slate", name: "Slate Charcoal", dark: "#4A5568", light: "#CBD5E0" },
                        { id: "emerald", name: "Forest Emerald", dark: "#2E6930", light: "#D3E4C6" },
                        { id: "midnight", name: "Midnight Onyx", dark: "#1E222D", light: "#3D4457" },
                      ].map((theme) => {
                        const isSelected = boardTheme === theme.id;
                        return (
                          <button
                            key={theme.id}
                            onClick={() => handleBoardThemeChange(theme.id)}
                            className={`flex flex-col p-3 rounded-[14px] border text-left transition cursor-pointer shadow-xs ${
                              isSelected
                                ? "border-[#B58A3A] bg-[#B58A3A]/10"
                                : "border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#FBF9F3] dark:bg-[#21332B] hover:border-[#B58A3A]/40"
                            }`}
                          >
                            <div className="flex h-8 w-full rounded-[8px] overflow-hidden mb-2 border border-black/10">
                              <span className="w-1/2 h-full" style={{ backgroundColor: theme.light }} />
                              <span className="w-1/2 h-full" style={{ backgroundColor: theme.dark }} />
                            </div>
                            <span className="text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3]">{theme.name}</span>
                            {isSelected && (
                              <span className="text-[10px] text-[#B58A3A] font-semibold mt-0.5 flex items-center gap-1">
                                <Check size={10} /> Active
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Piece Sets */}
                  <div className="space-y-3 pt-4 border-t border-[rgba(24,34,30,0.08)] dark:border-white/8">
                    <p className="text-xs uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] font-semibold">Piece Set</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { id: "classic", name: "Neo Staunton", desc: "Crisp vector pieces" },
                        { id: "wood", name: "Handcrafted Wood", desc: "Warm textured grain" },
                        { id: "minimal", name: "Modern Outline", desc: "Minimalist geometry" },
                      ].map((set) => {
                        const isSelected = pieceSet === set.id;
                        return (
                          <button
                            key={set.id}
                            onClick={() => handlePieceSetChange(set.id)}
                            className={`p-3.5 rounded-[14px] border text-left transition cursor-pointer shadow-xs ${
                              isSelected
                                ? "border-[#B58A3A] bg-[#B58A3A]/10"
                                : "border-[rgba(24,34,30,0.08)] dark:border-white/8 bg-[#FBF9F3] dark:bg-[#21332B] hover:border-[#B58A3A]/40"
                            }`}
                          >
                            <p className="text-xs font-semibold text-[#18221E] dark:text-[#F4EFE3]">{set.name}</p>
                            <p className="text-[11px] text-[#69736C] dark:text-[#B5BDB5] mt-0.5">{set.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Full appearance customizer link */}
                  <div className="pt-2">
                    <a
                      href="/settings/appearance"
                      className="inline-flex items-center gap-1.5 text-xs text-[#B58A3A] font-semibold hover:underline"
                    >
                      <Sparkles size={13} />
                      Open interactive board preview customizer
                    </a>
                  </div>
                </div>
              )}

              {/* BOARD SECTION */}
              {activeTab === "board" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold text-[#18221E] dark:text-[#F4EFE3]">Board Navigation & Overlays</h2>
                    <p className="text-xs text-[#69736C] dark:text-[#B5BDB5] mt-0.5">
                      Configure legal move highlights, rank/file coordinates, and engine metrics.
                    </p>
                  </div>

                  <div className="divide-y divide-[rgba(24,34,30,0.06)] dark:divide-white/6 border-y border-[rgba(24,34,30,0.08)] dark:border-white/8">
                    <div className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Board Coordinates</p>
                        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                          Show rank (1-8) and file (a-h) indicators on the chessboard edge.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={showCoords}
                        onChange={(e) => {
                          setShowCoords(e.target.checked);
                          localStorage.setItem("chessverse-show-coords", String(e.target.checked));
                          triggerFeedback("Coordinates updated");
                        }}
                        className="h-4 w-4 accent-[#B58A3A] cursor-pointer"
                      />
                    </div>

                    <div className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Highlight Last Move</p>
                        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                          Highlight origin and destination squares of the opponent's previous move.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={highlightLastMove}
                        onChange={(e) => {
                          setHighlightLastMove(e.target.checked);
                          localStorage.setItem("chessverse-highlight-last-move", String(e.target.checked));
                          triggerFeedback("Move highlight updated");
                        }}
                        className="h-4 w-4 accent-[#B58A3A] cursor-pointer"
                      />
                    </div>

                    <div className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Legal Move Indicators</p>
                        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                          Render subtle dots on valid destination squares when a piece is picked.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={showLegalMoves}
                        onChange={(e) => {
                          setShowLegalMoves(e.target.checked);
                          triggerFeedback("Move indicators updated");
                        }}
                        className="h-4 w-4 accent-[#B58A3A] cursor-pointer"
                      />
                    </div>

                    <div className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Real-Time Evaluation Bar</p>
                        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                          Show vertical advantage bar powered by local Stockfish engine during analysis.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={showEvalBar}
                        onChange={(e) => {
                          setShowEvalBar(e.target.checked);
                          localStorage.setItem("chessverse-show-eval", String(e.target.checked));
                          triggerFeedback("Evaluation bar updated");
                        }}
                        className="h-4 w-4 accent-[#B58A3A] cursor-pointer"
                      />
                    </div>

                    <div className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Auto-Flip When Playing Black</p>
                        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                          Automatically orient board with Black on the bottom when assigned Black pieces.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={autoFlip}
                        onChange={(e) => {
                          setAutoFlip(e.target.checked);
                          triggerFeedback("Orientation preference saved");
                        }}
                        className="h-4 w-4 accent-[#B58A3A] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* GAMEPLAY SECTION */}
              {activeTab === "gameplay" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold text-[#18221E] dark:text-[#F4EFE3]">Gameplay & Audio Engine</h2>
                    <p className="text-xs text-[#69736C] dark:text-[#B5BDB5] mt-0.5">
                      Fine-tune move execution, pre-moves, and sound cue categories.
                    </p>
                  </div>

                  <div className="divide-y divide-[rgba(24,34,30,0.06)] dark:divide-white/6 border-y border-[rgba(24,34,30,0.08)] dark:border-white/8">
                    <div className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Pre-moves</p>
                        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                          Queue a response move while your opponent's clock is ticking.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={enablePremoves}
                        onChange={(e) => {
                          setEnablePremoves(e.target.checked);
                          localStorage.setItem("chessverse-premoves", String(e.target.checked));
                          triggerFeedback("Pre-moves updated");
                        }}
                        className="h-4 w-4 accent-[#B58A3A] cursor-pointer"
                      />
                    </div>

                    <div className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Auto-Queen on Promotion</p>
                        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                          Always promote pawns to Queen automatically to save precious seconds in speed chess.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={autoQueen}
                        onChange={(e) => {
                          setAutoQueen(e.target.checked);
                          triggerFeedback("Promotion rule updated");
                        }}
                        className="h-4 w-4 accent-[#B58A3A] cursor-pointer"
                      />
                    </div>

                    <div className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Confirm Resignations</p>
                        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                          Require confirmation before ending a live game to avoid accidental clicks.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={confirmResign}
                        onChange={(e) => {
                          setConfirmResign(e.target.checked);
                          triggerFeedback("Resignation confirmation updated");
                        }}
                        className="h-4 w-4 accent-[#B58A3A] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Sound Engine Categories */}
                  <div className="pt-2">
                    <p className="text-xs uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] font-semibold mb-3">Sound Effects</p>
                    <div className="divide-y divide-[rgba(24,34,30,0.06)] dark:divide-white/6 border-y border-[rgba(24,34,30,0.08)] dark:border-white/8">
                      <div className="py-3.5 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Piece Move</p>
                          <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">Acoustic wood tap on normal moves and castling</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={soundSettings.move}
                          onChange={(e) => handleSoundCategory("move", e.target.checked)}
                          className="h-4 w-4 accent-[#B58A3A] cursor-pointer"
                        />
                      </div>

                      <div className="py-3.5 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Capture</p>
                          <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">Impact sound effect on capturing opponent material</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={soundSettings.capture}
                          onChange={(e) => handleSoundCategory("capture", e.target.checked)}
                          className="h-4 w-4 accent-[#B58A3A] cursor-pointer"
                        />
                      </div>

                      <div className="py-3.5 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Check Alert</p>
                          <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">Alert sound when king is placed in check</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={soundSettings.check}
                          onChange={(e) => handleSoundCategory("check", e.target.checked)}
                          className="h-4 w-4 accent-[#B58A3A] cursor-pointer"
                        />
                      </div>

                      <div className="py-3.5 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Game Events</p>
                          <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">Audio cues for match start, checkmate, and draw</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={soundSettings.gameEvents}
                          onChange={(e) => handleSoundCategory("gameEvents", e.target.checked)}
                          className="h-4 w-4 accent-[#B58A3A] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS SECTION */}
              {activeTab === "notifications" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold text-[#18221E] dark:text-[#F4EFE3]">Notifications & Alerts</h2>
                    <p className="text-xs text-[#69736C] dark:text-[#B5BDB5] mt-0.5">
                      Control incoming alerts for friend challenges and match invitations.
                    </p>
                  </div>

                  <div className="divide-y divide-[rgba(24,34,30,0.06)] dark:divide-white/6 border-y border-[rgba(24,34,30,0.08)] dark:border-white/8">
                    <div className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Direct Game Challenges</p>
                        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                          Receive interactive challenge banners when a friend invites you to play.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifyChallenges}
                        onChange={(e) => {
                          setNotifyChallenges(e.target.checked);
                          triggerFeedback("Challenge notifications updated");
                        }}
                        className="h-4 w-4 accent-[#B58A3A] cursor-pointer"
                      />
                    </div>

                    <div className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Friend Online Alerts</p>
                        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                          Subtle notification toast when a friend comes online.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifyFriendOnline}
                        onChange={(e) => {
                          setNotifyFriendOnline(e.target.checked);
                          triggerFeedback("Presence alerts updated");
                        }}
                        className="h-4 w-4 accent-[#B58A3A] cursor-pointer"
                      />
                    </div>

                    <div className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Spectator Joined Notifications</p>
                        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                          Show quiet notice in game room when someone begins spectating your game.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifySpectators}
                        onChange={(e) => {
                          setNotifySpectators(e.target.checked);
                          triggerFeedback("Spectator notification updated");
                        }}
                        className="h-4 w-4 accent-[#B58A3A] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PRIVACY SECTION */}
              {activeTab === "privacy" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold text-[#18221E] dark:text-[#F4EFE3]">Privacy & Social Presence</h2>
                    <p className="text-xs text-[#69736C] dark:text-[#B5BDB5] mt-0.5">
                      Manage who can view your online status, challenge you, or spectate matches.
                    </p>
                  </div>

                  <div className="divide-y divide-[rgba(24,34,30,0.06)] dark:divide-white/6 border-y border-[rgba(24,34,30,0.08)] dark:border-white/8">
                    <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Online Presence Visibility</p>
                        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                          Determine who sees your green online badge in ChessVerse.
                        </p>
                      </div>
                      <select
                        value={presenceVisibility}
                        onChange={(e) => {
                          setPresenceVisibility(e.target.value);
                          triggerFeedback("Presence privacy updated");
                        }}
                        className="rounded-[10px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] px-3 py-1.5 text-xs text-[#18221E] dark:text-[#F4EFE3] outline-none focus:border-[#B58A3A] shadow-xs cursor-pointer"
                      >
                        <option value="everyone">Everyone</option>
                        <option value="friends">Friends Only</option>
                        <option value="invisible">Appear Offline</option>
                      </select>
                    </div>

                    <div className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Allow Public Spectators</p>
                        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                          Allow other registered players to watch your live games in the Watch arena.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={allowSpectating}
                        onChange={(e) => {
                          setAllowSpectating(e.target.checked);
                          triggerFeedback("Spectator privacy updated");
                        }}
                        className="h-4 w-4 accent-[#B58A3A] cursor-pointer"
                      />
                    </div>

                    <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#18221E] dark:text-[#F4EFE3]">Incoming Challenges</p>
                        <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                          Restrict who can send you direct game challenges.
                        </p>
                      </div>
                      <select
                        value={challengeSource}
                        onChange={(e) => {
                          setChallengeSource(e.target.value);
                          triggerFeedback("Challenge permission updated");
                        }}
                        className="rounded-[10px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] px-3 py-1.5 text-xs text-[#18221E] dark:text-[#F4EFE3] outline-none focus:border-[#B58A3A] shadow-xs cursor-pointer"
                      >
                        <option value="anyone">Anyone on ChessVerse</option>
                        <option value="friends">Friends Only</option>
                        <option value="nobody">Nobody (Practice & Live Matchmaking only)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
