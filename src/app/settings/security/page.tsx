"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type SessionItem = {
  id: string;
  browser: string;
  os: string;
  device: string;
  location: string;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
};

export default function SecuritySettingsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = typeof window !== "undefined" ? localStorage.getItem("chessverse-token") : null;

      const res = await fetch(`${apiUrl}/api/auth/sessions`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && Array.isArray(data.sessions)) {
        setSessions(data.sessions);
      } else {
        setSessions([]);
      }
    } catch {
      setError("Failed to load active sessions");
    } finally {
      setLoading(false);
    }
  }

  async function revokeSession(sessionId: string) {
    setRevokingId(sessionId);
    setMessage(null);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = typeof window !== "undefined" ? localStorage.getItem("chessverse-token") : null;

      const res = await fetch(`${apiUrl}/api/auth/sessions/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setMessage("Session revoked successfully.");
      } else {
        setError("Failed to revoke session.");
      }
    } catch {
      setError("Network error while revoking session.");
    } finally {
      setRevokingId(null);
    }
  }

  async function revokeOtherSessions() {
    setRevokingAll(true);
    setMessage(null);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = typeof window !== "undefined" ? localStorage.getItem("chessverse-token") : null;

      const res = await fetch(`${apiUrl}/api/auth/sessions/revoke-others`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.isCurrent));
        setMessage("Signed out all other sessions.");
      } else {
        setError("Failed to revoke sessions.");
      }
    } catch {
      setError("Network error while revoking sessions.");
    } finally {
      setRevokingAll(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordErr(null);

    if (newPassword !== confirmPassword) {
      setPasswordErr("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordErr("New password must be at least 8 characters.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = typeof window !== "undefined" ? localStorage.getItem("chessverse-token") : null;

      const res = await fetch(`${apiUrl}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordMsg("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordErr(data.message || "Failed to change password");
      }
    } catch {
      setPasswordErr("Network error changing password.");
    } finally {
      setUpdatingPassword(false);
    }
  }

  function formatTimeAgo(isoString: string): string {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return "Active now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-10 text-[#171A18] animate-pageEnter">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#68706A] mb-3 font-mono">
          <Link href="/settings" className="hover:text-[#171A18] transition">
            Settings
          </Link>
          <span>/</span>
          <span className="text-[#B88A32]">Security & Sessions</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#171A18]">Security & Sessions</h1>
        <p className="mt-1 text-sm text-[#68706A]">
          Manage your active device sessions, password protection, and account hardening.
        </p>

        {message && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 shadow-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-8">
          {/* Active Sessions Section */}
          <section className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 p-6 sm:p-8 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
            <div className="flex items-center justify-between border-b border-[rgba(30,30,20,0.08)] pb-4">
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-[#B88A32] font-semibold">
                  Session Hardening
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#171A18]">Active Sessions</h2>
              </div>
              <span className="text-xs font-mono text-[#68706A]">
                {sessions.length} active device{sessions.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-[#68706A]">
                Loading active sessions...
              </div>
            ) : (
              <div className="mt-6 divide-y divide-[rgba(30,30,20,0.06)]">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between first:pt-0 last:pb-0"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">
                          {s.device === "Mobile" ? "📱" : "💻"}
                        </span>
                        <h3 className="font-semibold text-[#171A18] text-sm">
                          {s.browser} · {s.os}
                        </h3>
                        {s.isCurrent && (
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-700">
                            Current session
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-[#68706A] pl-7">
                        {s.location} • {formatTimeAgo(s.lastActive)}
                      </p>
                    </div>

                    {!s.isCurrent && (
                      <button
                        onClick={() => revokeSession(s.id)}
                        disabled={revokingId === s.id}
                        className="self-start sm:self-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-40 cursor-pointer shadow-sm"
                      >
                        {revokingId === s.id ? "Revoking..." : "Revoke"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {sessions.filter((s) => !s.isCurrent).length > 0 && (
              <div className="mt-8 border-t border-[rgba(30,30,20,0.08)] pt-6">
                <button
                  onClick={revokeOtherSessions}
                  disabled={revokingAll}
                  className="rounded-xl border border-[rgba(30,30,20,0.12)] bg-white px-5 py-2.5 text-xs font-semibold text-[#171A18] hover:bg-[#FAF8F2] transition disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  {revokingAll ? "Signing out..." : "Sign out all other sessions"}
                </button>
              </div>
            )}
          </section>

          {/* Change Password Card */}
          <section className="rounded-2xl border border-[rgba(30,30,20,0.08)] bg-white/85 p-6 sm:p-8 shadow-[0_8px_30px_rgba(35,30,20,0.04)]">
            <h2 className="text-xl font-bold text-[#171A18]">Change Password</h2>
            <p className="mt-1 text-xs text-[#68706A]">
              Ensure your account uses a strong, unique password of at least 8 characters.
            </p>

            {passwordMsg && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 shadow-sm">
                {passwordMsg}
              </div>
            )}
            {passwordErr && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 shadow-sm">
                {passwordErr}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="mt-6 space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-mono uppercase text-[#68706A] mb-1.5 font-semibold">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[rgba(30,30,20,0.12)] bg-white px-3.5 py-2.5 text-sm text-[#171A18] placeholder:text-[#68706A]/40 outline-none focus:border-[#B88A32] transition shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#68706A] mb-1.5 font-semibold">
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-[rgba(30,30,20,0.12)] bg-white px-3.5 py-2.5 text-sm text-[#171A18] placeholder:text-[#68706A]/40 outline-none focus:border-[#B88A32] transition shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#68706A] mb-1.5 font-semibold">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[rgba(30,30,20,0.12)] bg-white px-3.5 py-2.5 text-sm text-[#171A18] placeholder:text-[#68706A]/40 outline-none focus:border-[#B88A32] transition shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="mt-2 rounded-xl bg-[#B88A32] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#A07628] disabled:opacity-40 shadow-sm hover:-translate-y-0.5 cursor-pointer"
              >
                {updatingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
