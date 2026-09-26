"use client";

import React, { useState } from "react";
import { ShieldAlert, UserMinus, Flag, X, Loader2 } from "lucide-react";
import type { SocialActionsProps } from "./types";

const REPORT_REASONS = [
  "Spam",
  "Harassment",
  "Abusive behavior",
  "Cheating concern",
  "Other",
];

export function SocialActions({
  modalType,
  targetUsername,
  targetUserId,
  gameId,
  onClose,
  onConfirmBlock,
  onConfirmRemove,
  onConfirmReport,
}: SocialActionsProps) {
  const [loading, setLoading] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDescription, setReportDescription] = useState("");

  if (!modalType) return null;

  async function handleBlock() {
    setLoading(true);
    try {
      await onConfirmBlock?.(targetUserId);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    setLoading(true);
    try {
      await onConfirmRemove?.(targetUserId);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirmReport?.({
        reportedUserId: targetUserId,
        category: reportReason,
        description: reportDescription,
        gameId,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18352B]/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-[20px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[var(--color-border)] shadow-2xl p-5 overflow-hidden text-[var(--color-text)]">
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 p-1 rounded-[8px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[#EDE9DE] dark:hover:bg-[#18352B] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Block Modal */}
        {modalType === "block" && (
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-[12px] bg-[#A94B45]/10 flex items-center justify-center text-[#A94B45] mx-auto">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-serif font-bold text-[var(--color-text)]">Block {targetUsername}?</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2 text-left leading-relaxed">
                They won&apos;t be able to:
                <br />• Send you friend requests
                <br />• Invite you to games
                <br />• Message you directly
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-[12px] bg-[#EDE9DE] dark:bg-[#18352B] hover:bg-[#E3DDD0] dark:hover:bg-[#283E34] text-xs font-semibold text-[var(--color-text)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBlock}
                disabled={loading}
                className="flex-1 py-2 rounded-[12px] bg-[#A94B45] hover:bg-[#8F3E39] text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Block Player</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. Remove Friend Modal */}
        {modalType === "remove" && (
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-[12px] bg-[#EDE9DE] dark:bg-[#18352B] flex items-center justify-center text-[#B58A3A] mx-auto">
              <UserMinus className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-serif font-bold text-[var(--color-text)]">Remove {targetUsername}?</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Are you sure you want to remove {targetUsername} from your friends list?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-[12px] bg-[#EDE9DE] dark:bg-[#18352B] hover:bg-[#E3DDD0] dark:hover:bg-[#283E34] text-xs font-semibold text-[var(--color-text)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className="flex-1 py-2 rounded-[12px] bg-[#A94B45] hover:bg-[#8F3E39] text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Remove</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Report Modal */}
        {modalType === "report" && (
          <form onSubmit={handleReport} className="space-y-4">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-[#B58A3A]" />
              <h3 className="text-sm font-serif font-bold text-[var(--color-text)]">Report {targetUsername}</h3>
            </div>

            <div>
              <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-[12px] bg-[#F7F4EC] dark:bg-[#13201B] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[#B58A3A]"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={3}
                placeholder="Describe what occurred..."
                className="w-full px-2.5 py-1.5 rounded-[12px] bg-[#F7F4EC] dark:bg-[#13201B] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[#B58A3A] resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-[12px] bg-[#EDE9DE] dark:bg-[#18352B] hover:bg-[#E3DDD0] dark:hover:bg-[#283E34] text-xs font-semibold text-[var(--color-text)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:text-[#18221E] text-xs font-semibold text-[#FBF9F3] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Submit Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default SocialActions;
