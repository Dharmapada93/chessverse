import { apiFetch } from "../../lib/api";
import type { AdminGame } from "./types";

export interface GamesResponse {
  success: boolean;
  games: AdminGame[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GameDetailsResponse {
  success: boolean;
  game: AdminGame;
  telemetry: any[];
}

export async function fetchAdminGames(params: {
  status?: string;
  page?: number;
  limit?: number;
} = {}): Promise<GamesResponse> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await apiFetch(`/api/admin/games?${query.toString()}`);
  return res.json();
}

export async function fetchAdminGameDetails(id: string): Promise<GameDetailsResponse> {
  const res = await apiFetch(`/api/admin/games/${id}`);
  return res.json();
}

export async function terminateGame(id: string, reason: string) {
  const res = await apiFetch(`/api/admin/games/${id}/terminate`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return res.json();
}
