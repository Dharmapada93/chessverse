import { apiFetch } from "../../lib/api";
import type { AdminAnalytics } from "./types";

export async function fetchAdminAnalytics(range: string = "7d"): Promise<{
  success: boolean;
  range: string;
  aggregates: AdminAnalytics["aggregates"];
  timeControlBreakdown: AdminAnalytics["timeControlBreakdown"];
}> {
  const res = await apiFetch(`/api/admin/analytics?range=${range}`);
  return res.json();
}
