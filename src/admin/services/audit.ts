import { apiFetch } from "../../lib/api";
import type { AdminAuditLog } from "./types";

export interface AuditLogsResponse {
  success: boolean;
  logs: AdminAuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function fetchAdminAuditLogs(params: {
  action?: string;
  targetType?: string;
  page?: number;
  limit?: number;
} = {}): Promise<AuditLogsResponse> {
  const query = new URLSearchParams();
  if (params.action) query.set("action", params.action);
  if (params.targetType) query.set("targetType", params.targetType);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await apiFetch(`/api/admin/audit-logs?${query.toString()}`);
  return res.json();
}

export async function downloadCsvExport(entity: "users" | "reports" | "audit-logs") {
  const token = typeof window !== "undefined" ? localStorage.getItem("chessverse-token") : null;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/admin/export/${entity}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to export data");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chessverse_${entity}_export.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
