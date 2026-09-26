"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, ConfirmDialog, AdminModal, type Column } from "../../components";
import {
  fetchAdminUsers,
  suspendUser,
  unsuspendUser,
  banUser,
  unbanUser,
  deleteUser,
} from "../../services/users";
import type { AdminUser } from "../../services/types";

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Dialog state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendDuration, setSuspendDuration] = useState("24");
  const [suspendReason, setSuspendReason] = useState("");
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminUsers({ search, filter, page, limit: 15 });
      if (data.success) {
        setUsers(data.users);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, filter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleSuspendSubmit = async () => {
    if (!selectedUser || !suspendReason) return;
    setIsActionLoading(true);
    try {
      await suspendUser(selectedUser._id, suspendReason, parseInt(suspendDuration, 10));
      setIsSuspendModalOpen(false);
      setSuspendReason("");
      loadUsers();
    } catch (err) {
      console.error("Suspend error:", err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBanSubmit = async () => {
    if (!selectedUser || !banReason) return;
    setIsActionLoading(true);
    try {
      await banUser(selectedUser._id, banReason);
      setIsBanDialogOpen(false);
      setBanReason("");
      loadUsers();
    } catch (err) {
      console.error("Ban error:", err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    setIsActionLoading(true);
    try {
      await deleteUser(selectedUser._id);
      setIsDeleteDialogOpen(false);
      loadUsers();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnsuspend = async (user: AdminUser) => {
    try {
      await unsuspendUser(user._id);
      loadUsers();
    } catch (err) {
      console.error("Unsuspend error:", err);
    }
  };

  const handleUnban = async (user: AdminUser) => {
    try {
      await unbanUser(user._id);
      loadUsers();
    } catch (err) {
      console.error("Unban error:", err);
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "username",
      header: "User",
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] flex items-center justify-center font-bold text-xs text-[var(--color-primary)]">
            {u.username[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-[var(--color-text)] flex items-center gap-1.5">
              <span>{u.username}</span>
              {u.role !== "user" && (
                <span className="text-[9px] px-1 py-0.2 rounded font-bold uppercase bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                  {u.role}
                </span>
              )}
            </div>
            <div className="text-[11px] text-[var(--color-text-secondary)]">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      render: (u) => <span className="font-mono font-medium">{u.rating}</span>,
    },
    {
      key: "accountStatus",
      header: "Status",
      render: (u) => {
        let badgeClass = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
        if (u.accountStatus === "SUSPENDED") badgeClass = "bg-amber-500/15 text-amber-400 border-amber-500/30";
        if (u.accountStatus === "BANNED") badgeClass = "bg-red-500/15 text-red-400 border-red-500/30";

        return (
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
            {u.accountStatus}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (u) => (
        <span className="text-xs text-[var(--color-text-secondary)]">
          {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/users/${u._id}`}
            className="px-2.5 py-1 text-xs font-medium rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]"
          >
            View
          </Link>

          {u.accountStatus === "SUSPENDED" ? (
            <button
              onClick={() => handleUnsuspend(u)}
              className="px-2 py-1 text-xs font-medium rounded-[var(--radius-sm)] bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
            >
              Unsuspend
            </button>
          ) : u.accountStatus === "BANNED" ? (
            <button
              onClick={() => handleUnban(u)}
              className="px-2 py-1 text-xs font-medium rounded-[var(--radius-sm)] bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
            >
              Unban
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setSelectedUser(u);
                  setIsSuspendModalOpen(true);
                }}
                className="px-2 py-1 text-xs font-medium rounded-[var(--radius-sm)] text-amber-400 hover:bg-amber-500/10"
              >
                Suspend
              </button>
              <button
                onClick={() => {
                  setSelectedUser(u);
                  setIsBanDialogOpen(true);
                }}
                className="px-2 py-1 text-xs font-medium rounded-[var(--radius-sm)] text-red-400 hover:bg-red-500/10"
              >
                Ban
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
            User Management
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Inspect player profiles, audit accounts, and manage moderation actions.
          </p>
        </div>

        {/* Search Input (R6.15) */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-primary)] w-48 sm:w-60"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)]"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Tabs (R6.16) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {["all", "active", "suspended", "banned", "admin"].map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-[var(--radius-md)] capitalize font-medium transition-colors ${
              filter === f
                ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-semibold border border-[var(--color-primary)]/30"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-transparent"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Responsive Table */}
      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(u) => u._id}
        isLoading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        onPageChange={setPage}
        renderMobileCard={(u) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[var(--color-text)]">{u.username}</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                  u.accountStatus === "ACTIVE"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : u.accountStatus === "SUSPENDED"
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30"
                }`}
              >
                {u.accountStatus}
              </span>
            </div>
            <div className="text-[11px] text-[var(--color-text-secondary)]">{u.email}</div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--color-border)]">
              <span>Rating: <strong className="text-[var(--color-text)]">{u.rating}</strong></span>
              <Link href={`/admin/users/${u._id}`} className="text-[var(--color-primary)] font-medium">
                View Profile →
              </Link>
            </div>
          </div>
        )}
      />

      {/* Suspend Modal (R6.19) */}
      <AdminModal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        title={`Suspend User: ${selectedUser?.username}`}
        footer={
          <>
            <button
              onClick={() => setIsSuspendModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-medium rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSuspendSubmit}
              disabled={!suspendReason || isActionLoading}
              className="px-4 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50"
            >
              {isActionLoading ? "Suspending..." : "Confirm Suspension"}
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[var(--color-text)] mb-1.5">
              Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "1 Hour", value: "1" },
                { label: "24 Hours", value: "24" },
                { label: "7 Days", value: "168" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSuspendDuration(opt.value)}
                  className={`py-2 px-3 rounded-[var(--radius-md)] border text-center font-medium ${
                    suspendDuration === opt.value
                      ? "border-amber-400 bg-amber-500/15 text-amber-300"
                      : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-[var(--color-text)] mb-1.5">
              Reason (Required)
            </label>
            <textarea
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Provide clear rationale for suspension..."
              className="w-full p-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </AdminModal>

      {/* Permanent Ban Dialog (R6.20, R6.48) */}
      <ConfirmDialog
        isOpen={isBanDialogOpen}
        title={`Permanently Ban ${selectedUser?.username}`}
        message="This will immediately revoke all active sessions, block access to matchmaking, and mark the account as banned. An immutable audit record will be logged."
        confirmLabel="Ban User"
        isDangerous={true}
        requiredTypedConfirmation="BAN"
        onConfirm={handleBanSubmit}
        onCancel={() => setIsBanDialogOpen(false)}
        isLoading={isActionLoading}
      />
    </div>
  );
};
