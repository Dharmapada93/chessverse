"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, type Column } from "../../components";
import { fetchAdminReports } from "../../services/reports";
import type { AdminReport } from "../../services/types";

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("open");
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminReports({ status: statusFilter, page, limit: 15 });
      if (data.success) {
        setReports(data.reports);
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
    loadReports();
  }, [page, statusFilter]);

  const columns: Column<AdminReport>[] = [
    {
      key: "_id",
      header: "ID",
      render: (r) => <span className="font-mono text-xs text-[var(--color-primary)]">#{r._id.slice(-5)}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (r) => (
        <span
          className={`font-semibold text-xs px-2 py-0.5 rounded ${
            r.category === "Cheating"
              ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
              : r.category === "Abusive behavior" || r.category === "Harassment"
              ? "bg-red-500/15 text-red-400 border border-red-500/30"
              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
          }`}
        >
          {r.category}
        </span>
      ),
    },
    {
      key: "reportedUser",
      header: "Reported User",
      render: (r) => (
        <span className="font-medium text-xs text-[var(--color-text)]">
          {r.reportedUserId?.username || "Unknown"}
        </span>
      ),
    },
    {
      key: "reporter",
      header: "Reporter",
      render: (r) => (
        <span className="text-xs text-[var(--color-text-secondary)]">
          {r.reporterId?.username || "Anonymous"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
            r.status === "open" || r.status === "pending"
              ? "bg-red-500/15 text-red-400"
              : r.status === "investigating"
              ? "bg-amber-500/15 text-amber-400"
              : "bg-emerald-500/15 text-emerald-400"
          }`}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (r) => (
        <span className="text-xs text-[var(--color-text-secondary)]">
          {new Date(r.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (r) => (
        <Link
          href={`/admin/reports/${r._id}`}
          className="px-2.5 py-1 text-xs font-semibold rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]"
        >
          Review
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
            Reports & Moderation Queue
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Investigate suspected violations, review cheating reports, and take action.
          </p>
        </div>

        {/* Status Tabs (R6.27) */}
        <div className="flex items-center gap-1.5 text-xs">
          {["open", "investigating", "resolved", "dismissed", "all"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-[var(--radius-md)] capitalize font-medium transition-colors ${
                statusFilter === s
                  ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-semibold border border-[var(--color-primary)]/30"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-transparent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={reports}
        keyExtractor={(r) => r._id}
        isLoading={isLoading}
        emptyMessage="No open reports. Everything is currently clear."
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        onPageChange={setPage}
        renderMobileCard={(r) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-red-400">{r.category}</span>
              <span className="text-[10px] uppercase font-semibold text-[var(--color-text-secondary)]">
                {r.status}
              </span>
            </div>
            <div className="text-xs text-[var(--color-text)]">
              Against: <strong>{r.reportedUserId?.username || "Unknown"}</strong> by {r.reporterId?.username || "Anon"}
            </div>
            <div className="text-[11px] text-[var(--color-text-secondary)] line-clamp-1">
              {r.description || "No description"}
            </div>
            <div className="pt-1 flex justify-end">
              <Link href={`/admin/reports/${r._id}`} className="text-[var(--color-primary)] font-medium text-xs">
                Review Report →
              </Link>
            </div>
          </div>
        )}
      />
    </div>
  );
};
