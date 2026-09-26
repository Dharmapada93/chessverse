"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchAdminGameDetails, terminateGame } from "../../services/games";
import { ConfirmDialog } from "../../components";
import type { GameDetailsResponse } from "../../services/games";

export const GameDetailPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<GameDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);
  const [terminateReason, setTerminateReason] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await fetchAdminGameDetails(id);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-sm text-[var(--color-text-secondary)]">
        <span className="inline-block animate-spin mr-2">◌</span>
        Loading game details & telemetry...
      </div>
    );
  }

  if (!data?.game) {
    return (
      <div className="p-8 text-center text-sm text-[var(--color-text-secondary)]">
        Game record not found.
      </div>
    );
  }

  const { game, telemetry } = data;

  const handleTerminateSubmit = async () => {
    if (!terminateReason) return;
    setIsActionLoading(true);
    try {
      await terminateGame(game._id, terminateReason);
      setIsTerminateOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/games"
            className="p-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-xs text-[var(--color-text-secondary)]"
          >
            ← Games
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
              <span>Game #{game._id.slice(-6).toUpperCase()}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                  game.status === "playing"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse"
                    : "bg-[var(--color-surface-hover)] text-[var(--color-text)] border-[var(--color-border)]"
                }`}
              >
                {game.status === "playing" ? "● LIVE" : game.status}
              </span>
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {game.white?.username || "White"} vs {game.black?.username || "Black"}
            </p>
          </div>
        </div>

        {game.status === "playing" && (
          <button
            onClick={() => setIsTerminateOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
          >
            Terminate Game
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] uppercase font-semibold">
            White Player
          </span>
          <div className="text-base font-bold text-[var(--color-text)] mt-1">
            {game.white?.username}
          </div>
          <span className="text-xs font-mono text-[var(--color-text-secondary)]">
            Rating: {game.white?.rating || "1200"}
          </span>
        </div>
        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] uppercase font-semibold">
            Black Player
          </span>
          <div className="text-base font-bold text-[var(--color-text)] mt-1">
            {game.black?.username || (game.isAiGame ? "AI Bot" : "Black")}
          </div>
          <span className="text-xs font-mono text-[var(--color-text-secondary)]">
            Rating: {game.black?.rating || (game.isAiGame ? "AI" : "1200")}
          </span>
        </div>
        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] uppercase font-semibold">
            Result
          </span>
          <div className="text-base font-bold text-[var(--color-text)] mt-1">
            {game.result || "Ongoing"}
          </div>
        </div>
        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] uppercase font-semibold">
            Time Control
          </span>
          <div className="text-base font-bold font-mono text-[var(--color-text)] mt-1">
            {game.timeControl ? `${Math.round(game.timeControl.initial / 60)}+${game.timeControl.increment}` : "Custom"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Board State & FEN</h3>
          <div className="p-3 rounded bg-[var(--color-bg)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-text-secondary)] break-all select-all">
            {game.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"}
          </div>
          {game.pgn && (
            <div>
              <h4 className="text-xs font-semibold text-[var(--color-text)] mb-1">PGN Notation</h4>
              <pre className="p-3 rounded bg-[var(--color-bg)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-text-secondary)] max-h-40 overflow-y-auto whitespace-pre-wrap">
                {game.pgn}
              </pre>
            </div>
          )}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Fair Play Telemetry</h3>
            <span className="text-xs text-[var(--color-text-secondary)]">{telemetry.length} moves recorded</span>
          </div>
          <div className="p-4 text-xs">
            {telemetry.length === 0 ? (
              <p className="text-[var(--color-text-secondary)]">No anomalies recorded for this game.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {telemetry.map((t: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-[var(--color-border)]">
                    <span>Move {t.moveNumber}: <strong className="text-[var(--color-text)]">{t.san}</strong></span>
                    <span className="text-[var(--color-text-secondary)]">{t.thinkTimeMs}ms</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isTerminateOpen}
        title={`Terminate Game ${game._id}`}
        message="Terminating a live game immediately stops clocks and flags the result as aborted. Please provide a reason for the audit trail:"
        confirmLabel="Terminate"
        isDangerous={true}
        onConfirm={handleTerminateSubmit}
        onCancel={() => setIsTerminateOpen(false)}
        isLoading={isActionLoading}
      />
    </div>
  );
};
