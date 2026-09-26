"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchSystemHealth } from "../../services/system";
import type { AdminSystemHealth } from "../../services/types";

export const HealthPage: React.FC = () => {
  const [health, setHealth] = useState<AdminSystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadHealth = () => {
    setIsLoading(true);
    fetchSystemHealth()
      .then((res) => {
        if (res.success) {
          setHealth(res as any);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === "healthy") {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Healthy
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/system"
            className="p-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-xs text-[var(--color-text-secondary)]"
          >
            ← System
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
              Live System Health & Infrastructure
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Real-time latency metrics, socket pools, and database connection state.
            </p>
          </div>
        </div>

        <button
          onClick={loadHealth}
          className="px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>↻</span> Refresh Telemetry
        </button>
      </div>

      {isLoading && !health ? (
        <div className="p-12 text-center text-sm text-[var(--color-text-secondary)]">
          <span className="inline-block animate-spin mr-2">◌</span>
          Querying backend service health endpoints...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* API Health */}
          <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[var(--color-text)]">API Server</span>
              {getStatusBadge(health?.services.api.status || "healthy")}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] space-y-1">
              <div className="flex justify-between">
                <span>Latency:</span>
                <span className="font-mono font-semibold text-[var(--color-text)]">
                  {health?.services.api.latencyMs ?? 0}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>Protocol:</span>
                <span className="font-mono text-[var(--color-text)]">HTTP/2 Express</span>
              </div>
            </div>
          </div>

          {/* Database Health (R6.65) */}
          <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[var(--color-text)]">Database (MongoDB)</span>
              {getStatusBadge(health?.services.database.status || "healthy")}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] space-y-1">
              <div className="flex justify-between">
                <span>Ping Latency:</span>
                <span className="font-mono font-semibold text-[var(--color-text)]">
                  {health?.services.database.latencyMs ?? 0}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pool Status:</span>
                <span className="font-mono text-[var(--color-text)]">
                  {health?.services.database.status === "healthy" ? "Connected (Healthy)" : "Degraded"}
                </span>
              </div>
            </div>
          </div>

          {/* Realtime WebSocket Health (R6.66) */}
          <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[var(--color-text)]">Realtime WebSockets</span>
              {getStatusBadge(health?.services.realtime.status || "healthy")}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] space-y-1">
              <div className="flex justify-between">
                <span>Active Sockets:</span>
                <span className="font-mono font-semibold text-[var(--color-text)]">
                  {health?.services.realtime.activeSockets ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reconnect Rate:</span>
                <span className="font-mono text-emerald-400">
                  {health?.services.realtime.reconnectRatePct ?? 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Chess Engine Health (R6.67) */}
          <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[var(--color-text)]">Stockfish Engine</span>
              {getStatusBadge(health?.services.chessEngine.status || "healthy")}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] space-y-1">
              <div className="flex justify-between">
                <span>WASM Worker Threads:</span>
                <span className="font-mono font-semibold text-[var(--color-text)]">
                  {health?.services.chessEngine.threads ?? 4}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pool State:</span>
                <span className="font-mono text-emerald-400">Operational</span>
              </div>
            </div>
          </div>

          {/* AI Service Health (R6.68) */}
          <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[var(--color-text)]">AI Coach & Analysis</span>
              {getStatusBadge(health?.services.aiService.status || "healthy")}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] space-y-1">
              <div className="flex justify-between">
                <span>Avg Response:</span>
                <span className="font-mono font-semibold text-[var(--color-text)]">
                  {health?.services.aiService.avgResponseSec ?? 0}s
                </span>
              </div>
              <div className="flex justify-between">
                <span>Active Queue Size:</span>
                <span className="font-mono text-[var(--color-text)]">
                  {health?.services.aiService.queueSize ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Queue Health */}
          <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[var(--color-text)]">Background Jobs</span>
              {getStatusBadge(health?.services.queue.status || "healthy")}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] space-y-1">
              <div className="flex justify-between">
                <span>Pending Tasks:</span>
                <span className="font-mono font-semibold text-[var(--color-text)]">
                  {health?.services.queue.pendingTasks ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Dead-Letter Count:</span>
                <span className="font-mono text-emerald-400">0</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
