"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCheck, Eye, Heart, Swords, Trophy, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { socket } from "@/lib/socket";

type NotificationItem = {
  _id: string;
  type: string;
  title: string;
  message: string;
  actorId?: string;
  actorUsername?: string;
  gameId?: string;
  referenceId?: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function loadNotifications() {
    try {
      const res = await apiFetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          const unread = data.notifications.filter((n: NotificationItem) => !n.read).length;
          setUnreadCount(unread);
        }
      }
    } catch {}
  }

  useEffect(() => {
    loadNotifications();

    function handleRealtimeNotification(e: any) {
      const newNotif = e.detail;
      if (newNotif) {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((c) => c + 1);
      }
    }

    window.addEventListener("chessverse:notification", handleRealtimeNotification);

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("chessverse:notification", handleRealtimeNotification);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function markAllAsRead() {
    try {
      await apiFetch("/api/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  }

  async function markAsRead(id: string) {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  }

  function handleAcceptChallenge(invitationId?: string) {
    if (!invitationId) return;
    if (!socket.connected) {
      const token = localStorage.getItem("chessverse-token");
      if (token) socket.auth = { token };
      socket.connect();
    }
    socket.emit("challenge:accept", { invitationId });
    setIsOpen(false);
  }

  function handleDeclineChallenge(invitationId?: string) {
    if (!invitationId) return;
    if (!socket.connected) {
      const token = localStorage.getItem("chessverse-token");
      if (token) socket.auth = { token };
      socket.connect();
    }
    socket.emit("challenge:decline", { invitationId });
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case "game_invite":
      case "challenge":
        return <span className="text-sm">♟</span>;
      case "friend_accepted":
        return <Heart size={14} className="text-rose-400 fill-rose-400" />;
      case "friend_request":
        return <Heart size={14} className="text-rose-400" />;
      case "spectator":
        return <Eye size={14} className="text-sky-400" />;
      case "tournament":
        return <Trophy size={14} className="text-[#d7b875]" />;
      default:
        return <Bell size={14} className="text-white/60" />;
    }
  }

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 items-center gap-1.5 rounded-full border border-[rgba(30,30,20,0.10)] bg-[#FAF8F2] px-2.5 text-[#68706A] transition-colors hover:bg-[#FFFFFF] hover:text-[#171A18] shadow-xs cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#B88A32] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-[rgba(30,30,20,0.12)] bg-[#FFFFFF] p-4 shadow-[0_16px_50px_rgba(35,30,20,0.10)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 text-[#171A18]">
          <div className="flex items-center justify-between border-b border-[rgba(30,30,20,0.08)] pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#171A18]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#B88A32]/15 px-2 py-0.5 text-[10px] font-medium text-[#B88A32]">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-[#68706A] hover:text-[#171A18] transition cursor-pointer"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          <div className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8A928C]">
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => {
                const isChallenge = notif.type === "game_invite" || notif.type === "challenge";

                return (
                  <div
                    key={notif._id}
                    onClick={() => !notif.read && markAsRead(notif._id)}
                    className={`rounded-xl border p-3 transition cursor-pointer ${
                      notif.read
                        ? "border-[rgba(30,30,20,0.06)] bg-[#FAF8F2]/60 text-[#68706A]"
                        : "border-[#B88A32]/30 bg-[#FAF8F2] text-[#171A18] shadow-xs"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EFECE3]">
                        {getNotificationIcon(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-snug">
                          {notif.message || notif.title}
                        </p>
                        <p className="mt-1 text-[10px] text-[#8A928C]">
                          {formatTimeAgo(notif.createdAt)}
                        </p>

                        {/* If challenge, show action buttons */}
                        {isChallenge && notif.referenceId && (
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptChallenge(notif.referenceId);
                              }}
                              className="rounded-lg bg-[#B88A32] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#A07628] transition shadow-xs cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeclineChallenge(notif.referenceId);
                                markAsRead(notif._id);
                              }}
                              className="rounded-lg border border-[rgba(30,30,20,0.12)] bg-[#FFFFFF] px-3 py-1 text-[11px] font-medium text-[#171A18] hover:bg-[#FAF8F2] transition cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>

                      {!notif.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#B88A32] shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-[rgba(30,30,20,0.08)] p-2.5 text-center mt-2">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[#B88A32] hover:text-[#A07628] transition"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
