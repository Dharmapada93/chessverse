"use client";

import { useState } from "react";
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

type ReportCategory =
  | "Cheating"
  | "Harassment"
  | "Spam"
  | "Inappropriate content"
  | "Abusive behavior"
  | "Other";

const CATEGORIES: { id: ReportCategory; label: string; desc: string }[] = [
  { id: "Cheating", label: "Cheating", desc: "Suspected computer engine assistance or manipulation" },
  { id: "Harassment", label: "Harassment", desc: "Bullying, personal attacks, or persistent unwelcome contact" },
  { id: "Spam", label: "Spam", desc: "Flooding chat or repetitive unsolicited messaging" },
  { id: "Inappropriate content", label: "Inappropriate content", desc: "Offensive language, profile imagery, or conduct" },
  { id: "Abusive behavior", label: "Abusive behavior", desc: "Excessive stalling, sandbagging, or toxicity" },
  { id: "Other", label: "Other", desc: "Any other behavior violating community guidelines" },
];

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUsername: string;
  gameId?: string;
};

export default function ReportModal({
  isOpen,
  onClose,
  reportedUserId,
  reportedUsername,
  gameId,
}: ReportModalProps) {
  const [category, setCategory] = useState<ReportCategory>("Cheating");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await apiFetch("/api/reports", {
        method: "POST",
        body: JSON.stringify({
          reportedUserId,
          category,
          description,
          gameId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit report.");
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setDescription("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to send report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18352B]/40 dark:bg-[#0E1713]/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-[20px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-6 shadow-2xl text-[#18221E] dark:text-[#F4EFE3]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-white/10 pb-4">
          <div className="flex items-center gap-2 text-[#A94B45]">
            <ShieldAlert size={20} />
            <h3 className="font-serif font-bold text-[#18352B] dark:text-[#F4EFE3]">Report Player</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#69736C] dark:text-[#B5BDB5] hover:bg-[rgba(24,34,30,0.06)] hover:text-[#18352B] dark:hover:text-[#F4EFE3] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#27815D]/15 text-[#27815D]">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="mt-3 text-base font-serif font-bold text-[#18352B] dark:text-[#F4EFE3]">Report Submitted</h4>
            <p className="mt-1 text-xs text-[#69736C] dark:text-[#B5BDB5]">
              Thank you for keeping ChessVerse fair. Our team will review this confidentially.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <p className="text-xs text-[#69736C] dark:text-[#B5BDB5]">
                Reporting player <span className="font-semibold text-[#18221E] dark:text-[#F4EFE3]">@{reportedUsername}</span>
              </p>
              <p className="mt-1 text-sm font-serif font-bold text-[#18352B] dark:text-[#F4EFE3]">
                Why are you reporting this player?
              </p>
            </div>

            {/* Category Options */}
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-[12px] border p-2.5 transition ${
                    category === cat.id
                      ? "border-[#B58A3A] bg-[#B58A3A]/10 text-[#18221E] dark:text-[#F4EFE3]"
                      : "border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#69736C] dark:text-[#B5BDB5] hover:bg-[#FAF8F2] dark:hover:bg-[#23372F]"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportCategory"
                    value={cat.id}
                    checked={category === cat.id}
                    onChange={() => setCategory(cat.id)}
                    className="mt-0.5 accent-[#B58A3A]"
                  />
                  <div>
                    <span className="block text-xs font-semibold">{cat.label}</span>
                    <span className="block text-[11px] text-[#69736C] dark:text-[#B5BDB5]">{cat.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-xs font-medium text-[#69736C] dark:text-[#B5BDB5] mb-1">
                Additional details (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Describe what occurred during the game or in chat..."
                className="w-full rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-3 py-2 text-xs text-[#18221E] dark:text-[#F4EFE3] placeholder-[#69736C] outline-none focus:border-[#B58A3A] resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-[#A94B45]/10 border border-[#A94B45]/20 p-2 text-xs text-[#A94B45]">
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] px-4 py-2 text-xs font-medium text-[#18221E] dark:text-[#F4EFE3] hover:bg-[#FAF8F2] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-[12px] bg-[#A94B45] hover:bg-[#913B35] px-5 py-2 text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
