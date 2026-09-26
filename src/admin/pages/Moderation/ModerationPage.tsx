"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchFairPlayReviews, applyFairPlayAction } from "../../services/moderation";
import { ConfirmDialog } from "../../components";

export const ModerationPage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [status, setStatus] = useState("needs_review");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [actionType, setActionType] = useState<"restrict" | "clear" | "warn" | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFairPlayReviews(status);
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [status]);

  const handleActionConfirm = async () => {
    if (!selectedReview || !actionType) return;
    setIsSubmitting(true);
    try {
      await applyFairPlayAction(selectedReview._id, actionType, notes);
      setActionType(null);
      setSelectedReview(null);
      setNotes("");
      loadReviews();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
            Fair Play & Automated Anti-Cheat Desk
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Engine correlation telemetry, timing anomaly reviews, and fair play actions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {["needs_review", "restricted", "warning", "cleared", "all"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-[var(--radius-md)] capitalize font-medium transition-colors ${
                status === s
                  ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-semibold border border-[var(--color-primary)]/30"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-transparent"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-sm text-[var(--color-text-secondary)]">
          <span className="inline-block animate-spin mr-2">◌</span>
          Loading fair play telemetry reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] text-center text-sm text-[var(--color-text-secondary)]">
          No flagged accounts. All player records under &quot;{status}&quot; are in good standing.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 hover:border-[var(--color-primary)]/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
                    <span>{r.username}</span>
                    <span className="text-xs font-mono text-[var(--color-text-secondary)] font-normal">
                      ({r.userRating} ELO)
                    </span>
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Flagged on {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      r.riskScore >= 75
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : r.riskScore >= 40
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    Risk Score: {r.riskScore}/100
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-center">
                <div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] uppercase">Agreement</div>
                  <div className="font-bold text-[var(--color-text)]">{r.engineAgreementPct}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] uppercase">Correlation</div>
                  <div className="font-bold text-[var(--color-text)]">{r.engineCorrelation}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] uppercase">Timing Anomaly</div>
                  <div className="font-bold text-[var(--color-text)]">{r.timingAnomaly}</div>
                </div>
              </div>

              {r.moderatorNotes && (
                <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg)]/50 p-2.5 rounded border border-[var(--color-border)]/50">
                  {r.moderatorNotes}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                {r.gameId && (
                  <Link
                    href={`/admin/games/${r.gameId}`}
                    className="text-xs text-[var(--color-primary)] font-medium hover:underline"
                  >
                    Inspect Game Moves →
                  </Link>
                )}
                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    onClick={() => {
                      setSelectedReview(r);
                      setActionType("clear");
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      setSelectedReview(r);
                      setActionType("warn");
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                  >
                    Warn
                  </button>
                  <button
                    onClick={() => {
                      setSelectedReview(r);
                      setActionType("restrict");
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Restrict
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={actionType !== null}
        title={`Fair Play Action: ${actionType?.toUpperCase()}`}
        message={`Confirming will apply "${actionType}" to user ${selectedReview?.username}. This action is recorded in the permanent audit trail.`}
        confirmLabel="Confirm Action"
        isDangerous={actionType === "restrict"}
        onConfirm={handleActionConfirm}
        onCancel={() => setActionType(null)}
        isLoading={isSubmitting}
      />
    </div>
  );
};
