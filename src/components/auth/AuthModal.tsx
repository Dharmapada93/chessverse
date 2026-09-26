"use client";

import React, { useState } from "react";
import { X, LogIn, UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    openLogin,
    openRegister,
    closeAuthModal,
    login,
    register,
  } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (authModalMode === "login") {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.message || "Failed to log in.");
        } else {
          setPassword("");
        }
      } else {
        if (username.trim().length < 3) {
          setError("Username must be at least 3 characters.");
          setIsSubmitting(false);
          return;
        }
        const res = await register(username, email, password);
        if (!res.success) {
          setError(res.message || "Failed to create account.");
        } else {
          setUsername("");
          setPassword("");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18352B]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-[20px] border border-[var(--color-border)] bg-[#FBF9F3] dark:bg-[#21332B] p-6 sm:p-8 shadow-2xl text-[var(--color-text)] relative">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[#EDE9DE] dark:hover:bg-[#18352B] rounded-[8px] p-1.5 transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#B58A3A]/15 text-[#B58A3A] text-sm">
              ♞
            </span>
            <span className="font-semibold tracking-[0.2em] text-xs uppercase text-[#B58A3A]">
              ChessVerse
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[var(--color-text)]">
            {authModalMode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            {authModalMode === "login"
              ? "Log in to play rated games, track insights, and challenge friends."
              : "Register your real player account. 100% free with no subscriptions."}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex rounded-[12px] bg-[#EDE9DE] dark:bg-[#18352B] border border-[var(--color-border)] p-1 mb-5 text-xs">
          <button
            type="button"
            onClick={() => {
              setError(null);
              openLogin();
            }}
            className={`flex-1 py-2 text-center rounded-[8px] font-semibold transition cursor-pointer ${
              authModalMode === "login"
                ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[var(--color-text)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              openRegister();
            }}
            className={`flex-1 py-2 text-center rounded-[8px] font-semibold transition cursor-pointer ${
              authModalMode === "register"
                ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[var(--color-text)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-[12px] border border-[#A94B45]/30 bg-[#A94B45]/10 p-3 text-xs text-[#A94B45]">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === "register" && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Anand"
                className="w-full rounded-[12px] border border-[var(--color-border)] bg-[#F7F4EC] dark:bg-[#13201B] px-3.5 py-2.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-secondary)]/50 outline-none transition focus:border-[#B58A3A] focus:ring-1 focus:ring-[#B58A3A]"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full rounded-[12px] border border-[var(--color-border)] bg-[#F7F4EC] dark:bg-[#13201B] px-3.5 py-2.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-secondary)]/50 outline-none transition focus:border-[#B58A3A] focus:ring-1 focus:ring-[#B58A3A]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-[12px] border border-[var(--color-border)] bg-[#F7F4EC] dark:bg-[#13201B] px-3.5 py-2.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-secondary)]/50 outline-none transition focus:border-[#B58A3A] focus:ring-1 focus:ring-[#B58A3A]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:text-[#18221E] py-3 text-xs font-bold uppercase tracking-wider text-[#FBF9F3] hover:-translate-y-0.5 active:translate-y-0 transition shadow-md disabled:opacity-50 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : authModalMode === "login" ? (
              <>
                <LogIn size={14} />
                <span>Log In</span>
              </>
            ) : (
              <>
                <UserPlus size={14} />
                <span>Create Free Account</span>
              </>
            )}
          </button>
        </form>

        {/* Free product guarantee */}
        <p className="mt-5 text-center text-[11px] text-[var(--color-text-secondary)]">
          ChessVerse is 100% free forever. No credit cards or subscriptions.
        </p>
      </div>
    </div>
  );
}
