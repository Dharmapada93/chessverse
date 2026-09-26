"use client";

import React, { useState, useEffect } from "react";

interface AnnouncementItem {
  _id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "success" | "critical";
}

export const ActiveAnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<AnnouncementItem | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    fetch(`${API_URL}/api/announcements/active`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.announcements && data.announcements.length > 0) {
          const first = data.announcements[0];
          // Check if dismissed in this session
          const isDismissed = sessionStorage.getItem(`dismissed_ann_${first._id}`);
          if (!isDismissed) {
            setAnnouncement(first);
          }
        }
      })
      .catch(() => {});
  }, []);

  if (!announcement || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(`dismissed_ann_${announcement._id}`, "true");
    } catch {}
  };

  const getSeverityStyles = () => {
    switch (announcement.severity) {
      case "critical":
        return "bg-red-950/80 border-red-500/40 text-red-200";
      case "warning":
        return "bg-amber-950/80 border-amber-500/40 text-amber-200";
      case "success":
        return "bg-emerald-950/80 border-emerald-500/40 text-emerald-200";
      default:
        return "bg-[var(--color-surface)] border-[var(--color-primary)]/40 text-[var(--color-text)]";
    }
  };

  return (
    <aside
      aria-label="Platform Announcement"
      className={`w-full border-b py-2 px-4 transition-all z-40 relative flex items-center justify-between gap-4 text-xs ${getSeverityStyles()}`}
    >
      <div className="flex items-center gap-2.5 mx-auto max-w-7xl">
        <span className="text-sm">♟</span>
        <div className="flex flex-wrap items-baseline gap-1.5">
          <strong className="font-semibold">{announcement.title}:</strong>
          <span className="opacity-90">{announcement.message}</span>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className="p-1 rounded hover:bg-white/10 text-current transition-colors text-sm leading-none shrink-0"
        aria-label="Dismiss Announcement"
      >
        ✕
      </button>
    </aside>
  );
};
