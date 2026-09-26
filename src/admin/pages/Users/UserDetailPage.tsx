"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchAdminUserDetails, suspendUser, unsuspendUser, banUser, unbanUser } from "../../services/users";
import { ConfirmDialog, AdminModal } from "../../components";
import type { UserDetailsResponse } from "../../services/users";

export const UserDetailPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<UserDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendDuration, setSuspendDuration] = useState("24");
  const [suspendReason, setSuspendReason] = useState("");
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await fetchAdminUserDetails(id);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to load user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-sm text-[var(--color-text-secondary)]">
        <span className="inline-block animate-spin mr-2">◌</span>
        Loading user profile details...
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="p-8 text-center text-sm text-[var(--color-text-secondary)]">
        User not found.
      </div>
    );
  }

  const { user, stats, recentGames, reportsAgainst, auditHistory } = data;

  const handleSuspendSubmit = async () => {
    if (!suspendReason) return;
    setIsActionLoading(true);
    try {
      await suspendUser(user._id, suspendReason, parseInt(suspendDuration, 10));
      setIsSuspendModalOpen(false);
      setSuspendReason("");
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBanSubmit = async () => {
    setIsActionLoading(true);
    try {
      await banUser(user._id, "Administrative ban via profile view");
      setIsBanDialogOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="p-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-xs text-[var(--color-text-secondary)]"
          >
            ← Users
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
              <span>{user.username}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                  user.accountStatus === "ACTIVE"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : user.accountStatus === "SUSPENDED"
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30"
                }`}
              >
                {user.accountStatus}
              </span>
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">{user.email}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {user.accountStatus === "SUSPENDED" ? (
            <button
              onClick={async () => {
                await unsuspendUser(user._id);
                loadData();
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
            >
              Lift Suspension
            </button>
          ) : user.accountStatus === "BANNED" ? (
            <button
              onClick={async () => {
                await unbanUser(user._id);
                loadData();
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
            >
              Lift Ban
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsSuspendModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
              >
                Suspend User
              </button>
              <button
                onClick={() => setIsBanDialogOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
              >
                Ban Account
              </button>
            </>
          )}
        </div>
      </div>

      {/* Account Info Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] uppercase font-semibold">
            Rating
          </span>
          <div className="text-2xl font-bold font-mono text-[var(--color-text)] mt-1">
            {user.rating}
          </div>
        </div>
        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] uppercase font-semibold">
            Games Played
          </span>
          <div className="text-2xl font-bold font-mono text-[var(--color-text)] mt-1">
            {stats.gamesPlayed}
          </div>
        </div>
        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] uppercase font-semibold">
            Reports Filed Against
          </span>
          <div className="text-2xl font-bold font-mono text-[var(--color-text)] mt-1">
            {stats.reportsAgainstCount}
          </div>
        </div>
        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] uppercase font-semibold">
            Member Since
          </span>
          <div className="text-sm font-semibold text-[var(--color-text)] mt-2">
            {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Suspension / Ban Warning Banner */}
      {user.accountStatus !== "ACTIVE" && (
        <div className="p-4 rounded-[var(--radius-lg)] border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 space-y-1">
          <div className="font-semibold text-sm">Account Status: {user.accountStatus}</div>
          {user.suspendedUntil && (
            <div>Suspended until: {new Date(user.suspendedUntil).toLocaleString()}</div>
          )}
          <div>Reason: {user.suspensionReason || user.banReason || "Not specified"}</div>
        </div>
      )}

      {/* Detail Sections Tabs/Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Matches (R6.22) */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Recent Matches</h3>
            <span className="text-xs text-[var(--color-text-secondary)]">{recentGames.length} shown</span>
          </div>
          <div className="divide-y divide-[var(--color-border)] text-xs">
            {recentGames.length === 0 ? (
              <div className="p-6 text-center text-[var(--color-text-secondary)]">No games on record.</div>
            ) : (
              recentGames.map((g: any) => (
                <div key={g._id} className="p-3 flex items-center justify-between hover:bg-[var(--color-surface-hover)]">
                  <div>
                    <span className="font-medium text-[var(--color-text)]">
                      {g.white?.username || "White"} vs {g.black?.username || "Black"}
                    </span>
                    <div className="text-[11px] text-[var(--color-text-secondary)]">
                      {new Date(g.createdAt).toLocaleDateString()} • {g.status}
                    </div>
                  </div>
                  <Link
                    href={`/admin/games/${g._id}`}
                    className="text-[var(--color-primary)] font-medium hover:underline"
                  >
                    Inspect →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reports History */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Reports Filed Against User</h3>
            <span className="text-xs text-[var(--color-text-secondary)]">{reportsAgainst.length} records</span>
          </div>
          <div className="divide-y divide-[var(--color-border)] text-xs">
            {reportsAgainst.length === 0 ? (
              <div className="p-6 text-center text-emerald-400 font-medium">No violations or reports recorded.</div>
            ) : (
              reportsAgainst.map((r: any) => (
                <div key={r._id} className="p-3 flex items-center justify-between hover:bg-[var(--color-surface-hover)]">
                  <div>
                    <span className="font-semibold text-red-400">{r.category}</span>
                    <div className="text-[11px] text-[var(--color-text-secondary)] line-clamp-1">
                      {r.description || "No description provided"}
                    </div>
                  </div>
                  <Link
                    href={`/admin/reports/${r._id}`}
                    className="text-[var(--color-primary)] font-medium hover:underline"
                  >
                    Review →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Audit History (R6.46) */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)]">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Account Administrative Audit Log</h3>
        </div>
        <div className="divide-y divide-[var(--color-border)] text-xs">
          {auditHistory.length === 0 ? (
            <div className="p-6 text-center text-[var(--color-text-secondary)]">No audit entries for this user.</div>
          ) : (
            auditHistory.map((a: any) => (
              <div key={a._id} className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-medium text-[var(--color-text)]">{a.action}</span>
                  <span className="text-[var(--color-text-secondary)] ml-2">by {a.adminUsername}</span>
                  {a.reason && <p className="text-[11px] text-[var(--color-text-secondary)]">{a.reason}</p>}
                </div>
                <span className="text-[11px] text-[var(--color-text-secondary)]">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <AdminModal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        title={`Suspend ${user.username}`}
        footer={
          <>
            <button
              onClick={() => setIsSuspendModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-medium rounded-[var(--radius-md)] border border-[var(--color-border)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSuspendSubmit}
              disabled={!suspendReason || isActionLoading}
              className="px-4 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] bg-amber-500 text-black hover:bg-amber-400"
            >
              Confirm
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "1h", value: "1" },
                { label: "24h", value: "24" },
                { label: "7d", value: "168" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSuspendDuration(opt.value)}
                  className={`py-1.5 rounded border text-center ${
                    suspendDuration === opt.value
                      ? "border-amber-400 bg-amber-500/15 text-amber-300"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Reason</label>
            <textarea
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="w-full p-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
            />
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog
        isOpen={isBanDialogOpen}
        title={`Ban ${user.username}`}
        message="This is a permanent administrative ban. Active sessions will be invalidated immediately."
        confirmLabel="Ban Account"
        isDangerous={true}
        requiredTypedConfirmation="BAN"
        onConfirm={handleBanSubmit}
        onCancel={() => setIsBanDialogOpen(false)}
        isLoading={isActionLoading}
      />
    </div>
  );
};
