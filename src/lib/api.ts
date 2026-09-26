export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

let authInitPromise: Promise<string | null> | null = null;

export async function ensureAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const existingToken = localStorage.getItem("chessverse-token");
  if (existingToken) return existingToken;

  if (authInitPromise) return authInitPromise;

  authInitPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "Dharmapada" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem("chessverse-token", data.token);
          return data.token;
        }
      }
    } catch (err) {
      console.error("Auto auth error:", err);
    } finally {
      authInitPromise = null;
    }
    return null;
  })();

  return authInitPromise;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
) {
  let token =
    typeof window !== "undefined"
      ? localStorage.getItem("chessverse-token")
      : null;

  if (!token && typeof window !== "undefined") {
    token = await ensureAuthToken();
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...options.headers,
      },
    },
  );

  // Auto-recover on 401 by getting fresh token and retrying once
  if (response.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("chessverse-token");
    const freshToken = await ensureAuthToken();
    if (freshToken) {
      return fetch(`${API_URL}${path}`, {
        credentials: "include",
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${freshToken}`,
          ...options.headers,
        },
      });
    }
  }

  return response;
}
