import { apiFetch } from "../../lib/api";
import type { AdminSystemHealth } from "./types";

export async function fetchSystemHealth(): Promise<{ success: boolean; services: AdminSystemHealth["services"]; timestamp: string }> {
  const res = await apiFetch("/api/admin/system/health");
  return res.json();
}

export async function fetchSystemSettings() {
  const res = await apiFetch("/api/admin/system/settings");
  return res.json();
}

export async function updateSystemSetting(key: string, value: any, category: string = "maintenance", description?: string) {
  const res = await apiFetch("/api/admin/system/settings", {
    method: "PATCH",
    body: JSON.stringify({ key, value, category, description }),
  });
  return res.json();
}
