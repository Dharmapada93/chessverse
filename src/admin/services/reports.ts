import { apiFetch } from "../../lib/api";
import type { AdminReport } from "./types";

export interface ReportsResponse {
  success: boolean;
  reports: AdminReport[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReportDetailsResponse {
  success: boolean;
  report: AdminReport;
  priorReports: AdminReport[];
}

export async function fetchAdminReports(params: {
  status?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ReportsResponse> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await apiFetch(`/api/admin/reports?${query.toString()}`);
  return res.json();
}

export async function fetchAdminReportDetails(id: string): Promise<ReportDetailsResponse> {
  const res = await apiFetch(`/api/admin/reports/${id}`);
  return res.json();
}

export async function addReportNote(id: string, note: string) {
  const res = await apiFetch(`/api/admin/reports/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
  return res.json();
}

export async function applyReportAction(
  id: string,
  action: "warn" | "suspend" | "ban" | "dismiss",
  notes?: string,
  suspensionHours?: number
) {
  const res = await apiFetch(`/api/admin/reports/${id}/action`, {
    method: "POST",
    body: JSON.stringify({ action, notes, suspensionHours }),
  });
  return res.json();
}
