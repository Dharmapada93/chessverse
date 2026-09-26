"use client";

import React, { useState, useEffect } from "react";
import { StatCard, ActivityLog } from "../../components";
import { apiFetch } from "../../../lib/api";
import type { AdminDashboardMetrics, AdminAuditLog } from "../../services/types";

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<Array<{ label: string; games: number }>>([]);
  const [recentActivity, setRecentActivity] = useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMetrics(data.metrics);
          setChartData(data.chartData || []);
          setRecentActivity(data.recentActivity || []);
        }
      })
      .catch((err) => console.error("Dashboard error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Dashboard Overview
          </h2>
          <p className="text-xs md:text-sm text-[var(--color-text-secondary)]">
            Platform telemetry, active sessions, and system metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-secondary)]">
            System status:
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            All Services Healthy
          </span>
        </div>
      </div>

      {/* Primary Stat Cards Grid (R6.10, R6.83) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Total Users"
          value={metrics ? metrics.totalUsers : "..."}
          subtitle="Registered accounts"
          icon="👥"
        />
        <StatCard
          title="Games Today"
          value={metrics ? metrics.gamesToday : "..."}
          subtitle="Human & AI"
          icon="♟️"
        />
        <StatCard
          title="Online Now"
          value={metrics ? metrics.onlineUsers : "..."}
          subtitle="Realtime presence"
          icon="🟢"
          statusBadge="Live"
        />
        <StatCard
          title="Open Reports"
          value={metrics ? metrics.openReports : "..."}
          subtitle="Awaiting moderation"
          icon="🚨"
          change={metrics && metrics.openReports > 0 ? "Review Needed" : "Clean"}
          isPositive={metrics ? metrics.openReports === 0 : true}
        />
      </div>

      {/* Secondary Metrics & Chart Row (R6.9, R6.83) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Activity Chart Card */}
        <div className="lg:col-span-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                Game Activity (Last 7 Days)
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Daily match volume across all time controls
              </p>
            </div>
            <span className="text-xs font-medium text-[var(--color-primary)]">
              {metrics ? `${metrics.gamesThisWeek} this week` : ""}
            </span>
          </div>

          {/* Simple Clean Responsive Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-2 md:gap-4 pt-6 border-b border-[var(--color-border)] pb-2">
            {chartData.length > 0 ? (
              chartData.map((d, i) => {
                const maxGames = Math.max(...chartData.map((c) => c.games), 1);
                const heightPct = Math.round((d.games / maxGames) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                      {d.games}
                    </span>
                    <div
                      style={{ height: `${Math.max(12, heightPct)}%` }}
                      className="w-full max-w-[36px] bg-[var(--color-primary)]/80 hover:bg-[var(--color-primary)] rounded-t-[var(--radius-sm)] transition-all cursor-pointer"
                    ></div>
                    <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">
                      {d.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-secondary)]">
                Loading game activity metrics...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-primary)]"></span>
              Human vs Human & AI matches
            </span>
            <span>Active live games right now: <strong className="text-[var(--color-text)]">{metrics?.activeGames ?? 0}</strong></span>
          </div>
        </div>

        {/* Recent Admin Activity Feed (R6.13, R6.69) */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Recent Admin Activity
            </h3>
            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold">
              Audit Stream
            </span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-80">
            <ActivityLog logs={recentActivity} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};
