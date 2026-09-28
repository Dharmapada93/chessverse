const PRODUCTION_RENDER_API = "https://chessverse-backend-g26z.onrender.com";

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes("api.chessverse.app")) {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        return envUrl.replace(/\/+$/, "");
      }
      if (envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
        return PRODUCTION_RENDER_API;
      }
    }
    return envUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return PRODUCTION_RENDER_API;
    }
  }

  return process.env.NODE_ENV === "production" ? PRODUCTION_RENDER_API : "http://localhost:4000";
}

export const API_URL = getApiBaseUrl();

let authInitPromise: Promise<string | null> | null = null;

export async function ensureAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const existingToken = localStorage.getItem("chessverse-token");
  if (existingToken) return existingToken;

  if (authInitPromise) return authInitPromise;

  authInitPromise = (async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/demo`, {
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

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;

  try {
    const response = await fetch(
      url,
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
        return fetch(`${baseUrl}${path}`, {
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
  } catch (err) {
    // If direct fetch threw a network error and we are on a browser, try relative rewrite path /api/... as fallback
    if (typeof window !== "undefined" && path.startsWith("/api/")) {
      try {
        return await fetch(path, {
          credentials: "include",
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
          },
        });
      } catch {
        // Fall through to re-throw original error
      }
    }
    throw err;
  }
}
