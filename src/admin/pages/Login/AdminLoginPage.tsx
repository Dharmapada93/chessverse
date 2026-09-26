"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";

export const AdminLoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await apiFetch("/api/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, twoFactorCode }),
      });
      const data = await res.json();

      if (data.requires2FA) {
        setRequires2FA(true);
        setIsLoading(false);
        return;
      }

      if (data.success) {
        if (data.sessionId) {
          localStorage.setItem("chessverse-token", data.sessionId);
        }
        router.push("/admin/dashboard");
      } else {
        setError(data.message || "Invalid administrator credentials");
      }
    } catch (err) {
      setError("Network or server connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Brand Header (R6.6) */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 text-2xl text-[var(--color-primary)]">
            ♟
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[var(--color-text)]">
              CHESS<span className="text-[var(--color-primary)]">VERSE</span>
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Administrative Control Center
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[var(--color-text)] mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              placeholder="admin@chessverse.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--color-text)] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>

          {requires2FA && (
            <div>
              <label className="block font-medium text-[var(--color-text)] mb-1">
                2FA Verification Code (R6.7)
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="6-digit code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[var(--color-bg)] text-[var(--color-text)] text-center font-mono text-base tracking-widest focus:outline-none"
                autoFocus
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-[var(--radius-md)] font-semibold text-black bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xs flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin text-sm">◌</span>
                <span>Authenticating...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-[var(--color-border)]">
          <Link
            href="/"
            className="text-[11px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            ← Return to ChessVerse Player App
          </Link>
        </div>
      </div>
    </div>
  );
};
