"use client";

import React, { useState, useEffect } from "react";
import { StatCard } from "../../components";
import { fetchAdminAiStats, fetchAdminAiFailures, updateAdminAiSettings } from "../../services/ai";

export const AIPage: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [failures, setFailures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Technical controls state (R6.37)
  const [maxDepth, setMaxDepth] = useState(18);
  const [maxDurationSec, setMaxDurationSec] = useState(10);
  const [queueConcurrency, setQueueConcurrency] = useState(4);
  const [rateLimitPerMin, setRateLimitPerMin] = useState(30);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");

  useEffect(() => {
    Promise.all([fetchAdminAiStats(), fetchAdminAiFailures()])
      .then(([statsRes, failuresRes]) => {
        if (statsRes.success) setStats(statsRes);
        if (failuresRes.success) setFailures(failuresRes.failures || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsMessage("");
    try {
      const res = await updateAdminAiSettings({
        maxDepth,
        maxDurationSec,
        queueConcurrency,
        rateLimitPerMin,
      });
      if (res.success) {
        setSettingsMessage("Technical limits saved successfully.");
      }
    } catch (err) {
      console.error(err);
      setSettingsMessage("Failed to save settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
            AI Service Telemetry & Capacity Management
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Monitor engine calculations, background queues, failure rates, and infrastructure limits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Stockfish Engine Pool Active
          </span>
        </div>
      </div>

      {/* Metrics Row (R6.34) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Game Analyses Today"
          value={stats ? stats.today.gameAnalyses : "..."}
          subtitle="Full game reviews"
          icon="♟️"
        />
        <StatCard
          title="Coach Chat Requests"
          value={stats ? stats.today.coachRequests : "..."}
          subtitle="Position Q&A"
          icon="💬"
        />
        <StatCard
          title="AI Bot Games"
          value={stats ? stats.today.aiGames : "..."}
          subtitle="Bot opponent matches"
          icon="🤖"
        />
        <StatCard
          title="Avg Processing Time"
          value={stats ? `${stats.today.avgProcessingTimeSec}s` : "..."}
          subtitle="Per engine evaluation"
          icon="⚡"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Status Card (R6.35) */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">AI Engine Queue</h3>
            <span className="text-xs text-[var(--color-primary)] font-semibold">Active Workers: 4</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded bg-[var(--color-bg)] border border-[var(--color-border)]">
              <span className="text-[10px] text-[var(--color-text-secondary)] uppercase">Pending</span>
              <div className="text-xl font-bold font-mono text-amber-400">
                {stats?.queue?.pending ?? 0}
              </div>
            </div>
            <div className="p-3 rounded bg-[var(--color-bg)] border border-[var(--color-border)]">
              <span className="text-[10px] text-[var(--color-text-secondary)] uppercase">Processing</span>
              <div className="text-xl font-bold font-mono text-[var(--color-primary)]">
                {stats?.queue?.processing ?? 0}
              </div>
            </div>
            <div className="p-3 rounded bg-[var(--color-bg)] border border-[var(--color-border)]">
              <span className="text-[10px] text-[var(--color-text-secondary)] uppercase">Completed</span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {stats?.queue?.completed ?? 0}
              </div>
            </div>
            <div className="p-3 rounded bg-[var(--color-bg)] border border-[var(--color-border)]">
              <span className="text-[10px] text-[var(--color-text-secondary)] uppercase">Failed</span>
              <div className="text-xl font-bold font-mono text-red-400">
                {stats?.queue?.failed ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Capacity Controls (R6.37) */}
        <div className="lg:col-span-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Technical Capacity Controls</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Configure server boundaries to prevent CPU exhaustion on free tier.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              100% Free Architecture
            </span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-[var(--color-text)] mb-1">
                  Maximum Stockfish Ply Depth
                </label>
                <input
                  type="number"
                  min={8}
                  max={24}
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                />
                <span className="text-[10px] text-[var(--color-text-secondary)]">Recommended: 18 ply</span>
              </div>

              <div>
                <label className="block font-medium text-[var(--color-text)] mb-1">
                  Max Calculation Timeout (Seconds)
                </label>
                <input
                  type="number"
                  min={3}
                  max={30}
                  value={maxDurationSec}
                  onChange={(e) => setMaxDurationSec(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                />
                <span className="text-[10px] text-[var(--color-text-secondary)]">Prevents runaway engine processes</span>
              </div>

              <div>
                <label className="block font-medium text-[var(--color-text)] mb-1">
                  Parallel Queue Concurrency
                </label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={queueConcurrency}
                  onChange={(e) => setQueueConcurrency(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                />
              </div>

              <div>
                <label className="block font-medium text-[var(--color-text)] mb-1">
                  Rate Limit per IP (Req / Min)
                </label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={rateLimitPerMin}
                  onChange={(e) => setRateLimitPerMin(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-400 font-medium">{settingsMessage}</span>
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-4 py-2 rounded-[var(--radius-md)] font-semibold bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
              >
                {isSavingSettings ? "Saving..." : "Save Technical Limits"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Failure Monitoring (R6.36) */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">AI Engine Failure Monitoring</h3>
          <span className="text-xs text-[var(--color-text-secondary)]">Recent errors</span>
        </div>
        <div className="divide-y divide-[var(--color-border)] text-xs">
          {failures.length === 0 ? (
            <p className="p-6 text-center text-emerald-400">Zero AI service errors reported in the last 24 hours.</p>
          ) : (
            failures.map((f: any) => (
              <div key={f.id} className="p-3.5 flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-red-400">{f.reason}</div>
                  <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                    Type: {f.requestType} • Game: {f.gameId} • Duration: {f.durationMs}ms
                  </div>
                </div>
                <span className="text-[11px] text-[var(--color-text-secondary)] whitespace-nowrap">
                  {new Date(f.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
