"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, type Column } from "../../components";
import { fetchAdminGames } from "../../services/games";
import type { AdminGame } from "../../services/types";

export const GamesPage: React.FC = () => {
  const [games, setGames] = useState<AdminGame[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const loadGames = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminGames({ status: statusFilter, page, limit: 15 });
      if (data.success) {
        setGames(data.games);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Failed to load games:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, [page, statusFilter]);

  const columns: Column<AdminGame>[] = [
    {
      key: "_id",
      header: "Game ID",
      render: (g) => <span className="font-mono text-xs text-[var(--color-primary)]">{g._id.slice(-6).toUpperCase()}</span>,
    },
    {
      key: "players",
      header: "Players",
      render: (g) => (
        <div className="text-xs">
          <div className="font-medium text-[var(--color-text)]">
            ⚪ {g.white?.username || "White"}
          </div>
          <div className="font-medium text-[var(--color-text-secondary)]">
            ⚫ {g.black?.username || (g.isAiGame ? "AI Bot" : "Black")}
          </div>
        </div>
      ),
    },
    {
      key: "timeControl",
      header: "Time Control",
      render: (g) => (
        <span className="text-xs font-mono text-[var(--color-text-secondary)]">
          {g.timeControl ? `${Math.round(g.timeControl.initial / 60)}+${g.timeControl.increment}` : "Custom"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (g) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
            g.status === "playing"
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse"
              : g.status === "finished"
              ? "bg-[var(--color-surface-hover)] text-[var(--color-text)] border-[var(--color-border)]"
              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
          }`}
        >
          {g.status === "playing" ? "● LIVE" : g.status}
        </span>
      ),
    },
    {
      key: "result",
      header: "Result",
      render: (g) => (
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          {g.result || "In Progress"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Started",
      render: (g) => (
        <span className="text-xs text-[var(--color-text-secondary)]">
          {new Date(g.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (g) => (
        <Link
          href={`/admin/games/${g._id}`}
          className="px-2.5 py-1 text-xs font-medium rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]"
        >
          Inspect
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
            Game Management & Live Monitoring
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Inspect active and historical games across Human vs Human and AI matches.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          {["all", "playing", "finished", "aborted"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-[var(--radius-md)] capitalize font-medium transition-colors ${
                statusFilter === s
                  ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-semibold border border-[var(--color-primary)]/30"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-transparent"
              }`}
            >
              {s === "playing" ? "● Live" : s}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={games}
        keyExtractor={(g) => g._id}
        isLoading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        onPageChange={setPage}
        renderMobileCard={(g) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[var(--color-primary)]">
                Game #{g._id.slice(-6).toUpperCase()}
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                  g.status === "playing"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-[var(--color-surface-hover)] text-[var(--color-text)]"
                }`}
              >
                {g.status === "playing" ? "● LIVE" : g.status}
              </span>
            </div>
            <div className="text-xs font-medium text-[var(--color-text)]">
              {g.white?.username || "White"} vs {g.black?.username || "Black"}
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)]">Result: {g.result || "In Progress"}</span>
              <Link href={`/admin/games/${g._id}`} className="text-[var(--color-primary)] font-medium">
                Inspect Game →
              </Link>
            </div>
          </div>
        )}
      />
    </div>
  );
};
