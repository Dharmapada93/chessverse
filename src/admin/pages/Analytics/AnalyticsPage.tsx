"use client";

import React, { useState, useEffect } from "react";
import { StatCard } from "../../components";
import { fetchAdminAnalytics } from "../../services/analytics";
import type { AdminAnalytics } from "../../services/types";

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [range, setRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchAdminAnalytics(range)
      .then((res) => {
        if (res.success) {
          setData(res as any);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [range]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
            Platform Analytics & Engagement Insights
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Aggregated match metrics, player retention, and game completion performance.
          </p>
        </div>

        {/* Time Range Switcher (R6.43) */}
        <div className="flex items-center gap-1.5 text-xs">
          {[
            { label: "24 Hours", value: "24h" },
            { label: "7 Days", value: "7d" },
            { label: "30 Days", value: "30d" },
            { label: "90 Days", value: "90d" },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-[var(--radius-md)] font-medium transition-colors ${
                range === r.value
                  ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-semibold border border-[var(--color-primary)]/30"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-transparent"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate Cards Grid (R6.42) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Matches Played"
          value={data ? data.aggregates.totalGames : "..."}
          subtitle={`In the selected ${range}`}
          icon="♟️"
        />
        <StatCard
          title="New Accounts"
          value={data ? data.aggregates.newUsers : "..."}
          subtitle="Registrations"
          icon="👥"
        />
        <StatCard
          title="Completion Rate"
          value={data ? `${data.aggregates.completionRatePct}%` : "..."}
          subtitle="Non-aborted matches"
          icon="✅"
        />
        <StatCard
          title="Avg Game Duration"
          value={data ? `${data.aggregates.avgGameDurationMin}m` : "..."}
          subtitle="Across all time controls"
          icon="⏱️"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Control Distribution Card (R6.44) */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
          <div className="border-b border-[var(--color-border)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Time Control Breakdown</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Distribution of player preferences</p>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { name: "Blitz (3|2, 5|0, 5|3)", count: data?.timeControlBreakdown.blitz || 0, color: "bg-amber-400" },
              { name: "Bullet (1|0, 2|1)", count: data?.timeControlBreakdown.bullet || 0, color: "bg-red-400" },
              { name: "Rapid (10|0, 15|10)", count: data?.timeControlBreakdown.rapid || 0, color: "bg-emerald-400" },
              { name: "Classical (30|0+)", count: data?.timeControlBreakdown.classical || 0, color: "bg-blue-400" },
            ].map((tc) => {
              const totalGames = data?.aggregates.totalGames || 1;
              const pct = Math.round((tc.count / totalGames) * 100);
              return (
                <div key={tc.name} className="space-y-1">
                  <div className="flex justify-between items-center text-[var(--color-text)]">
                    <span className="font-medium">{tc.name}</span>
                    <span className="font-mono font-semibold">{tc.count.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--color-bg)] overflow-hidden">
                    <div style={{ width: `${Math.max(2, pct)}%` }} className={`h-full rounded-full ${tc.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Human vs AI Match Distribution */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
          <div className="border-b border-[var(--color-border)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Opponent Category Breakdown</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Human multiplayer vs Stockfish AI sparring</p>
          </div>

          <div className="space-y-4 text-xs pt-2">
            <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--color-text)]">Human vs Human Multiplayer</span>
                <p className="text-[11px] text-[var(--color-text-secondary)]">Rated casual & ranked lobby matches</p>
              </div>
              <span className="text-xl font-bold font-mono text-[var(--color-primary)]">
                {data ? data.aggregates.humanGames.toLocaleString() : "..."}
              </span>
            </div>

            <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--color-text)]">Human vs AI Opponent</span>
                <p className="text-[11px] text-[var(--color-text-secondary)]">100% Free calibrated offline/online bots</p>
              </div>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {data ? data.aggregates.aiGames.toLocaleString() : "..."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
