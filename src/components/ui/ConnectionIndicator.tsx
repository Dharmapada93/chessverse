"use client";

import React, { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export type ConnectionState = "connected" | "reconnecting" | "syncing" | "disconnected";

export interface ConnectionIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export default function ConnectionIndicator({
  className = "",
  showLabel = true,
}: ConnectionIndicatorProps) {
  const [status, setStatus] = useState<ConnectionState>("connected");

  useEffect(() => {
    function onConnect() {
      setStatus("connected");
    }

    function onDisconnect() {
      setStatus("disconnected");
    }

    function onReconnectAttempt() {
      setStatus("reconnecting");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect_attempt", onReconnectAttempt);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
    };
  }, []);

  const config: Record<ConnectionState, { dot: string; label: string }> = {
    connected: {
      dot: "bg-emerald-400",
      label: "Connected",
    },
    reconnecting: {
      dot: "bg-amber-400 animate-ping",
      label: "Reconnecting...",
    },
    syncing: {
      dot: "bg-[var(--color-primary)] animate-pulse",
      label: "Synchronizing game...",
    },
    disconnected: {
      dot: "bg-red-400",
      label: "Disconnected",
    },
  };

  const current = config[status];

  return (
    <div
      title={`Connection status: ${current.label}`}
      className={`inline-flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-2.5 py-1 select-none ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`h-full w-full rounded-full ${current.dot}`} />
      </span>

      {showLabel && (
        <span className="text-[11px] font-medium text-[var(--color-text-secondary)] font-mono">
          {current.label}
        </span>
      )}
    </div>
  );
}
