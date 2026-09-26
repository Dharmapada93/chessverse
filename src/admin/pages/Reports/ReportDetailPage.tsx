"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchAdminReportDetails, addReportNote, applyReportAction } from "../../services/reports";
import { ConfirmDialog } from "../../components";
import type { ReportDetailsResponse } from "../../services/reports";

export const ReportDetailPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<ReportDetailsResponse | null>(null);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Action dialog
  const [pendingAction, setPendingAction] = useState<"warn" | "suspend" | "ban" | "dismiss" | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await fetchAdminReportDetails(id);
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

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsAddingNote(true);
    try {
      await addReportNote(id, newNote);
      setNewNote("");
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleApplyAction = async () => {
    if (!pendingAction) return;
    setIsActionLoading(true);
    try {
      await applyReportAction(id, pendingAction, actionNotes);
      setPendingAction(null);
      setActionNotes("");
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-sm text-[var(--color-text-secondary)]">
        <span className="inline-block animate-spin mr-2">◌</span>
        Loading report investigation details...
      </div>
    );
  }

  if (!data?.report) {
    return <div className="p-8 text-center text-sm text-[var(--color-text-secondary)]">Report not found.</div>;
  }

  const { report, priorReports } = data;

  return (
    <div className="space-y-6">
      {/* Top Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/reports"
            className="p-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-xs text-[var(--color-text-secondary)]"
          >
            ← Reports
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
              <span>Report #{report._id.slice(-6).toUpperCase()}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${
                  report.status === "open" ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"
                }`}
              >
                {report.status}
              </span>
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Category: <strong className="text-[var(--color-text)]">{report.category}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons (R6.31) */}
        {report.status !== "resolved" && report.status !== "dismissed" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPendingAction("dismiss")}
              className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
            >
              Dismiss
            </button>
            <button
              onClick={() => setPendingAction("warn")}
              className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
            >
              Issue Warning
            </button>
            <button
              onClick={() => setPendingAction("suspend")}
              className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
            >
              Suspend User
            </button>
            <button
              onClick={() => setPendingAction("ban")}
              className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] bg-red-600 text-white hover:bg-red-700"
            >
              Ban User
            </button>
          </div>
        )}
      </div>

      {/* Info Cards Grid (R6.28) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] uppercase font-semibold">Reported User</span>
          <div className="text-base font-bold text-[var(--color-text)] mt-1">
            {report.reportedUserId?.username || "Unknown"}
          </div>
          <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Rating: {report.reportedUserId?.rating || "1200"} • Status: {report.reportedUserId?.accountStatus || "ACTIVE"}
          </div>
          {report.reportedUserId?._id && (
            <Link
              href={`/admin/users/${report.reportedUserId._id}`}
              className="text-xs text-[var(--color-primary)] font-medium inline-block mt-2 hover:underline"
            >
              View User Profile →
            </Link>
          )}
        </div>

        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] uppercase font-semibold">Reporter</span>
          <div className="text-base font-bold text-[var(--color-text)] mt-1">
            {report.reporterId?.username || "Anonymous"}
          </div>
          <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {report.reporterId?.email || "No email on record"}
          </div>
        </div>

        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] uppercase font-semibold">Associated Game</span>
          <div className="text-base font-bold text-[var(--color-text)] mt-1">
            {report.gameId ? `Game #${(report.gameId as any)._id?.slice(-6).toUpperCase()}` : "None"}
          </div>
          {report.gameId && (
            <Link
              href={`/admin/games/${(report.gameId as any)._id}`}
              className="text-xs text-[var(--color-primary)] font-medium inline-block mt-2 hover:underline"
            >
              Inspect Game Telemetry →
            </Link>
          )}
        </div>
      </div>

      {/* Description & Prior Violations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Report Description</h3>
          <p className="text-xs md:text-sm text-[var(--color-text-secondary)] leading-relaxed p-3 rounded bg-[var(--color-bg)] border border-[var(--color-border)]">
            {report.description || "No written description was attached by the reporter."}
          </p>
          <div className="text-[11px] text-[var(--color-text-secondary)]">
            Reported on: {new Date(report.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Prior Reports Against User</h3>
          <div className="divide-y divide-[var(--color-border)] text-xs">
            {priorReports.length === 0 ? (
              <p className="text-emerald-400 py-2">No prior violations reported.</p>
            ) : (
              priorReports.map((p) => (
                <div key={p._id} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-red-400">{p.category}</span>
                    <span className="text-[11px] text-[var(--color-text-secondary)] ml-2">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-[var(--color-text-secondary)]">
                    {p.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Internal Moderation Notes (R6.30) */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Internal Moderation Notes</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Visible only to authorized administrators and moderators.
            </p>
          </div>
          <span className="text-xs text-[var(--color-text-secondary)]">{report.notes?.length || 0} notes</span>
        </div>

        <div className="space-y-3">
          {(!report.notes || report.notes.length === 0) ? (
            <p className="text-xs text-[var(--color-text-secondary)]">No internal notes added yet.</p>
          ) : (
            report.notes.map((n, i) => (
              <div key={i} className="p-3 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-[var(--color-text)]">
                  <span>{n.authorName}</span>
                  <span className="text-[10px] text-[var(--color-text-secondary)] font-normal">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-[var(--color-text-secondary)]">{n.note}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Add internal investigation note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
          />
          <button
            type="submit"
            disabled={!newNote.trim() || isAddingNote}
            className="px-4 py-2 text-xs font-semibold rounded-[var(--radius-md)] bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
          >
            {isAddingNote ? "Adding..." : "Add Note"}
          </button>
        </form>
      </div>

      <ConfirmDialog
        isOpen={pendingAction !== null}
        title={`Apply Action: ${pendingAction?.toUpperCase()}`}
        message={`Are you sure you want to perform "${pendingAction}" on report #${report._id}? This will be recorded in the immutable audit log.`}
        confirmLabel="Confirm Action"
        isDangerous={pendingAction === "ban" || pendingAction === "suspend"}
        onConfirm={handleApplyAction}
        onCancel={() => setPendingAction(null)}
        isLoading={isActionLoading}
      />
    </div>
  );
};
