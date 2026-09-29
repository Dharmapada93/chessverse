"use client";

import React, { useState } from "react";
import { X, LogIn, UserPlus, AlertCircle, Loader2, Sparkles, ShieldCheck } from "lucide-react";
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
          closeAuthModal();
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
          closeAuthModal();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoUsername: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await login(demoUsername, "password");
      if (res.success) {
        closeAuthModal();
      } else {
        setError("Could not initialize demo login. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-[24px] border border-[rgba(24,34,30,0.12)] dark:border-white/12 bg-[#FBF9F3] dark:bg-[#1B2A24] p-6 sm:p-8 shadow-2xl text-[#18221E] dark:text-[#F4EFE3] relative">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 text-[#69736C] hover:text-[#18221E] dark:hover:text-[#F4EFE3] hover:bg-[#EDE9DE] dark:hover:bg-[#21332B] rounded-full p-2 transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#B58A3A]/15 text-[#B58A3A] dark:text-[#D3AA58] text-base font-bold shadow-xs">
              ♞
            </span>
            <span className="font-semibold tracking-[0.25em] text-[11px] uppercase text-[#B58A3A] dark:text-[#D3AA58]">
              CHESSVERSE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#18221E] dark:text-[#F4EFE3]">
            {authModalMode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-xs text-[#69736C] dark:text-[#B5BDB5] leading-relaxed">
            {authModalMode === "login"
              ? "Access rated duels, tactical insights, and friend challenges."
              : "Register your player ID. 100% free with zero subscriptions."}
          </p>
        </div>

        {/* Quick 1-Click Access for Instant Playing */}
        <div className="mb-5 rounded-[16px] border border-[#B58A3A]/30 bg-[#B58A3A]/10 p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#B58A3A] dark:text-[#D3AA58]">
            <Sparkles size={14} />
            <span>Instant Demo Access</span>
          </div>
          <p className="text-[11px] text-[#69736C] dark:text-[#B5BDB5]">
            Want to jump straight into games without typing? Select an account:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickDemo("Dharmapada")}
              className="flex flex-col items-center justify-center py-2 px-3 rounded-[10px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[rgba(24,34,30,0.1)] dark:border-white/10 hover:border-[#B58A3A] text-left transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span className="text-xs font-bold text-[#18221E] dark:text-[#F4EFE3]">Dharmapada</span>
              <span className="text-[10px] font-mono text-[#B58A3A] dark:text-[#D3AA58]">Rating 1428</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickDemo("MagnusCarlsen")}
              className="flex flex-col items-center justify-center py-2 px-3 rounded-[10px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[rgba(24,34,30,0.1)] dark:border-white/10 hover:border-[#B58A3A] text-left transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span className="text-xs font-bold text-[#18221E] dark:text-[#F4EFE3]">Grandmaster</span>
              <span className="text-[10px] font-mono text-[#B58A3A] dark:text-[#D3AA58]">Rating 2882</span>
            </button>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex rounded-[12px] bg-[#EDE9DE] dark:bg-[#13201B] border border-[rgba(24,34,30,0.08)] dark:border-white/8 p-1 mb-5 text-xs">
          <button
            type="button"
            onClick={() => {
              setError(null);
              openLogin();
            }}
            className={`flex-1 py-2 text-center rounded-[8px] font-semibold transition cursor-pointer ${
              authModalMode === "login"
                ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18221E] dark:text-[#F4EFE3] shadow-xs"
                : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E]"
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
                ? "bg-[#FBF9F3] dark:bg-[#21332B] text-[#18221E] dark:text-[#F4EFE3] shadow-xs"
                : "text-[#69736C] dark:text-[#B5BDB5] hover:text-[#18221E]"
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
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authModalMode === "register" && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] mb-1.5">
                Player Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Kasparov"
                className="w-full rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#13201B] px-3.5 py-2.5 text-xs text-[#18221E] dark:text-[#F4EFE3] placeholder-[#69736C]/60 outline-none transition focus:border-[#B58A3A]"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] mb-1.5">
              {authModalMode === "login" ? "Username or Email" : "Email Address"}
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dharmapada@chessverse.com"
              className="w-full rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#13201B] px-3.5 py-2.5 text-xs text-[#18221E] dark:text-[#F4EFE3] placeholder-[#69736C]/60 outline-none transition focus:border-[#B58A3A]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#13201B] px-3.5 py-2.5 text-xs text-[#18221E] dark:text-[#F4EFE3] placeholder-[#69736C]/60 outline-none transition focus:border-[#B58A3A]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] py-3 text-xs font-bold uppercase tracking-wider text-[#F7F4EC] transition shadow-md disabled:opacity-50 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Signing In...</span>
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
        <p className="mt-4 text-center text-[10px] text-[#69736C] dark:text-[#B5BDB5]">
          ChessVerse is 100% free and open. No paywalls or subscriptions.
        </p>
      </div>
    </div>
  );
}
