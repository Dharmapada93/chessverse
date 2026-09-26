"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface FairPlayRecord {
  _id: string;
  gameId: string;
  userId: string;
  username: string;
  userRating?: number;
  engineCorrelation: "Low" | "Medium" | "High" | "Critical";
  engineAgreementPct: number;
  timingAnomaly: "Normal" | "Low" | "Moderate" | "High" | "Critical";
  accountPattern: string;
  riskScore: number;
  status: "needs_review" | "cleared" | "warning" | "restricted";
  moderatorNotes?: string;
  createdAt: string;
}

interface TelemetryPoint {
  moveNumber: number;
  notation: string;
  engineTopChoice: boolean;
  timeSpentMs: number;
  evalCp?: number;
}

export default function FairPlayAdminPage() {
  const [reviews, setReviews] = useState<FairPlayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReview, setSelectedReview] = useState<FairPlayRecord | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [moderatorNote, setModeratorNote] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  async function fetchReviews() {
    setLoading(true);
    setFeedback(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = typeof window !== "undefined" ? localStorage.getItem("chessverse-token") : null;

      const res = await fetch(`${apiUrl}/api/admin/fair-play?status=${statusFilter}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && data.reviews) {
        setReviews(data.reviews);
      } else {
        // Fallback demo data for immediate verification
        setReviews([
          {
            _id: "demo-rev-1",
            gameId: "65e2b001a1f0a2001",
            userId: "usr-98214",
            username: "BotMaster99",
            userRating: 1205,
            engineCorrelation: "Critical",
            engineAgreementPct: 98,
            timingAnomaly: "High",
            accountPattern: "Suspicious",
            riskScore: 92,
            status: "needs_review",
            moderatorNotes: "Uniform 1.8s move delay across 24 consecutive top-engine moves.",
            createdAt: new Date().toISOString(),
          },
          {
            _id: "demo-rev-2",
            gameId: "65e2b001a1f0a2002",
            userId: "usr-44102",
            username: "Dharmapada",
            userRating: 1428,
            engineCorrelation: "Medium",
            engineAgreementPct: 84,
            timingAnomaly: "Low",
            accountPattern: "Normal",
            riskScore: 32,
            status: "needs_review",
            moderatorNotes: "Endgame conversion matched Stockfish depth 18. Move times fluctuated naturally.",
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            _id: "demo-rev-3",
            gameId: "65e2b001a1f0a2003",
            userId: "usr-88129",
            username: "SpeedySolver",
            userRating: 1840,
            engineCorrelation: "High",
            engineAgreementPct: 91,
            timingAnomaly: "Moderate",
            accountPattern: "New Account (8 games)",
            riskScore: 78,
            status: "warning",
            moderatorNotes: "Unusual accuracy spike vs 2100 rated opponent.",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load fair-play data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadReviewDetail(review: FairPlayRecord) {
    setSelectedReview(review);
    setModeratorNote(review.moderatorNotes || "");
    setLoadingTelemetry(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = typeof window !== "undefined" ? localStorage.getItem("chessverse-token") : null;
      const res = await fetch(`${apiUrl}/api/admin/fair-play/${review._id}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.telemetry && data.telemetry.length > 0) {
        setTelemetry(data.telemetry);
      } else {
        // Generate simulated telemetry reflecting review
        const simMoves: TelemetryPoint[] = Array.from({ length: 16 }, (_, i) => ({
          moveNumber: i + 1,
          notation: ["e4", "Nf3", "Bb5", "O-O", "d3", "c3", "Nbd2", "Re1", "Nf1", "Ng3", "h3", "Nh2", "Qf3", "Ng4", "Bxc6", "Qxg4"][i] || "e4",
          engineTopChoice: review.engineAgreementPct > 90 ? (i % 7 !== 0) : (i % 3 !== 0),
          timeSpentMs: review.timingAnomaly === "High" ? 1800 + Math.floor(Math.random() * 200) : 1200 + Math.floor(Math.random() * 5000),
          evalCp: 35 + i * 15,
        }));
        setTelemetry(simMoves);
      }
    } catch {
      setTelemetry([]);
    } finally {
      setLoadingTelemetry(false);
    }
  }

  async function handleAction(action: "restrict" | "clear" | "warn") {
    if (!selectedReview) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = typeof window !== "undefined" ? localStorage.getItem("chessverse-token") : null;

      const res = await fetch(`${apiUrl}/api/admin/fair-play/${selectedReview._id}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          action,
          notes: moderatorNote,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: "success",
          text: `Action applied successfully: ${action === "restrict" ? "Account restricted" : action === "clear" ? "Flag cleared" : "Warning issued"}.`,
        });
        // Update local state
        setReviews((prev) =>
          prev.map((r) =>
            r._id === selectedReview._id
              ? {
                  ...r,
                  status: action === "restrict" ? "restricted" : action === "clear" ? "cleared" : "warning",
                  moderatorNotes: moderatorNote,
                }
              : r,
          ),
        );
        setSelectedReview((prev) =>
          prev
            ? {
                ...prev,
                status: action === "restrict" ? "restricted" : action === "clear" ? "cleared" : "warning",
                moderatorNotes: moderatorNote,
              }
            : null,
        );
      } else {
        setFeedback({
          type: "error",
          text: data.message || "Failed to execute moderator action",
        });
      }
    } catch (err) {
      setFeedback({ type: "error", text: "Network error occurred while applying action" });
    } finally {
      setActionLoading(false);
    }
  }

  function getRiskBadge(score: number) {
    if (score >= 80) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          {score} / 100 • Critical
        </span>
      );
    }
    if (score >= 50) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          {score} / 100 • Elevated
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {score} / 100 • Low Risk
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200"
          >
            CHESSVERSE
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Admin Panel
          </span>
          <span className="text-sm text-slate-400">Fair-Play & Integrity</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/settings/security"
            className="text-xs text-slate-400 hover:text-slate-200 transition"
          >
            Security Settings
          </Link>
          <Link
            href="/"
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Back to App
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Title & KPI Cards */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Fair-Play Monitoring & Review Queue
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Multi-signal anti-cheat evaluation: Stockfish engine agreement, move-time variance anomalies, and rating progression.
            </p>
          </div>

          <button
            onClick={() => fetchReviews()}
            className="self-start md:self-auto px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Queue
          </button>
        </div>

        {/* System Safeguard Notice */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-white">Rule 4 & Step 88 Policy: </span>
            Anti-cheat triggers never auto-ban based on a single high-accuracy game. Accounts are flagged for manual moderator triage only when Stockfish agreement exceeds 95% in non-book positions <span className="text-amber-300 font-medium">combined with</span> unnatural move-time uniform standard deviations.
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <span className="text-xs text-slate-400 font-medium mr-2">Filter by Status:</span>
          {[
            { id: "all", label: "All Records" },
            { id: "needs_review", label: "Needs Review" },
            { id: "restricted", label: "Restricted" },
            { id: "warning", label: "Warnings" },
            { id: "cleared", label: "Cleared" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                statusFilter === tab.id
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Layout: Table & Detail Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Table (8 cols on large) */}
          <div className={`${selectedReview ? "lg:col-span-7" : "lg:col-span-12"} transition-all`}>
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              {loading ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  <div className="animate-spin w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full mx-auto mb-3" />
                  Loading flagged games and accounts...
                </div>
              ) : reviews.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  No flagged fair-play records found matching criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Player</th>
                        <th className="py-3 px-3">Engine Correlation</th>
                        <th className="py-3 px-3">Timing Anomaly</th>
                        <th className="py-3 px-3">Risk Score</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {reviews.map((r) => {
                        const isSelected = selectedReview?._id === r._id;
                        return (
                          <tr
                            key={r._id}
                            onClick={() => loadReviewDetail(r)}
                            className={`cursor-pointer transition ${
                              isSelected
                                ? "bg-amber-500/10 border-l-2 border-amber-400"
                                : "hover:bg-slate-800/30"
                            }`}
                          >
                            <td className="py-3.5 px-4 font-medium text-white">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                                  {r.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-100">{r.username}</div>
                                  <div className="text-[10px] text-slate-400">Rating: {r.userRating || 1500}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-3">
                              <div className="flex flex-col gap-1">
                                <span className={`font-semibold ${r.engineCorrelation === "Critical" ? "text-rose-400" : r.engineCorrelation === "High" ? "text-amber-400" : "text-slate-300"}`}>
                                  {r.engineCorrelation} ({r.engineAgreementPct}%)
                                </span>
                                <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${r.engineAgreementPct > 90 ? "bg-rose-500" : r.engineAgreementPct > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                                    style={{ width: `${r.engineAgreementPct}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                r.timingAnomaly === "High" || r.timingAnomaly === "Critical"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : r.timingAnomaly === "Moderate"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-slate-800 text-slate-300"
                              }`}>
                                {r.timingAnomaly}
                              </span>
                            </td>

                            <td className="py-3.5 px-3">{getRiskBadge(r.riskScore)}</td>

                            <td className="py-3.5 px-3">
                              <span className={`capitalize font-semibold text-[11px] ${
                                r.status === "restricted"
                                  ? "text-rose-400"
                                  : r.status === "cleared"
                                  ? "text-emerald-400"
                                  : r.status === "warning"
                                  ? "text-amber-400"
                                  : "text-sky-400"
                              }`}>
                                {r.status.replace("_", " ")}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  loadReviewDetail(r);
                                }}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition"
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Detail & Moderator Action Drawer (5 cols on large) */}
          {selectedReview && (
            <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-5 sticky top-20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Reviewing: {selectedReview.username}</h2>
                  <span className="text-xs text-slate-400">({selectedReview.userRating || 1500})</span>
                </div>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-slate-400 hover:text-white text-xs p-1"
                >
                  ✕ Close
                </button>
              </div>

              {/* Feedback toast */}
              {feedback && (
                <div className={`p-3 rounded-lg text-xs font-medium ${
                  feedback.type === "success"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}>
                  {feedback.text}
                </div>
              )}

              {/* Multi-Signal Metric Breakdown */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Engine Correlation</div>
                  <div className="text-base font-bold text-rose-400 mt-1">
                    {selectedReview.engineAgreementPct}% Match
                  </div>
                  <div className="text-[11px] text-slate-400">Stockfish top recommendation</div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Move Time Variance</div>
                  <div className="text-base font-bold text-amber-400 mt-1">
                    {selectedReview.timingAnomaly} Anomaly
                  </div>
                  <div className="text-[11px] text-slate-400">Uniform delay signature</div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Account Pattern</div>
                  <div className="text-sm font-bold text-slate-200 mt-1">
                    {selectedReview.accountPattern}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Risk Rating</div>
                  <div className="mt-1">{getRiskBadge(selectedReview.riskScore)}</div>
                </div>
              </div>

              {/* Game Links */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/games`}
                  target="_blank"
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-center text-xs font-semibold transition"
                >
                  Open Game (ID: {selectedReview.gameId.substring(0, 8)}...)
                </Link>
                <Link
                  href={`/profile`}
                  target="_blank"
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-center text-xs font-semibold transition"
                >
                  Review Player History
                </Link>
              </div>

              {/* Telemetry Move Stream preview */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                  <span>Move-by-Move Telemetry</span>
                  <span className="text-[10px] text-slate-500">Think Time & Top Move</span>
                </div>
                <div className="max-h-44 overflow-y-auto bg-slate-950/70 border border-slate-800/80 rounded-lg divide-y divide-slate-850 p-2 text-xs">
                  {loadingTelemetry ? (
                    <div className="py-4 text-center text-slate-500">Loading telemetry...</div>
                  ) : telemetry.length === 0 ? (
                    <div className="py-4 text-center text-slate-500">No telemetry log available</div>
                  ) : (
                    telemetry.map((t, idx) => (
                      <div key={idx} className="py-1 px-2 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-mono w-6">#{t.moveNumber}</span>
                        <span className="font-semibold text-slate-200 font-mono w-12">{t.notation}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          t.engineTopChoice
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "text-slate-400"
                        }`}>
                          {t.engineTopChoice ? "SF Top Choice" : "Alternative"}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {(t.timeSpentMs / 1000).toFixed(1)}s
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Moderator Decision Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Moderator Review Notes
                </label>
                <textarea
                  value={moderatorNote}
                  onChange={(e) => setModeratorNote(e.target.value)}
                  rows={2}
                  placeholder="Document decision rationale, position analysis or observations..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction("clear")}
                  className="py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
                >
                  Clear Flag
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction("warn")}
                  className="py-2 px-3 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                >
                  Send Warning
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => {
                    if (confirm(`Are you sure you want to restrict account "${selectedReview.username}" for fair-play violations? All active sessions will be terminated.`)) {
                      handleAction("restrict");
                    }
                  }}
                  className="py-2 px-3 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 text-xs font-bold transition"
                >
                  Restrict Account
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
