import { apiFetch } from "../../lib/api";

export async function fetchFairPlayReviews(status: string = "needs_review") {
  const res = await apiFetch(`/api/admin/fair-play?status=${status}`);
  return res.json();
}

export async function fetchFairPlayReviewDetails(id: string) {
  const res = await apiFetch(`/api/admin/fair-play/${id}`);
  return res.json();
}

export async function applyFairPlayAction(id: string, action: "restrict" | "clear" | "warn", notes?: string) {
  const res = await apiFetch(`/api/admin/fair-play/${id}/action`, {
    method: "POST",
    body: JSON.stringify({ action, notes }),
  });
  return res.json();
}
