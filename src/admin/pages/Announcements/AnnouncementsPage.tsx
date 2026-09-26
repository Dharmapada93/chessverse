"use client";

import React, { useState, useEffect } from "react";
import {
  fetchAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../services/announcements";
import { AdminModal, ConfirmDialog } from "../../components";
import type { AdminAnnouncement } from "../../services/types";

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"info" | "warning" | "success" | "critical">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog
  const [selectedDelete, setSelectedDelete] = useState<AdminAnnouncement | null>(null);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminAnnouncements();
      if (data.success) {
        setAnnouncements(data.announcements);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setIsSubmitting(true);
    try {
      await createAnnouncement({ title, message, severity });
      setIsModalOpen(false);
      setTitle("");
      setMessage("");
      loadAnnouncements();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (ann: AdminAnnouncement) => {
    try {
      await updateAnnouncement(ann._id, { isActive: !ann.isActive });
      loadAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDelete) return;
    try {
      await deleteAnnouncement(selectedDelete._id);
      setSelectedDelete(null);
      loadAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
            System Announcements & Player Broadcasts
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Publish maintenance windows, feature updates, and notices to player interfaces.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-[var(--radius-md)] bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)] transition-colors self-start sm:self-auto"
        >
          + New Announcement
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-sm text-[var(--color-text-secondary)]">
          <span className="inline-block animate-spin mr-2">◌</span>
          Loading announcements...
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-12 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] text-center text-sm text-[var(--color-text-secondary)]">
          No announcements published yet.
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className={`p-4 md:p-5 rounded-[var(--radius-lg)] border bg-[var(--color-surface)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                ann.isActive ? "border-[var(--color-border)]" : "border-[var(--color-border)] opacity-60"
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ann.severity === "critical"
                        ? "bg-red-500/20 text-red-400"
                        : ann.severity === "warning"
                        ? "bg-amber-500/20 text-amber-400"
                        : ann.severity === "success"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {ann.severity}
                  </span>
                  <h3 className="font-bold text-sm text-[var(--color-text)]">{ann.title}</h3>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      ann.isActive ? "text-[#27815D] bg-[#27815D]/10" : "text-[var(--color-text-secondary)] bg-[#EDE9DE] dark:bg-[#18352B]"
                    }`}
                  >
                    {ann.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {ann.message}
                </p>
                <div className="text-[11px] text-[var(--color-text-secondary)]">
                  Created: {new Date(ann.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => handleToggleActive(ann)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] border ${
                    ann.isActive
                      ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                      : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  }`}
                >
                  {ann.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => setSelectedDelete(ann)}
                  className="px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] border border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal (R6.40) */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish System Announcement"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-medium rounded-[var(--radius-md)] border border-[var(--color-border)]"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSubmit}
              disabled={!title.trim() || !message.trim() || isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
            >
              {isSubmitting ? "Publishing..." : "Publish Broadcast"}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[var(--color-text)] mb-1">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Real-Time Spectator Improvements"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--color-text)] mb-1">
              Severity
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["info", "warning", "success", "critical"] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`py-1.5 rounded-[var(--radius-sm)] border text-center font-semibold capitalize ${
                    severity === sev
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                      : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-[var(--color-text)] mb-1">
              Announcement Message
            </label>
            <textarea
              rows={4}
              placeholder="Enter the broadcast message visible to players..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </form>
      </AdminModal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={selectedDelete !== null}
        title="Delete Announcement"
        message={`Are you sure you want to permanently delete "${selectedDelete?.title}"?`}
        confirmLabel="Delete"
        isDangerous={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSelectedDelete(null)}
      />
    </div>
  );
};
