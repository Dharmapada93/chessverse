"use client";

import React from "react";
import { Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react";
import { ConnectionStateType, ConnectionStatusProps } from "./types";

export default function ConnectionStatus({
  status,
  onRetry,
  className = "",
}: ConnectionStatusProps) {
  const config: Record<
    ConnectionStateType,
    { label: string; dotClass: string; textClass: string; icon: React.ReactNode }
  > = {
    connected: {
      label: "Connected",
      dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]",
      textClass: "text-emerald-400/90",
      icon: <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />,
    },
    reconnecting: {
      label: "Reconnecting...",
      dotClass: "bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.7)]",
      textClass: "text-amber-300",
      icon: <RefreshCw size={12} className="animate-spin text-amber-400" />,
    },
    synchronizing: {
      label: "Synchronizing game...",
      dotClass: "bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.7)]",
      textClass: "text-sky-300",
      icon: <RefreshCw size={12} className="animate-spin text-sky-400" />,
    },
    disconnected: {
      label: "Connection Lost",
      dotClass: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.7)]",
      textClass: "text-red-400",
      icon: <WifiOff size={12} className="text-red-400" />,
    },
  };

  const current = config[status] || config.connected;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium backdrop-blur-md ${className}`}
    >
      {current.icon}
      <span className={current.textClass}>{current.label}</span>

      {status === "disconnected" && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="ml-1 rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-300 hover:bg-red-500/30 transition cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
}
