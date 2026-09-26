import React from "react";
import Badge from "@/components/ui/Badge";

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  details?: string;
}

export interface AuditLogProps {
  entries: AuditLogEntry[];
  className?: string;
}

export default function AuditLog({ entries, className = "" }: AuditLogProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs ${className}`}
    >
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">
        Recent Moderation Activity
      </h3>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)]">
            No moderation actions recorded.
          </p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start justify-between gap-3 text-xs border-b border-[var(--color-border-subtle)] pb-2.5 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium text-[var(--color-text)]">
                  <span className="font-semibold text-purple-300">{entry.actor}</span>{" "}
                  performed <span className="font-semibold">{entry.action}</span> on{" "}
                  <span className="font-semibold text-[var(--color-primary)]">{entry.target}</span>
                </p>
                {entry.details && (
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    {entry.details}
                  </p>
                )}
              </div>

              <span className="text-[10px] text-[var(--color-text-muted)] font-mono shrink-0">
                {entry.timestamp}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
