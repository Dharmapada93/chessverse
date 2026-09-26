"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { socket } from "@/lib/socket";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import type { NotificationItem } from "@/services/social/types";
import type { NotificationsPageProps } from "./types";

export function NotificationsPage({ className = "" }: NotificationsPageProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    try {
      const res = await apiFetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();

    function handleRealtime(notif: any) {
      if (notif) {
        setNotifications((prev) => [notif, ...prev]);
      }
    }

    if (socket) {
      socket.on("social:notification", handleRealtime);
      socket.on("notification:new", handleRealtime);
    }

    return () => {
      if (socket) {
        socket.off("social:notification", handleRealtime);
        socket.off("notification:new", handleRealtime);
      }
    };
  }, []);

  async function handleMarkAllRead() {
    try {
      await apiFetch("/api/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  }

  async function handleRead(id: string) {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    } catch {}
  }

  async function handleAction(type: string, referenceId: string) {
    if (type === "accept_challenge") {
      try {
        const res = await apiFetch(`/api/challenges/${referenceId}/accept`, {
          method: "POST",
        });
        const data = await res.json();
        if (data.success) {
          const gameId = data.game?.id || data.game?._id;
          if (gameId) router.push(`/game/${gameId}`);
        }
      } catch {}
    } else if (type === "decline_challenge") {
      try {
        await apiFetch(`/api/challenges/${referenceId}/decline`, {
          method: "POST",
        });
        setNotifications((prev) =>
          prev.filter((n) => n.referenceId !== referenceId),
        );
      } catch {}
    }
  }

  return (
    <div className={`max-w-3xl mx-auto px-4 py-6 sm:py-8 ${className}`}>
      <NotificationCenter
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onRead={handleRead}
        onAction={handleAction}
        loading={loading}
      />
    </div>
  );
}

export default NotificationsPage;
