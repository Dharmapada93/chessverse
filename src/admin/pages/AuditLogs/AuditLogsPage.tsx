"use client";

import React, { useState, useEffect } from "react";
import { DataTable, type Column } from "../../components";
import { fetchAdminAuditLogs, downloadCsvExport } from "../../services/audit";
import type { AdminAuditLog } from "../../services/types";

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [targetType, setTargetType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminAuditLogs({ targetType, page, limit: 20 });
      if (data.success) {
        setLogs(data.logs);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, targetType]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadCsvExport("audit-logs");
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const columns: Column<AdminAuditLog>[] = [
    {
      key: "action",
      header: "Action",
      render: (l) => (
        <span className="font-semibold text-xs text-[var(--color-primary)] font-mono">
          {l.action}
        </span>
      ),
    },
    {
      key: "adminUsername",
      header: "Actor",
      render: (l) => <span className="font-medium text-xs text-[var(--color-text)]">{l.adminUsername}</span>,
    },
    {
      key: "target",
      header: "Target",
      render: (l) => (
        <span className="text-xs text-[var(--color-text-secondary)]">
          <strong className="text-[var(--color-text)] capitalize">{l.targetType}</strong>
          {l.targetName ? `: ${l.targetName}` : l.targetId ? ` #${l.targetId.slice(-6)}` : ""}
        </span>
      ),
    },
    {
      key: "reason",
      header: "Reason / Notes",
      render: (l) => (
        <span className="text-xs text-[var(--color-text-secondary)] line-clamp-1 max-w-xs">
          {l.reason || "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Timestamp",
      render: (l) => (
        <span className="text-xs font-mono text-[var(--color-text-secondary)]">
          {new Date(l.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: "ip",
      header: "IP",
      render: (l) => (
        <span className="text-[11px] font-mono text-[var(--color-text-secondary)]">
          {l.ip || "127.0.0.1"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
            Immutable Administrative Audit Trail
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Cryptographically accounted log of all moderator and admin operations. Records cannot be edited or deleted.
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
        >
          <span>📥</span> {isExporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Target Type Filter Tabs */}
      <div className="flex items-center gap-1.5 text-xs">
        {["all", "user", "game", "report", "announcement", "system", "auth"].map((t) => (
          <button
            key={t}
            onClick={() => {
              setTargetType(t);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-[var(--radius-md)] capitalize font-medium transition-colors ${
              targetType === t
                ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-semibold border border-[var(--color-primary)]/30"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-transparent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={logs}
        keyExtractor={(l) => l._id}
        isLoading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        onPageChange={setPage}
        renderMobileCard={(l) => (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-[var(--color-primary)]">
                {l.action}
              </span>
              <span className="text-[10px] text-[var(--color-text-secondary)]">
                {new Date(l.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-xs text-[var(--color-text)]">
              By: <strong>{l.adminUsername}</strong> → {l.targetType} {l.targetName ? `(${l.targetName})` : ""}
            </div>
            {l.reason && (
              <p className="text-[11px] text-[var(--color-text-secondary)]">{l.reason}</p>
            )}
          </div>
        )}
      />
    </div>
  );
};
