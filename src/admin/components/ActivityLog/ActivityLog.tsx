"use client";

import React from "react";
import type { AdminAuditLog } from "../../services/types";

interface ActivityLogProps {
  logs: AdminAuditLog[];
  isLoading?: boolean;
}

function formatRelativeTime(dateString: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return `${Math.max(1, diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return dateString;
  }
}

function getActionColor(action: string): string {
  if (action.includes("suspend") || action.includes("ban") || action.includes("delete") || action.includes("terminate")) {
    return "text-red-400 bg-red-500/10 border-red-500/20";
  }
  if (action.includes("unsuspend") || action.includes("unban") || action.includes("resolve")) {
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  }
  return "text-[var(--color-primary)] bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20";
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="p-6 text-center text-xs text-[var(--color-text-secondary)]">
        <span className="inline-block animate-spin mr-2">◌</span>
        Loading recent activities...
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-[var(--color-text-secondary)]">
        No administrative actions recorded yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--color-border)]">
      {logs.map((log) => (
        <div key={log._id} className="p-3.5 flex items-start justify-between gap-3 text-xs hover:bg-[var(--color-surface-hover)] transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getActionColor(log.action)}`}>
                {log.action}
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {log.adminUsername}
              </span>
              {log.targetName && (
                <span className="text-[var(--color-text-secondary)]">
                  → <span className="font-medium text-[var(--color-text)]">{log.targetName}</span>
                </span>
              )}
            </div>
            {log.reason && (
              <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-1">
                {log.reason}
              </p>
            )}
          </div>
          <span className="text-[11px] text-[var(--color-text-secondary)] whitespace-nowrap">
            {formatRelativeTime(log.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
};
