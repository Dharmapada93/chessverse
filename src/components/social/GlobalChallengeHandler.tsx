"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Swords, X, Check } from "lucide-react";
import { socket } from "@/lib/socket";
import { ensureAuthToken } from "@/lib/api";

type IncomingChallenge = {
  invitationId: string;
  sender: {
    id: string;
    username: string;
    rating?: number;
    avatar?: string;
  };
  timeControl: {
    initialTime: number;
    increment: number;
  };
  colorPreference: "random" | "white" | "black";
  expiresAt: string;
};

export default function GlobalChallengeHandler() {
  const router = useRouter();
  const [activeChallenge, setActiveChallenge] = useState<IncomingChallenge | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    // Ensure socket connection with auth token
    ensureAuthToken().then((token) => {
      if (token) {
        socket.auth = { token };
        if (!socket.connected) {
          socket.connect();
        }
        socket.emit("presence:join");
      }
    });

    function handleChallengeReceived(data: IncomingChallenge) {
      setActiveChallenge(data);
      // Play subtle sound or browser notification if permitted
      try {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Chess Challenge!", {
            body: `${data.sender.username} challenged you to a game.`,
            icon: "/favicon.ico",
          });
        }
      } catch {}
    }

    function handleChallengeAccepted(data: { gameId: string; roomId?: string }) {
      setActiveChallenge(null);
      if (data?.gameId) {
        router.push(`/game/${data.gameId}`);
      }
    }

    function handlePresenceUpdate(data: { userId: string; status: "online" | "offline"; online: boolean }) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("chessverse:presence", { detail: data }));
      }
    }

    function handleNotificationNew(data: any) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("chessverse:notification", { detail: data }));
      }
    }

    socket.on("challenge:received", handleChallengeReceived);
    socket.on("challenge:accepted", handleChallengeAccepted);
    socket.on("presence:update", handlePresenceUpdate);
    socket.on("notification:new", handleNotificationNew);

    return () => {
      socket.off("challenge:received", handleChallengeReceived);
      socket.off("challenge:accepted", handleChallengeAccepted);
      socket.off("presence:update", handlePresenceUpdate);
      socket.off("notification:new", handleNotificationNew);
    };
  }, [router]);

  function handleAccept() {
    if (!activeChallenge) return;
    setIsAccepting(true);
    socket.emit("challenge:accept", { invitationId: activeChallenge.invitationId });
  }

  function handleDecline() {
    if (!activeChallenge) return;
    socket.emit("challenge:decline", { invitationId: activeChallenge.invitationId });
    setActiveChallenge(null);
  }

  if (!activeChallenge) return null;

  const initialMinutes = Math.round(activeChallenge.timeControl.initialTime / 60000);
  const inc = activeChallenge.timeControl.increment;
  const timeLabel = `${initialMinutes} + ${inc}`;
  const category = initialMinutes <= 2 ? "Bullet" : initialMinutes <= 5 ? "Blitz" : "Rapid";

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="w-84 sm:w-96 rounded-2xl border border-[rgba(30,30,20,0.12)] bg-[#FAF8F2] p-5 shadow-[0_16px_50px_rgba(35,30,20,0.12)] backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(30,30,20,0.08)]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#B88A32]">
            <Swords size={15} />
            Game Invitation
          </div>

          <button
            onClick={handleDecline}
            className="rounded p-1 text-[#68706A] hover:text-[#171A18] hover:bg-[rgba(30,30,20,0.05)]"
            aria-label="Decline"
          >
            <X size={15} />
          </button>
        </div>

        <div className="my-4">
          <h3 className="text-base font-semibold text-[#171A18]">
            <span className="font-bold text-[#171A18]">{activeChallenge.sender.username}</span> wants to play
          </h3>

          <div className="mt-2 flex items-center justify-between text-xs text-[#68706A]">
            <span className="font-mono font-medium text-[#171A18]">
              {category} • {timeLabel}
            </span>
            {activeChallenge.sender.rating && (
              <span className="font-mono text-[#68706A]">
                Rating: {activeChallenge.sender.rating}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleDecline}
            disabled={isAccepting}
            className="flex-1 rounded-xl border border-[rgba(30,30,20,0.12)] bg-white py-2.5 text-xs font-semibold text-[#171A18] transition hover:bg-[#FAF8F2] disabled:opacity-50 shadow-sm"
          >
            Decline
          </button>

          <button
            type="button"
            onClick={handleAccept}
            disabled={isAccepting}
            className="flex-1 rounded-xl bg-[#B88A32] py-2.5 text-xs font-semibold text-white transition hover:bg-[#A07628] disabled:opacity-50 shadow-sm"
          >
            {isAccepting ? "Joining..." : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}
