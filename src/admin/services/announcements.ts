import { apiFetch } from "../../lib/api";
import type { AdminAnnouncement } from "./types";

export async function fetchAdminAnnouncements(): Promise<{ success: boolean; announcements: AdminAnnouncement[] }> {
  const res = await apiFetch("/api/admin/announcements");
  return res.json();
}

export async function createAnnouncement(data: {
  title: string;
  message: string;
  severity?: "info" | "warning" | "success" | "critical";
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}) {
  const res = await apiFetch("/api/admin/announcements", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateAnnouncement(id: string, data: Partial<AdminAnnouncement>) {
  const res = await apiFetch(`/api/admin/announcements/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteAnnouncement(id: string) {
  const res = await apiFetch(`/api/admin/announcements/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
