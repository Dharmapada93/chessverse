import { apiFetch } from "../../lib/api";

export async function fetchAdminAiStats() {
  const res = await apiFetch("/api/admin/ai/stats");
  return res.json();
}

export async function fetchAdminAiFailures() {
  const res = await apiFetch("/api/admin/ai/failures");
  return res.json();
}

export async function updateAdminAiSettings(settings: {
  maxDepth?: number;
  maxDurationSec?: number;
  queueConcurrency?: number;
  rateLimitPerMin?: number;
}) {
  const res = await apiFetch("/api/admin/ai/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  });
  return res.json();
}
