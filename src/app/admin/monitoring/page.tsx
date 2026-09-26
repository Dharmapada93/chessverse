"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface MetricsPayload {
  timestamp: string;
  production: {
    usersOnline: number;
    activeGames: number;
    spectators: number;
  };
  api: {
    requestsPerMin: number;
    p95LatencyMs: number;
    errorRatePct: number;
  };
  websocket: {
    activeConnections: number;
    reconnectRatePct: number;
    messagesPerSec: number;
  };
  database: {
    status: string;
    p95QueryMs: number;
    poolUsagePct: number;
  };
  redis: {
    status: string;
    hitRatePct: number;
    memoryUsageMb: number;
  };
  ai: {
    analysisQueue: number;
    avgAnalysisSec: number;
    status: string;
  };
  systemStatus: {
    api: string;
    database: string;
    redis: string;
    websocket: string;
    stockfish: string;
    ai: string;
  };
  alerts: Array<{
    id: string;
    level: "info" | "warning" | "error";
    message: string;
    time: string;
  }>;
}

export default function ProductionMonitoringPage() {
  const [metrics, setMetrics] = useState<MetricsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    fetchMetrics();
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  async function fetchMetrics() {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = typeof window !== "undefined" ? localStorage.getItem("chessverse-token") : null;

      const res = await fetch(`${apiUrl}/api/admin/metrics`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && data.production) {
        setMetrics(data);
      } else {
        // Zero mock statistics (R13.43) - display real state only
        setMetrics(null);
      }
      setLastRefreshed(new Date());
    } catch {
      // Offline / error state
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200"
          >
            CHESSVERSE
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Production Monitor
          </span>
          <span className="text-sm text-slate-400">Live Health & Telemetry</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">
              Updated: {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>

          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span>Auto-refresh (5s)</span>
          </label>

          <Link
            href="/admin/fair-play"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            Fair-Play Queue
          </Link>

          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Back to App
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              ChessVerse Production Telemetry
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              End-to-end system telemetry: real-time WebSocket load, API throughput, Redis hit rates, and AI analysis queue.
            </p>
          </div>

          <button
            onClick={() => fetchMetrics()}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition flex items-center gap-2"
          >
            Refresh Now
          </button>
        </div>

        {!metrics && !loading && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center font-bold">
              !
            </div>
            <h3 className="text-base font-bold text-white">Live Telemetry Unavailable</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Unable to reach backend telemetry endpoint. Ensure the ChessVerse API is running and your administrative session is active.
            </p>
            <button
              onClick={() => fetchMetrics()}
              className="mt-2 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Top 3 Core Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center justify-between">
                <span>Users Online</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white mt-2 font-mono">
                {metrics.production.usersOnline.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Active authenticated sessions across devices
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center justify-between">
                <span>Active Games</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-300 mt-2 font-mono">
                {metrics.production.activeGames.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Live board rooms with server-authoritative clocks
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center justify-between">
                <span>Spectators</span>
                <span className="w-2 h-2 rounded-full bg-sky-400" />
              </div>
              <div className="text-3xl font-black text-sky-300 mt-2 font-mono">
                {metrics.production.spectators.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Watch stream subscribers with strict read-only scope
              </div>
            </div>
          </div>
        )}

        {/* Detailed Grid */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* API Performance */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                API Performance
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Throughput</span>
                  <span className="font-mono text-white">{metrics.api.requestsPerMin.toLocaleString()} req/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">p95 Latency</span>
                  <span className="font-mono text-emerald-400">{metrics.api.p95LatencyMs}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Error Rate</span>
                  <span className="font-mono text-emerald-400">{metrics.api.errorRatePct}%</span>
                </div>
              </div>
            </div>

            {/* WebSocket Traffic */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                WebSocket Engine
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Connections</span>
                  <span className="font-mono text-white">{metrics.websocket.activeConnections.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reconnect Rate</span>
                  <span className="font-mono text-emerald-400">{metrics.websocket.reconnectRatePct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Messages/sec</span>
                  <span className="font-mono text-white">{metrics.websocket.messagesPerSec}/s</span>
                </div>
              </div>
            </div>

            {/* Storage & Caching */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                Database & Cache
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">DB p95 Query</span>
                  <span className="font-mono text-emerald-400">{metrics.database.p95QueryMs}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Redis Hit Rate</span>
                  <span className="font-mono text-emerald-400">{metrics.redis.hitRatePct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cache Memory</span>
                  <span className="font-mono text-white">{metrics.redis.memoryUsageMb} MB</span>
                </div>
              </div>
            </div>

            {/* AI Engine */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                Stockfish & AI Coach
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Analysis Queue</span>
                  <span className="font-mono text-white">{metrics.ai.analysisQueue} jobs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Calculation</span>
                  <span className="font-mono text-emerald-400">{metrics.ai.avgAnalysisSec}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Engine Workers</span>
                  <span className="font-mono text-purple-300">WASM 18 (4 Threads)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Health Checklist & Alerts */}
        {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Health Checklist (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                Component Health Verification
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { name: "API Gateway", status: metrics.systemStatus.api },
                  { name: "Database (MongoDB Atlas)", status: metrics.systemStatus.database },
                  { name: "Redis Caching Layer", status: metrics.systemStatus.redis },
                  { name: "WebSocket Cluster", status: metrics.systemStatus.websocket },
                  { name: "Stockfish 18 Engine", status: metrics.systemStatus.stockfish },
                  { name: "AI Coach & Analytics", status: metrics.systemStatus.ai },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-850">
                    <span className="text-slate-300 font-medium">{item.name}</span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts Feed (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>System Event & Operational Alerts</span>
                <span className="text-[10px] text-slate-500 font-normal">Actionable logs</span>
              </div>

              <div className="space-y-2.5">
                {metrics.alerts.map((alt) => (
                  <div key={alt.id} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                    <div className="p-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs shrink-0">
                      ℹ
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="text-slate-200 font-medium">{alt.message}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {new Date(alt.time).toLocaleTimeString()} • ID: {alt.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
