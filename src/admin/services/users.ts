import { apiFetch } from "../../lib/api";
import type { AdminUser } from "./types";

export interface UsersResponse {
  success: boolean;
  users: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserDetailsResponse {
  success: boolean;
  user: AdminUser;
  stats: {
    gamesPlayed: number;
    reportsAgainstCount: number;
  };
  recentGames: any[];
  reportsAgainst: any[];
  auditHistory: any[];
}

export async function fetchAdminUsers(params: {
  search?: string;
  filter?: string;
  page?: number;
  limit?: number;
} = {}): Promise<UsersResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.filter) query.set("filter", params.filter);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await apiFetch(`/api/admin/users?${query.toString()}`);
  return res.json();
}

export async function fetchAdminUserDetails(id: string): Promise<UserDetailsResponse> {
  const res = await apiFetch(`/api/admin/users/${id}`);
  return res.json();
}

export async function suspendUser(id: string, reason: string, durationHours: number = 24) {
  const res = await apiFetch(`/api/admin/users/${id}/suspend`, {
    method: "POST",
    body: JSON.stringify({ reason, durationHours }),
  });
  return res.json();
}

export async function unsuspendUser(id: string) {
  const res = await apiFetch(`/api/admin/users/${id}/unsuspend`, {
    method: "POST",
  });
  return res.json();
}

export async function banUser(id: string, reason: string) {
  const res = await apiFetch(`/api/admin/users/${id}/ban`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return res.json();
}

export async function unbanUser(id: string) {
  const res = await apiFetch(`/api/admin/users/${id}/unban`, {
    method: "POST",
  });
  return res.json();
}

export async function deleteUser(id: string) {
  const res = await apiFetch(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
