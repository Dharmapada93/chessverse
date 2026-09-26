"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WifiOff, CheckCircle2, RotateCw } from "lucide-react";
import { socket } from "@/lib/socket";

export default function ConnectionBanner() {
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [syncPhase, setSyncPhase] = useState<"idle" | "restored" | "syncing" | "synced">("idle");

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
      setSyncPhase("syncing");
      setTimeout(() => {
        setSyncPhase("synced");
        setTimeout(() => {
          setSyncPhase("idle");
          setIsDisconnected(false);
        }, 1500);
      }, 1000);
    }

    function handleOffline() {
      setIsOffline(true);
      setSyncPhase("idle");
    }

    if (typeof window !== "undefined") {
      setIsOffline(!window.navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    function onDisconnect() {
      setIsDisconnected(true);
      setSyncPhase("idle");
    }

    function onConnect() {
      if (isDisconnected) {
        setSyncPhase("syncing");
        const timer1 = setTimeout(() => {
          setSyncPhase("synced");
          const timer2 = setTimeout(() => {
            setIsDisconnected(false);
            setSyncPhase("idle");
          }, 1500);
          return () => clearTimeout(timer2);
        }, 800);
        return () => clearTimeout(timer1);
      }
    }

    socket.on("disconnect", onDisconnect);
    socket.on("connect", onConnect);

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
      socket.off("disconnect", onDisconnect);
      socket.off("connect", onConnect);
    };
  }, [isDisconnected]);

  const showBanner = isOffline || isDisconnected || syncPhase !== "idle";
  if (!showBanner) return null;

  return (
    <aside
      aria-label="Connection Status"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border px-4 py-2.5 shadow-2xl backdrop-blur-md transition-all duration-300 ${
        syncPhase === "synced"
          ? "border-emerald-500/30 bg-emerald-950/90 text-emerald-300"
          : syncPhase === "syncing"
            ? "border-teal-500/30 bg-teal-950/90 text-teal-300"
            : "border-amber-500/30 bg-black/90 text-amber-200"
      }`}
    >
      {syncPhase === "synced" ? (
        <>
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-white">
            ✓ Reconnected (Game synchronized)
          </span>
        </>
      ) : syncPhase === "syncing" ? (
        <>
          <RotateCw size={15} className="text-teal-400 animate-spin shrink-0" />
          <span className="text-xs font-semibold text-white">
            Connection restored. Syncing game...
          </span>
        </>
      ) : isOffline ? (
        <>
          <WifiOff size={16} className="text-amber-400 shrink-0" />
          <div className="text-xs flex items-center gap-1.5">
            <span className="font-semibold text-white">You&apos;re offline. Connection lost.</span>{" "}
            <span className="text-amber-300/90 font-medium">Trying to reconnect...</span>
          </div>
        </>
      ) : (
        <>
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="absolute h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
            <span className="h-2 w-2 rounded-full bg-amber-400" />
          </div>
          <div className="text-xs flex items-center gap-1.5">
            <span className="font-semibold text-white">Connection lost</span>{" "}
            <span className="text-amber-300 font-medium">● Trying to reconnect...</span>
          </div>
          <Link
            href="/play"
            className="ml-2 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/20 transition"
          >
            Return to Lobby
          </Link>
        </>
      )}
    </aside>
  );
}
